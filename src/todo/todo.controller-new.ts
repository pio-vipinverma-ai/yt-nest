import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { GetTodosQueryDto } from './dto/get-todos-query.dto';
import { Todo } from './entities/todo.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

/**
 * Todo Controller
 * Handles all HTTP requests related to Todo resources
 * Base route: /todos
 * All routes require authentication
 */
@Controller('todos')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * Create a new todo
   * POST /todos
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return await this.todoService.create(createTodoDto, user.id);
  }

  /**
   * Get all todos with pagination, search, and filtering
   * GET /todos
   * 
   * Query Parameters:
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 10, max: 100)
   * - search: Search term for title/description
   * - status: Filter by status (all, completed, pending)
   * - sortBy: Sort field (createdAt, updatedAt, title, completed)
   * - sortOrder: Sort order (ASC, DESC)
   * 
   * @example GET /todos?page=1&limit=10&search=grocery&status=pending&sortBy=createdAt&sortOrder=DESC
   */
  @Get()
  async findAll(
    @Query() query: GetTodosQueryDto,
    @CurrentUser() user: User,
  ) {
    return await this.todoService.findAll(query, user.id);
  }

  /**
   * Get a specific todo by ID
   * GET /todos/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return await this.todoService.findOne(id, user.id);
  }

  /**
   * Update a todo
   * PATCH /todos/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    return await this.todoService.update(id, updateTodoDto, user.id);
  }

  /**
   * Delete a todo
   * DELETE /todos/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.todoService.remove(id, user.id);
  }
}
