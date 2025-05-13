import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const { 
      password, 
      subscriptionType, 
      subscriptionExpiryDate, 
      ...otherProps 
    } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      ...otherProps,
      password: hashedPassword,
    });

    if (subscriptionType !== null && subscriptionType !== undefined) {
      user.subscriptionType = subscriptionType;
    }
    
    if (subscriptionExpiryDate !== null && subscriptionExpiryDate !== undefined) {
      user.subscriptionExpiryDate = subscriptionExpiryDate;
    }

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const { 
      password, 
      subscriptionType, 
      subscriptionExpiryDate, 
      ...otherProps 
    } = updateUserDto;

    Object.assign(user, otherProps);

    if (subscriptionType === undefined) {
      // Ne rien faire, conserver la valeur actuelle
    } else if (subscriptionType === null) {
      user.subscriptionType = null;
    } else {
      user.subscriptionType = subscriptionType;
    }

    if (subscriptionExpiryDate === undefined) {
      // Ne rien faire, conserver la valeur actuelle
    } else if (subscriptionExpiryDate === null) {
      user.subscriptionExpiryDate = null;
    } else {
      user.subscriptionExpiryDate = subscriptionExpiryDate;
    }

    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }
    
    return user;
  }
} 