import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { MagazinesController } from './magazines.controller';
import { MagazinesService } from './magazines.service';
import { Magazine } from './entities/magazine.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([Magazine, AuditLog]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          cb(null, uuidv4() + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
  controllers: [MagazinesController],
  providers: [MagazinesService],
  exports: [MagazinesService],
})
export class MagazinesModule {}
