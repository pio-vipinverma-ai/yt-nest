import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  const mockTodo: Todo = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTodoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findCompleted: jest.fn(),
    findPending: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo', async () => {
      const createTodoDto = {
        title: 'Test Todo',
        description: 'Test Description',
      };

      mockTodoService.create.mockResolvedValue(mockTodo);

      const result = await controller.create(createTodoDto);

      expect(result).toEqual(mockTodo);
      expect(mockTodoService.create).toHaveBeenCalledWith(createTodoDto);
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      mockTodoService.findAll.mockResolvedValue([mockTodo]);

      const result = await controller.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([mockTodo]);
      expect(mockTodoService.findAll).toHaveBeenCalled();
    });

    it('should return completed todos when status is completed', async () => {
      const completedTodo = { ...mockTodo, completed: true };
      mockTodoService.findCompleted.mockResolvedValue([completedTodo]);

      const result = await controller.findAll('completed');

      expect(mockTodoService.findCompleted).toHaveBeenCalled();
      expect(result).toEqual([completedTodo]);
    });

    it('should return pending todos when status is pending', async () => {
      mockTodoService.findPending.mockResolvedValue([mockTodo]);

      const result = await controller.findAll('pending');

      expect(mockTodoService.findPending).toHaveBeenCalled();
      expect(result).toEqual([mockTodo]);
    });
  });

  describe('findOne', () => {
    it('should return a todo by id', async () => {
      mockTodoService.findOne.mockResolvedValue(mockTodo);

      const result = await controller.findOne(mockTodo.id);

      expect(result).toEqual(mockTodo);
      expect(mockTodoService.findOne).toHaveBeenCalledWith(mockTodo.id);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateDto = { title: 'Updated Todo', completed: true };
      const updatedTodo = { ...mockTodo, ...updateDto };

      mockTodoService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update(mockTodo.id, updateDto);

      expect(result).toEqual(updatedTodo);
      expect(mockTodoService.update).toHaveBeenCalledWith(
        mockTodo.id,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      mockTodoService.remove.mockResolvedValue(undefined);

      await controller.remove(mockTodo.id);

      expect(mockTodoService.remove).toHaveBeenCalledWith(mockTodo.id);
    });
  });
});
