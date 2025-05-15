import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionTransaction } from './entities/subscription-transaction.entity';
import { UsersService } from '../users/users.service';
import {
  CreateSubscriptionDto,
  SubscriptionType,
} from './dto/create-subscription.dto';
import { CreateSubscriptionTransactionDto } from './dto/create-subscription-transaction.dto';
import { UpdateSubscriptionTransactionDto } from './dto/update-subscription-transaction.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionTransaction)
    private transactionsRepository: Repository<SubscriptionTransaction>,
    private usersService: UsersService,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    const { userId, ...subscriptionData } = createSubscriptionDto;
    const user = await this.usersService.findOne(userId);

    const subscription = this.subscriptionsRepository.create({
      ...subscriptionData,
      user,
    });

    return await this.subscriptionsRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionsRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return await this.subscriptionsRepository.find({
      where: { user: { id: userId } },
    });
  }

  async update(
    id: string,
    updateSubscriptionDto: Partial<CreateSubscriptionDto>,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);
    Object.assign(subscription, updateSubscriptionDto);
    return await this.subscriptionsRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionsRepository.remove(subscription);
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    if (!subscription.isActive) {
      throw new BadRequestException('Subscription is already inactive');
    }
    subscription.isActive = false;

    // Mettre à jour le type d'abonnement de l'utilisateur en spécifiant null
    await this.usersService.update(subscription.user.id, {
      subscriptionType: null,
      subscriptionExpiryDate: null,
    });

    return await this.subscriptionsRepository.save(subscription);
  }

  async checkStatus(
    id: string,
  ): Promise<{ isActive: boolean; daysRemaining: number }> {
    const subscription = await this.findOne(id);
    const now = new Date();
    const endDate = new Date(subscription.endDate);

    const isActive = endDate > now;
    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      isActive,
      daysRemaining: isActive ? daysRemaining : 0,
    };
  }

  // Méthodes pour les transactions d'abonnement

  async createTransaction(
    createDto: CreateSubscriptionTransactionDto,
  ): Promise<SubscriptionTransaction> {
    const { userId, ...transactionData } = createDto;
    const user = await this.usersService.findOne(userId);

    // Utilisez la date de transaction fournie ou la date actuelle
    const transactionDate = transactionData.transactionDate
      ? new Date(transactionData.transactionDate)
      : new Date();

    // S'assurer que subscriptionType est une chaîne simple
    const subscriptionType = this.normalizeSubscriptionType(
      transactionData.subscriptionType,
    );

    const transaction = this.transactionsRepository.create({
      userId,
      subscriptionType,
      amount: transactionData.amount,
      paymentMethod: transactionData.paymentMethod,
      transactionDate,
      startDate: new Date(transactionData.startDate),
      endDate: new Date(transactionData.endDate),
      status: transactionData.status || 'completed',
      notes: transactionData.notes,
    });

    // Mettre à jour les informations d'abonnement de l'utilisateur
    await this.usersService.update(userId, {
      subscriptionType: subscriptionType,
      subscriptionExpiryDate: new Date(transactionData.endDate),
    });

    return await this.transactionsRepository.save(transaction);
  }

  // Méthode utilitaire pour normaliser le type d'abonnement
  private normalizeSubscriptionType(subscriptionType: any): string {
    if (typeof subscriptionType === 'object' && subscriptionType !== null) {
      // Si c'est un objet, extraire la valeur
      return subscriptionType.value || '';
    }
    // Sinon retourner tel quel
    return typeof subscriptionType === 'string' ? subscriptionType : '';
  }

  async findAllTransactions(): Promise<SubscriptionTransaction[]> {
    return await this.transactionsRepository.find({
      order: { transactionDate: 'DESC' },
    });
  }

  async findTransactionsByUser(
    userId: string,
  ): Promise<SubscriptionTransaction[]> {
    return await this.transactionsRepository.find({
      where: { userId },
      order: { transactionDate: 'DESC' },
    });
  }

  async findOneTransaction(id: string): Promise<SubscriptionTransaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Subscription transaction not found');
    }

    return transaction;
  }

  async updateTransaction(
    id: string,
    updateDto: UpdateSubscriptionTransactionDto,
  ): Promise<SubscriptionTransaction> {
    const transaction = await this.findOneTransaction(id);

    // Créer des copies pour ne pas modifier l'objet original
    const updatedTransaction = { ...transaction };

    // Convertir les dates si elles sont fournies
    if (updateDto.transactionDate) {
      updatedTransaction.transactionDate = new Date(updateDto.transactionDate);
    }
    if (updateDto.startDate) {
      updatedTransaction.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updatedTransaction.endDate = new Date(updateDto.endDate);
    }

    // Copier les autres propriétés
    if (updateDto.subscriptionType) {
      updatedTransaction.subscriptionType = this.normalizeSubscriptionType(
        updateDto.subscriptionType,
      );
    }
    if (updateDto.amount) {
      updatedTransaction.amount = updateDto.amount;
    }
    if (updateDto.paymentMethod) {
      updatedTransaction.paymentMethod = updateDto.paymentMethod;
    }
    if (updateDto.status) {
      updatedTransaction.status = updateDto.status;
    }
    if (updateDto.notes !== undefined) {
      updatedTransaction.notes = updateDto.notes;
    }

    // Si le statut est 'completed', mettre à jour l'abonnement de l'utilisateur
    if (
      updateDto.status === 'completed' ||
      transaction.status === 'completed'
    ) {
      const updateUserData: any = {};

      if (updateDto.subscriptionType) {
        updateUserData.subscriptionType = this.normalizeSubscriptionType(
          updateDto.subscriptionType,
        );
      }
      if (updateDto.endDate) {
        updateUserData.subscriptionExpiryDate = new Date(updateDto.endDate);
      }

      if (Object.keys(updateUserData).length > 0) {
        await this.usersService.update(transaction.userId, updateUserData);
      }
    }

    return await this.transactionsRepository.save(updatedTransaction);
  }

  async removeTransaction(id: string): Promise<void> {
    const transaction = await this.findOneTransaction(id);
    await this.transactionsRepository.remove(transaction);
  }
}
