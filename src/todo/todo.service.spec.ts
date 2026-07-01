import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { NotFoundException } from '@nestjs/common';

describe('TodoService', () => {
  let service: TodoService;
  let repository: Repository<Todo>;

  const mockTodo: Todo = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const createTodoDto: CreateTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };

      mockRepository.create.mockReturnValue(mockTodo);
      mockRepository.save.mockResolvedValue(mockTodo);

      const result = await service.create(createTodoDto);

      expect(result).toEqual(mockTodo);
      expect(mockRepository.create).toHaveBeenCalledWith(createTodoDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTodo);
    });
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      mockRepository.find.mockResolvedValue([mockTodo]);

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockTodo]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a todo by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTodo);

      const result = await service.findOne(mockTodo.id);

      expect(result).toEqual(mockTodo);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
      });
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Todo',
        completed: true,
      };

      const updatedTodo = { ...mockTodo, ...updateTodoDto };

      mockRepository.findOne.mockResolvedValue(mockTodo);
      mockRepository.save.mockResolvedValue(updatedTodo);

      const result = await service.update(mockTodo.id, updateTodoDto);

      expect(result.title).toBe(updateTodoDto.title);
      expect(result.completed).toBe(updateTodoDto.completed);
    });

    it('should throw NotFoundException for invalid id', async () => {
      const updateTodoDto: UpdateTodoDto = {
        title: 'Updated Todo',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', updateTodoDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockTodo.id);

      expect(mockRepository.delete).toHaveBeenCalledWith(mockTodo.id);
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findCompleted', () => {
    it('should return only completed todos', async () => {
      const completedTodo = { ...mockTodo, completed: true };
      mockRepository.find.mockResolvedValue([completedTodo]);

      const result = await service.findCompleted();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { completed: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([completedTodo]);
    });
  });

  describe('findPending', () => {
    it('should return only pending todos', async () => {
      mockRepository.find.mockResolvedValue([mockTodo]);

      const result = await service.findPending();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { completed: false },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockTodo]);
    });
  });
});
