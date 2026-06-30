import { apiClient } from '../utils/api';
import {
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  TodoFilter,
} from '../types/todo.types';

const TODOS_ENDPOINT = '/todos';

/**
 * Todo API Service
 * All API calls to the NestJS backend
 */
export const todoApi = {
  /**
   * Get all todos with optional filter
   */
  async getTodos(filter: TodoFilter = 'all'): Promise<Todo[]> {
    const params: any = {};
    if (filter === 'active') params.status = 'pending';
    if (filter === 'completed') params.status = 'completed';

    const response = await apiClient.get<{ data: Todo[] }>(TODOS_ENDPOINT, { params });
    return response.data.data; // Extract data array from paginated response
  },

  /**
   * Get a single todo by ID
   */
  async getTodoById(id: string): Promise<Todo> {
    const response = await apiClient.get<Todo>(`${TODOS_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Create a new todo
   */
  async createTodo(dto: CreateTodoDto): Promise<Todo> {
    const response = await apiClient.post<Todo>(TODOS_ENDPOINT, dto);
    return response.data;
  },

  /**
   * Update an existing todo
   */
  async updateTodo(id: string, dto: UpdateTodoDto): Promise<Todo> {
    const response = await apiClient.patch<Todo>(
      `${TODOS_ENDPOINT}/${id}`,
      dto
    );
    return response.data;
  },

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<void> {
    await apiClient.delete(`${TODOS_ENDPOINT}/${id}`);
  },

  /**
   * Toggle todo completion status
   */
  async toggleTodo(id: string, completed: boolean): Promise<Todo> {
    return this.updateTodo(id, { completed });
  },
};
