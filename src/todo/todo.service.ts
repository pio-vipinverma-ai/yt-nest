import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { GetTodosQueryDto } from './dto/get-todos-query.dto';
import {
  PaginatedResponse,
  createPaginatedResponse,
} from './interfaces/paginated-response.interface';
import type { File as MulterFile } from 'multer';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  /**
   * Create a new todo item for a specific user
   */
  async create(createTodoDto: CreateTodoDto, userId: string, file?: MulterFile): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...createTodoDto,
      userId,
      attachmentName: file?.originalname,
      attachmentMimeType: file?.mimetype,
      attachmentSize: file?.size,
      attachmentPath: file?.path,
    });
    return await this.todoRepository.save(todo);
  }

  /**
   * Get all todos for a specific user with pagination, search, and filtering
   * Optimized with query builder and indexed columns
   */
  async findAll(query: GetTodosQueryDto, userId: string): Promise<PaginatedResponse<Todo>> {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    // Build query with query builder for optimization
    const queryBuilder = this.todoRepository
      .createQueryBuilder('todo')
      .select([
        'todo.id',
        'todo.title',
        'todo.description',
        'todo.completed',
        'todo.attachmentName',
        'todo.attachmentMimeType',
        'todo.attachmentSize',
        'todo.attachmentPath',
        'todo.createdAt',
        'todo.updatedAt',
      ])
      .where('todo.userId = :userId', { userId });

    // Apply search filter (case-insensitive search in title and description)
    if (search) {
      queryBuilder.andWhere(
        '(todo.title ILIKE :search OR todo.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status === 'completed') {
      queryBuilder.andWhere('todo.completed = :completed', { completed: true });
    } else if (status === 'pending') {
      queryBuilder.andWhere('todo.completed = :completed', {
        completed: false,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`todo.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query with count
    const [data, total] = await queryBuilder.getManyAndCount();

    // Return paginated response
    return createPaginatedResponse(data, total, page, limit);
  }

  /**
   * Get a specific todo by ID for a specific user
   */
  async findOne(id: string, userId: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ 
      where: { id, userId } 
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }

    return todo;
  }

  /**
   * Update a todo item (only if it belongs to the user)
   */
  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string): Promise<Todo> {
    const todo = await this.findOne(id, userId);

    Object.assign(todo, updateTodoDto);
    return await this.todoRepository.save(todo);
  }

  /**
   * Delete a todo item (only if it belongs to the user)
   */
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.todoRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
  }

  /**
   * Get all completed todos for a specific user
   */
  async findCompleted(userId: string): Promise<Todo[]> {
    return await this.todoRepository.find({
      where: { completed: true, userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all pending todos for a specific user
   */
  async findPending(userId: string): Promise<Todo[]> {
    return await this.todoRepository.find({
      where: { completed: false, userId },
      order: { createdAt: 'DESC' },
    });
  }
}
