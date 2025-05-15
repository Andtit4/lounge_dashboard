import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('lounges')
export class Lounge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  airport: string;

  @Column()
  country: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  classicDiscountPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  premiumDiscountPrice: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('text', { nullable: true })
  amenities: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.lounge)
  bookings: Booking[];
}
