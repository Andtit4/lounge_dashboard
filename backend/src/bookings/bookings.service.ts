import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { UsersService } from '../users/users.service';
import { LoungesService } from '../lounges/lounges.service';
import { CreateBookingDto, BookingStatus } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private usersService: UsersService,
    private loungesService: LoungesService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { userId, loungeId, ...bookingData } = createBookingDto;

    const user = await this.usersService.findOne(userId);
    const lounge = await this.loungesService.findOne(loungeId);

    const booking = this.bookingsRepository.create({
      ...bookingData,
      user,
      lounge,
    });

    return await this.bookingsRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      relations: ['user', 'lounge'],
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['user', 'lounge'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findByUser(userId: string): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      where: { user: { id: userId } },
      relations: ['lounge'],
    });
  }

  async findByLounge(loungeId: string): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      where: { lounge: { id: loungeId } },
      relations: ['user'],
    });
  }

  async update(
    id: string,
    updateBookingDto: Partial<CreateBookingDto>,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    Object.assign(booking, updateBookingDto);
    return await this.bookingsRepository.save(booking);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingsRepository.remove(booking);
  }

  async confirmBooking(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not in pending status');
    }
    booking.status = BookingStatus.CONFIRMED;
    return await this.bookingsRepository.save(booking);
  }

  async cancelBooking(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    booking.status = BookingStatus.CANCELLED;
    return await this.bookingsRepository.save(booking);
  }

  async completeBooking(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Booking must be confirmed before completion',
      );
    }
    booking.status = BookingStatus.COMPLETED;
    return await this.bookingsRepository.save(booking);
  }
}
