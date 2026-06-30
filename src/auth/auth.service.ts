import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * Auth Service
 * Handles user authentication and authorization
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; access_token: string }> {
    const { email, username, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const access_token = this.generateToken(savedUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; access_token: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const access_token = this.generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token,
    };
  }

  /**
   * Validate user by ID
   */
  async validateUser(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return this.jwtService.sign(payload);
  }
}
