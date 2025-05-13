import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionTransactionDto {
  @ApiProperty({ description: 'ID de l\'utilisateur' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Type d\'abonnement' })
  @IsString()
  subscriptionType: string;

  @ApiProperty({ description: 'Montant de la transaction' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Méthode de paiement' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Date de la transaction', required: false })
  @IsDateString()
  @IsOptional()
  transactionDate?: string;

  @ApiProperty({ description: 'Date de début de l\'abonnement' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Date de fin de l\'abonnement' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Statut de la transaction', enum: ['pending', 'completed', 'failed', 'refunded'], required: false })
  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Notes sur la transaction', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
} 