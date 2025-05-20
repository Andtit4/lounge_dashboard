import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtenir les origines autorisées depuis les variables d'environnement ou utiliser des valeurs par défaut
  // Vérifier à la fois CORS_ORIGIN et CORS_ORIGINS pour compatibilité
  const corsOriginsEnv = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS;
  const corsOrigins = corsOriginsEnv
    ? corsOriginsEnv.split(',')
    : [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:6611',
      ];

  // Ajouter les origines de développement en mode dev
  if (process.env.NODE_ENV !== 'production') {
    corsOrigins.push(
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:6611',
    );
  }

  // Ajouter explicitement l'URL du client actuel
  if (!corsOrigins.includes('http://localhost:6611')) {
    corsOrigins.push('http://localhost:6611');
  }

  console.log('CORS origins configured:', corsOrigins);

  // Activer CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 6610);
}
bootstrap();
