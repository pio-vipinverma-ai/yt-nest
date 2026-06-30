import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './todo/todo.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { Todo } from './todo/entities/todo.entity';
import { User } from './user/entities/user.entity';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { VideoModule } from './video/video.module';



@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 600000,
          limit: 1000000,
        },
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 600, // Cache for 10 minutes
      max: 100, // Maximum number of items in cache
    }),
    // Configure TypeORM with PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'todo_db'),
        entities: [Todo, User],
        synchronize: configService.get('NODE_ENV') === 'development', // Only in development
        logging: configService.get('NODE_ENV') === 'development',
        ssl: false, // Enable for production with SSL,
      }),
      inject: [ConfigService],
    }),
    TodoModule,
    AuthModule,
    UserModule,
    VideoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
