import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionTransactionDto {
  @ApiProperty({ description: 'Type d\'abonnement', required: false })
  @IsString()
  @IsOptional()
  subscriptionType?: string;

  @ApiProperty({ description: 'Montant de la transaction', required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ description: 'Méthode de paiement', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ description: 'Date de la transaction', required: false })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Date de début de l\'abonnement', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Date de fin de l\'abonnement', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Statut de la transaction', enum: ['pending', 'completed', 'failed', 'refunded'], required: false })
  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Notes sur la transaction', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
} 