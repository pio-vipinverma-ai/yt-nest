
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
// import * as cookieParser from 'cookie-parser';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('sdfsfssdf');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(cookieParser());

  // ✅ Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrc: [`'self'`, 'https://cdn.jsdelivr.net'],
          imgSrc: [`'self'`, 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ CORS
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'Accept',
      'Origin',
      'Range'
    ],
    exposedHeaders: ["Content-Length", "Content-Range"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
