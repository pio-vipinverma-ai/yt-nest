import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

/**
 * Auth Controller
 * Handles authentication endpoints
 */
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Incoming register request for email: ${registerDto.email}`);
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log(`Successfully registered user: ${registerDto.email}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`Registration failed for email: ${registerDto.email}, Error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Incoming login request for email: ${loginDto.email}`);
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log(`Successfully logged in user: ${loginDto.email}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Login failed for email: ${loginDto.email}, Error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get current user profile
   * GET /auth/me
   * Requires authentication
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    this.logger.log(`Fetching profile for user: ${user.id}`);
    try {
      const { password: _, ...userWithoutPassword } = user;
      this.logger.log(`Successfully retrieved profile for user: ${user.id}`);
      return userWithoutPassword;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`Error fetching profile for user: ${user.id}, Error: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
