import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService
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

    if (
      subscriptionExpiryDate !== null &&
      subscriptionExpiryDate !== undefined
    ) {
      user.subscriptionExpiryDate = subscriptionExpiryDate;
    }

    const newUser = await this.usersRepository.save(user);

    // Envoyer un email de bienvenue
    try {
      const emailResult = await this.emailService.sendWelcomeEmail(
        newUser.email,
        newUser.firstName,
        newUser.lastName
      );
      
      if (emailResult) {
        this.logger.log(`Email de bienvenue envoyé à ${newUser.email}`);
      } else {
        this.logger.warn(`Échec de l'envoi de l'email de bienvenue à ${newUser.email}`);
      }
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de bienvenue: ${error.message}`);
      // Ne pas bloquer la création de l'utilisateur si l'envoi d'email échoue
    }

    return newUser;
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

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<User> {
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
