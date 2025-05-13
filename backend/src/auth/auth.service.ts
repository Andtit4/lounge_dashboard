import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.validateUser(email, password);

      // Vérifier si l'utilisateur est admin (via isAdmin ou role='admin')
      const isUserAdmin = user.isAdmin === true || user.role === 'admin';

      // Création du payload JWT
      const payload = {
        sub: user.id,
        email: user.email,
        isAdmin: isUserAdmin, // Mettre isAdmin à true si le rôle est admin
        role: user.role,
      };

      // Génération du token
      const token = this.jwtService.sign(payload);

      // Ne pas renvoyer le mot de passe dans la réponse
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _userPass, ...userInfo } = user;

      // Si l'utilisateur est admin (via l'un ou l'autre flag), rediriger vers le dashboard
      const redirect = isUserAdmin ? '/dashboard' : '/lounges';

      return {
        user: {
          ...userInfo,
          isAdmin: isUserAdmin, // S'assurer que isAdmin est cohérent avec le rôle
        },
        token,
        redirect,
      };
    } catch (_error) {
      throw new UnauthorizedException('Identifiants invalides');
    }
  }

  async signup(createUserDto: CreateUserDto) {
    try {
      // Par défaut, les nouveaux utilisateurs ne sont pas administrateurs
      const userData = {
        ...createUserDto,
        isAdmin: createUserDto.role === 'admin' || createUserDto.isAdmin === true,
        role: createUserDto.role || 'user',
      };

      // Créer l'utilisateur
      const newUser = await this.usersService.create(userData);

      // Vérifier si l'utilisateur est admin (via isAdmin ou role='admin')
      const isUserAdmin = newUser.isAdmin === true || newUser.role === 'admin';

      // Générer un token JWT
      const payload = {
        sub: newUser.id,
        email: newUser.email,
        isAdmin: isUserAdmin,
        role: newUser.role,
      };

      const token = this.jwtService.sign(payload);

      // Ne pas renvoyer le mot de passe dans la réponse
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _userPass, ...userInfo } = newUser;

      // Redirection en fonction du rôle administrateur
      const redirect = isUserAdmin ? '/dashboard' : '/lounges';

      return {
        user: {
          ...userInfo,
          isAdmin: isUserAdmin, // S'assurer que isAdmin est cohérent avec le rôle
        },
        token,
        redirect,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new Error("Erreur lors de l'inscription: " + error.message);
      } else {
        throw new Error("Erreur inconnue lors de l'inscription");
      }
    }
  }
}
