import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionTransactionsController } from './subscription-transactions.controller';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionTransaction } from './entities/subscription-transaction.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, SubscriptionTransaction]),
    UsersModule,
  ],
  controllers: [SubscriptionsController, SubscriptionTransactionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
