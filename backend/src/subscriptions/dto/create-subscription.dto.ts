import { IsString, IsDate, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionType {
  CLASSIC = 'CLASSIC',
  PREMIUM = 'PREMIUM',
}

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: SubscriptionType })
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @ApiProperty()
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsDate()
  endDate: Date;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean = true;
}
