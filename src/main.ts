
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { VideoService } from './video/video.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const videoService = app.get(VideoService);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range',
    );
    res.header(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Range',
    );

    next();
  });  

  app.useStaticAssets(
    join(process.cwd(), 'storage', 'hls'),
    {
      prefix: '/live',
    },
  );

  
  app.useStaticAssets(
    join(process.cwd(), 'src', 'assets'),
    {
      prefix: '/assets',
    },
  );



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

  // app.enableCors({
  //   origin: (origin, callback) => {
  //     if (!origin || allowedOrigins.includes(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   },
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: [
  //     'Content-Type',
  //     'Authorization',
  //     'X-Requested-With',
  //     'X-CSRF-Token',
  //     'Accept',
  //     'Origin',
  //     'Range'
  //   ],
  //   exposedHeaders: ["Content-Length", "Content-Range"],
  //   credentials: true,
  //   preflightContinue: false,
  //   optionsSuccessStatus: 204,
  // });

  
  app.enableCors({
    origin: true,
    credentials: true,
  });


  await videoService.startLiveStream();

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Live HLS playlist available at http://localhost:${port}/live/index.m3u8`);
}

bootstrap();
