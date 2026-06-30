import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard
 * Protects routes by requiring a valid JWT token
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
