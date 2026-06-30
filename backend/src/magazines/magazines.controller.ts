import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards, UseInterceptors,
  UploadedFiles, MaxFileSizeValidator, ParseFilePipe, FileTypeValidator,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MagazinesService } from './magazines.service';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { PublishMagazineDto } from './dto/publish-magazine.dto';
import { MagazineQueryDto } from './dto/magazine-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../common/enums';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Magazines')
@Controller('magazines')
export class MagazinesController {
  constructor(private readonly magazinesService: MagazinesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a new magazine entry' })
  async create(
    @Body() dto: CreateMagazineDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.magazinesService.create(dto, user.id);
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload PDF and cover image for a magazine' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const name = uuidv4() + extname(file.originalname);
          cb(null, name);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadFiles(
    @Body('magazineId') magazineId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let coverImageUrl: string | undefined;
    let pdfUrl: string | undefined;
    let pdfSize: number | undefined;

    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        coverImageUrl = `/uploads/${file.filename}`;
      } else if (file.mimetype === 'application/pdf') {
        pdfUrl = `/uploads/${file.filename}`;
        pdfSize = file.size;
      }
    }

    return this.magazinesService.uploadFiles(magazineId, coverImageUrl, pdfUrl, pdfSize);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all magazines with filters' })
  async findAll(@Query() query: MagazineQueryDto) {
    return this.magazinesService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get magazine by ID' })
  async findOne(@Param('id') id: string) {
    return this.magazinesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update magazine details' })
  async update(@Param('id') id: string, @Body() dto: UpdateMagazineDto) {
    return this.magazinesService.update(id, dto);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Publish a magazine' })
  async publish(
    @Param('id') id: string,
    @Body() dto: PublishMagazineDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.magazinesService.publish(id, dto, user.id);
  }
}
