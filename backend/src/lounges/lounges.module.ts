import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoungesService } from './lounges.service';
import { LoungesController } from './lounges.controller';
import { Lounge } from './entities/lounge.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lounge]), UploadsModule],
  controllers: [LoungesController],
  providers: [LoungesService],
  exports: [LoungesService],
})
export class LoungesModule {}
