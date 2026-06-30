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
  Logger,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { GetTodosQueryDto } from './dto/get-todos-query.dto';
import { Todo } from './entities/todo.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import type { File as MulterFile } from 'multer';
import type { Response } from 'express';

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
  private readonly logger = new Logger(TodoController.name);

  private static readonly uploadPath = join(process.cwd(), 'uploads');
  private static readonly allowedMimeTypes = [
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  constructor(private readonly todoService: TodoService) {
    if (!existsSync(TodoController.uploadPath)) {
      mkdirSync(TodoController.uploadPath, { recursive: true });
    }
  }

  /**
   * Create a new todo
   * POST /todos
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: TodoController.uploadPath,
        filename: (_req, file, callback) => {
          const normalized = file.originalname.replace(/\s+/g, '_');
          const fileName = `${Date.now()}-${normalized}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (TodoController.allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Invalid file type. Only txt, csv, xls, xlsx, doc, and docx files are allowed.',
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: User,
    @UploadedFile() file?: MulterFile,
  ): Promise<Todo> {
    this.logger.log(`[CREATE] Incoming request from user ${user.id} to create todo: "${createTodoDto.title}"`);
    if (file) {
      this.logger.log(`[CREATE] File uploaded: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
    }
    try {
      const result = await this.todoService.create(createTodoDto, user.id, file);
      this.logger.log(`[CREATE] Successfully created todo with ID: ${result.id} for user: ${user.id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`[CREATE] Failed to create todo for user ${user.id}, Error: ${errorMessage}`, errorStack);
      throw error;
    }
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
    this.logger.log(`[FIND_ALL] Fetching todos for user ${user.id} with query: ${JSON.stringify(query)}`);
    try {
      const result = await this.todoService.findAll(query, user.id);
      this.logger.log(`[FIND_ALL] Successfully retrieved ${result.data?.length || 0} todos for user ${user.id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`[FIND_ALL] Failed to fetch todos for user ${user.id}, Error: ${errorMessage}`, errorStack);
      throw error;
    }
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
    this.logger.log(`[FIND_ONE] Fetching todo ${id} for user ${user.id}`);
    try {
      const result = await this.todoService.findOne(id, user.id);
      this.logger.log(`[FIND_ONE] Successfully retrieved todo ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`[FIND_ONE] Failed to fetch todo ${id}, Error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  @Get(':id/attachment')
  async downloadAttachment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    this.logger.log(`[ATTACHMENT] Download request for todo ${id} by user ${user.id}`);

    const todo = await this.todoService.findOne(id, user.id);

    if (!todo.attachmentPath || !todo.attachmentName) {
      this.logger.warn(`[ATTACHMENT] No attachment found for todo ${id}`);
      throw new NotFoundException('Attachment not found');
    }

    const filePath = resolve(todo.attachmentPath);
    if (!existsSync(filePath)) {
      this.logger.warn(`[ATTACHMENT] Attachment file missing on disk for todo ${id}: ${filePath}`);
      throw new NotFoundException('Attachment file not found on server');
    }

    res.setHeader('Content-Disposition', `inline; filename="${todo.attachmentName}"`);
    return res.sendFile(filePath);
  }

  /**
   * Update a todo
   * PATCH /todos/:id
   * 
   * @param id - UUID of the todo to update
   * @param updateTodoDto - The fields to update
   * @returns The updated todo
   * @throws {NotFoundException} If todo with given id doesn't exist
   * @throws {BadRequestException} If id is not a valid UUID or validation fails
   * 
   * @example
   * Request:
   * PATCH /todos/123e4567-e89b-12d3-a456-426614174000
   * {
   *   "completed": true
   * }
   * 
   * Response (200):
   * {
   *   "id": "123e4567-e89b-12d3-a456-426614174000",
   *   "title": "Buy groceries",
   *   "completed": true,
   *   "updatedAt": "2026-06-09T11:00:00Z",
   *   ...
   * }
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: User,
  ): Promise<Todo> {
    this.logger.log(`[UPDATE] Updating todo ${id} for user ${user.id} with data: ${JSON.stringify(updateTodoDto)}`);
    try {
      const result = await this.todoService.update(id, updateTodoDto, user.id);
      this.logger.log(`[UPDATE] Successfully updated todo ${id}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`[UPDATE] Failed to update todo ${id}, Error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Delete a todo
   * DELETE /todos/:id
   * 
   * @param id - UUID of the todo to delete
   * @returns No content
   * @throws {NotFoundException} If todo with given id doesn't exist
   * @throws {BadRequestException} If id is not a valid UUID
   * 
   * @example
   * DELETE /todos/123e4567-e89b-12d3-a456-426614174000
   * 
   * Response: 204 No Content
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    this.logger.log(`[DELETE] Deleting todo ${id} for user ${user.id}`);
    try {
      await this.todoService.remove(id, user.id);
      this.logger.log(`[DELETE] Successfully deleted todo ${id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`[DELETE] Failed to delete todo ${id}, Error: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
