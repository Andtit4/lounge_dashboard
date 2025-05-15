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
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'User already has an active subscription.',
  })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions or subscriptions by user' })
  @ApiResponse({
    status: 200,
    description: 'Return all subscriptions or user subscriptions.',
  })
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.subscriptionsService.findByUser(userId);
    }
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription by id' })
  @ApiResponse({ status: 200, description: 'Return the subscription.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription successfully cancelled.',
  })
  @ApiResponse({
    status: 400,
    description: 'Subscription is already inactive.',
  })
  cancelSubscription(@Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(id);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Check subscription status' })
  @ApiResponse({ status: 200, description: 'Return subscription status.' })
  checkSubscriptionStatus(@Param('id') id: string) {
    return this.subscriptionsService.checkStatus(id);
  }
}
