import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../users/entities/user.entity';

export const SUBSCRIPTION_KEY = 'requires_subscription';

export function RequiresSubscription() {
  return function (target: any, key?: string, descriptor?: any) {
    if (descriptor) {
      Reflect.defineMetadata(SUBSCRIPTION_KEY, true, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(SUBSCRIPTION_KEY, true, target);
    return target;
  };
}

export function RequiresSubscriptionType(type: string) {
  return function (target: any, key?: string, descriptor?: any) {
    if (descriptor) {
      Reflect.defineMetadata(SUBSCRIPTION_KEY, type, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(SUBSCRIPTION_KEY, type, target);
    return target;
  };
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresSubscription = this.reflector.getAllAndOverride<
      string | boolean
    >(SUBSCRIPTION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiresSubscription) {
      return true; // Pas d'abonnement requis, accès autorisé
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier si l'abonnement est actif
    if (!this.hasActiveSubscription(user)) {
      throw new ForbiddenException(
        'Vous devez avoir un abonnement actif pour accéder à cette ressource',
      );
    }

    // Si un type d'abonnement spécifique est requis
    if (
      typeof requiresSubscription === 'string' &&
      !this.hasSubscriptionType(user, requiresSubscription)
    ) {
      throw new ForbiddenException(
        `Vous devez avoir un abonnement de type "${requiresSubscription}" pour accéder à cette ressource`,
      );
    }

    return true;
  }

  private hasActiveSubscription(user: User): boolean {
    if (!user.subscriptionType || !user.subscriptionExpiryDate) {
      return false;
    }

    return new Date(user.subscriptionExpiryDate) > new Date();
  }

  private hasSubscriptionType(user: User, requiredType: string): boolean {
    return user.subscriptionType === requiredType;
  }
}
