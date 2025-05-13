import { IsString, IsDate, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  loungeId: string;

  @ApiProperty()
  @IsDate()
  bookingDate: Date;

  @ApiProperty()
  @IsNumber()
  numberOfGuests: number;

  @ApiProperty({ enum: BookingStatus, default: BookingStatus.PENDING })
  @IsEnum(BookingStatus)
  status: BookingStatus = BookingStatus.PENDING;

  @ApiProperty({ required: false })
  @IsNumber()
  totalPrice?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;
} 