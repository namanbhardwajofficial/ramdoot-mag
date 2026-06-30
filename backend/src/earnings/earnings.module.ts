import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EarningsController } from './earnings.controller';
import { EarningsService } from './earnings.service';
import { Conversion } from '../campaigns/entities/conversion.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Payout } from './entities/payout.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversion, BankAccount, Payout, Campaign])],
  controllers: [EarningsController],
  providers: [EarningsService],
  exports: [EarningsService],
})
export class EarningsModule {}
