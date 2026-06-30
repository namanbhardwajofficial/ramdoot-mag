import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { User } from '../users/entities/user.entity';
import { EmailOtp } from './entities/email-otp.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { SignupStep1Dto } from './dto/signup-step1.dto';
import { SignupStep2Dto } from './dto/signup-step2.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, UserStatus, OtpPurpose } from '../common/enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(EmailOtp)
    private emailOtpRepo: Repository<EmailOtp>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async signupStep1(dto: SignupStep1Dto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email is already registered');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user immediately with a placeholder password so we have a userId for the OTP
    const salt = await bcrypt.genSalt(12);
    const placeholderHash = await bcrypt.hash(nanoid(20), salt);

    const user = await (this.userRepo.save({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone ?? undefined,
      countryCode: dto.countryCode ?? undefined,
      passwordHash: placeholderHash,
      role: UserRole.USER,
      status: UserStatus.INACTIVE,
      referralCode: 'RMD' + nanoid(8).toUpperCase(),
    }) as Promise<User>);

    await (this.emailOtpRepo.save({
      userId: user.id,
      otp,
      purpose: OtpPurpose.SIGNUP,
      expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000),
    }) as Promise<EmailOtp>);

    this.logger.log(`OTP for ${dto.email}: ${otp}`);

    return {
      message: 'OTP sent to your email',
      email: dto.email,
      userId: user.id,
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
  }

  async signupStep2(dto: SignupStep2Dto) {
    const otpRecord = await this.emailOtpRepo.findOne({
      where: {
        otp: dto.otp,
        purpose: OtpPurpose.SIGNUP,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(User).update(otpRecord.userId, {
        passwordHash,
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
      });
      await manager.getRepository(EmailOtp).update(otpRecord.id, { isUsed: true });
    });

    const user = await this.userRepo.findOne({ where: { id: otpRecord.userId } });
    if (!user) throw new BadRequestException('User not found');

    const tokens = await this.generateTokens(user.id, user.email, user.role, false);

    return {
      message: 'Account created successfully',
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      ...tokens,
    };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('User not found');

    const otpRecord = await this.emailOtpRepo.findOne({
      where: {
        userId: user.id,
        otp,
        purpose: OtpPurpose.SIGNUP,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

    await this.emailOtpRepo.update(otpRecord.id, { isUsed: true });
    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('Account is not active');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid email or password');

    await this.userRepo.update(user.id, { lastLoginAt: new Date() });
    const tokens = await this.generateTokens(user.id, user.email, user.role, dto.rememberMe || false);

    return {
      message: 'Login successful',
      user: {
        id: user.id, email: user.email, fullName: user.fullName,
        role: user.role, avatarUrl: user.avatarUrl, phone: user.phone,
        isEmailVerified: user.isEmailVerified,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.refreshTokenRepo.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!stored || stored.expiresAt < new Date()) throw new UnauthorizedException('Invalid or expired refresh token');

    await this.refreshTokenRepo.update(stored.id, { isRevoked: true });
    const tokens = await this.generateTokens(stored.user.id, stored.user.email, stored.user.role, false);

    return { message: 'Tokens refreshed', ...tokens };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return { message: 'If the email exists, an OTP has been sent' };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await (this.emailOtpRepo.save({
      userId: user.id, otp, purpose: OtpPurpose.PASSWORD_RESET,
      expiresAt: new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000),
    }) as Promise<EmailOtp>);

    this.logger.log(`Password reset OTP for ${email}: ${otp}`);
    return { message: 'If the email exists, an OTP has been sent', ...(process.env.NODE_ENV === 'development' && { otp }) };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid request');

    const otpRecord = await this.emailOtpRepo.findOne({
      where: { userId: user.id, otp, purpose: OtpPurpose.PASSWORD_RESET, isUsed: false, expiresAt: MoreThan(new Date()) },
    });
    if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(User).update(user.id, { passwordHash });
      await manager.getRepository(EmailOtp).update(otpRecord.id, { isUsed: true });
    });

    return { message: 'Password reset successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string, rememberMe: boolean) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshExpiresIn = rememberMe
      ? this.configService.get<string>('JWT_REMEMBER_EXPIRES_IN') || '30d'
      : this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { secret: this.configService.get<string>('JWT_REFRESH_SECRET'), expiresIn: refreshExpiresIn },
    );

    const expiresAt = new Date();
    expiresAt.setMilliseconds(expiresAt.getMilliseconds() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));

    await (this.refreshTokenRepo.save({
      userId, token: refreshToken, expiresAt,
    }) as Promise<RefreshToken>);

    return { accessToken, refreshToken };
  }
}
