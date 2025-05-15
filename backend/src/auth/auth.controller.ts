import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';

class LoginDto {
  email: string;
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({
    type: LoginDto,
    description: 'Identifiants de connexion',
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          password: 'password123',
        },
        summary: "Exemple d'identifiants de connexion",
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isAdmin: { type: 'boolean' },
            subscriptionType: { type: 'string', nullable: true },
            subscriptionExpiryDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
        },
        token: { type: 'string' },
        redirect: {
          type: 'string',
          description:
            "Chemin de redirection basé sur le rôle de l'utilisateur",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Inscription utilisateur' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isAdmin: { type: 'boolean', default: false },
            subscriptionType: { type: 'string', nullable: true },
            subscriptionExpiryDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
        },
        token: { type: 'string' },
        redirect: {
          type: 'string',
          description: 'Chemin de redirection vers la liste des salons',
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }
}
