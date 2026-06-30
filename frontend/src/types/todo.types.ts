// Todo type definitions matching backend entity
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTO for creating a todo
export interface CreateTodoDto {
  title: string;
  description?: string;
  file?: File | null;
}

// DTO for updating a todo
export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

// Filter type for todo list
export type TodoFilter = 'all' | 'active' | 'completed';

// API error response
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
