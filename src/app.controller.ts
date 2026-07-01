import { Controller, Get, Logger, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  @CacheKey('my-key')
  @CacheTTL(10000) // Cache expiration time in milliseconds
  getHello(): string {
    this.logger.log('Incoming GET request to root endpoint');
    try {
      const result = this.appService.getHello();
      this.logger.log('Successfully retrieved hello message');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`Error in getHello: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
