import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoungesService } from './lounges.service';
import { LoungesController } from './lounges.controller';
import { Lounge } from './entities/lounge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lounge])],
  controllers: [LoungesController],
  providers: [LoungesService],
  exports: [LoungesService],
})
export class LoungesModule {}
