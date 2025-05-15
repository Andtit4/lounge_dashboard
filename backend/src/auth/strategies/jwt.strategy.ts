import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'votre_secret_jwt_a_changer', // Doit correspondre au secret dans auth.module.ts
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    // On retire le mot de passe et renvoi l'utilisateur
    const { password, ...result } = user;

    // S'assurer que isAdmin est correctement défini
    result.isAdmin =
      result.isAdmin === true ||
      result.role === 'admin' ||
      payload.isAdmin === true;

    // Log pour déboguer
    console.log('JWT validation:', {
      userId: result.id,
      email: result.email,
      isAdmin: result.isAdmin,
      role: result.role,
      payloadIsAdmin: payload.isAdmin,
    });

    return result;
  }
}
