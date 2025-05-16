import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour permettre les requêtes depuis le frontend
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:4173', 
      'http://185.97.146.99:6611',
      'https://185.97.146.99:6611',
      'http://185-97-146-99.nip.io:6611'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 6610);
}
bootstrap();
