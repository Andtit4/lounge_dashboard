import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lounge } from '../../lounges/entities/lounge.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => Lounge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loungeId' })
  lounge: Lounge;

  @Column({ type: 'varchar', length: 36 })
  loungeId: string;

  @Column({ type: 'datetime' })
  bookingDate: Date;

  @Column()
  numberOfGuests: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  specialRequests: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ default: false })
  isPaid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
