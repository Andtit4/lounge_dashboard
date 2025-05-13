import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../users/entities/user.entity';

export const Roles = {
  ADMIN: 'admin',
  USER: 'user',
};

export const ROLES_KEY = 'roles';

export function Role(...roles: string[]) {
  return function (target: any, key?: string, descriptor?: any) {
    if (descriptor) {
      Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(ROLES_KEY, roles, target);
    return target;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Pas de rôle requis, accès autorisé
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    const hasRequiredRole = this.matchRoles(requiredRoles, user);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        "Vous n'avez pas les droits nécessaires pour accéder à cette ressource",
      );
    }

    return true;
  }

  private matchRoles(requiredRoles: string[], user: User): boolean {
    if (requiredRoles.includes(Roles.ADMIN) && user.isAdmin) {
      return true;
    }

    if (requiredRoles.includes(Roles.USER)) {
      return true; // Tous les utilisateurs authentifiés sont des USER
    }

    return false;
  }
}
