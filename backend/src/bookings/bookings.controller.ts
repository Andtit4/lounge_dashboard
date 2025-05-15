import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Role, Roles } from '../middlewares/role.guard';
import {
  SubscriptionGuard,
  RequiresSubscription,
} from '../middlewares/subscription.guard';

@ApiTags('bookings')
@Controller('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(SubscriptionGuard)
  @RequiresSubscription()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking successfully created.' })
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    createBookingDto.userId = req.user.id;
    return this.bookingsService.create(createBookingDto);
  }

  @Get('user')
  @UseGuards(RolesGuard)
  @Role(Roles.USER)
  @ApiOperation({ summary: 'Get bookings of the connected user' })
  @ApiResponse({ status: 200, description: 'Return user bookings.' })
  findUserBookings(@Request() req) {
    return this.bookingsService.findByUser(req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Role(Roles.USER)
  @ApiOperation({ summary: 'Get all bookings or bookings by user or lounge' })
  @ApiResponse({
    status: 200,
    description: 'Return all bookings or filtered bookings.',
  })
  findAll(
    @Query('userId') userId?: string,
    @Query('loungeId') loungeId?: string,
  ) {
    if (userId) {
      return this.bookingsService.findByUser(userId);
    }
    if (loungeId) {
      return this.bookingsService.findByLounge(loungeId);
    }
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Role(Roles.USER)
  @ApiOperation({ summary: 'Get a booking by id' })
  @ApiResponse({ status: 200, description: 'Return the booking.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Role(Roles.USER)
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully updated.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Role(Roles.USER)
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiOperation({ summary: 'Confirm a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully confirmed.' })
  @ApiResponse({
    status: 400,
    description: 'Booking is not in pending status.',
  })
  confirmBooking(@Param('id') id: string) {
    return this.bookingsService.confirmBooking(id);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Role(Roles.USER)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully cancelled.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel a completed booking.',
  })
  cancelBooking(@Param('id') id: string) {
    return this.bookingsService.cancelBooking(id);
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiOperation({ summary: 'Complete a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully completed.' })
  @ApiResponse({
    status: 400,
    description: 'Booking must be confirmed before completion.',
  })
  completeBooking(@Param('id') id: string) {
    return this.bookingsService.completeBooking(id);
  }
}
