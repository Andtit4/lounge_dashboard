import { PartialType } from '@nestjs/swagger';
import { CreateLoungeDto } from './create-lounge.dto';

export class UpdateLoungeDto extends PartialType(CreateLoungeDto) {}
