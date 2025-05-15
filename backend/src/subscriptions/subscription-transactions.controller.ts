import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionTransactionDto } from './dto/create-subscription-transaction.dto';
import { UpdateSubscriptionTransactionDto } from './dto/update-subscription-transaction.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('subscription-transactions')
@Controller('subscription-transactions')
export class SubscriptionTransactionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction successfully created.',
  })
  createTransaction(
    @Body() createSubscriptionTransactionDto: CreateSubscriptionTransactionDto,
  ) {
    return this.subscriptionsService.createTransaction(
      createSubscriptionTransactionDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all subscription transactions or transactions by user',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all transactions or user transactions.',
  })
  findAllTransactions(@Query('userId') userId?: string) {
    if (userId) {
      return this.subscriptionsService.findTransactionsByUser(userId);
    }
    return this.subscriptionsService.findAllTransactions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription transaction by id' })
  @ApiResponse({ status: 200, description: 'Return the transaction.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  findOneTransaction(@Param('id') id: string) {
    return this.subscriptionsService.findOneTransaction(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  updateTransaction(
    @Param('id') id: string,
    @Body() updateSubscriptionTransactionDto: UpdateSubscriptionTransactionDto,
  ) {
    return this.subscriptionsService.updateTransaction(
      id,
      updateSubscriptionTransactionDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  removeTransaction(@Param('id') id: string) {
    return this.subscriptionsService.removeTransaction(id);
  }
}
