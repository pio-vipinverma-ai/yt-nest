import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TypeScript interfaces
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  file?: File | null;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';

/**
 * Custom hook for Todo state management
 * Alternative to Context API - encapsulates all todo logic
 * 
 * @example
 * const todoState = useTodoState();
 * const { todos, loading, createTodo, toggleTodo } = todoState;
 */
export const useTodoState = () => {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Fetch todos from backend
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (filter === 'active') params.status = 'pending';
      if (filter === 'completed') params.status = 'completed';

      const response = await api.get<Todo[]>('/todos', { params });
      setTodos(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch todos';
      setError(errorMessage);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Create new todo
  const createTodo = useCallback(async (dto: CreateTodoDto) => {
    try {
      setSubmitLoading(true);
      setError(null);

      const response = await api.post<Todo>('/todos', dto);
      setTodos((prev) => [response.data, ...prev]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create todo';
      setError(errorMessage);
      console.error('Error creating todo:', err);
      throw err;
    } finally {
      setSubmitLoading(false);
    }
  }, []);

  // Update todo
  const updateTodo = useCallback(async (id: string, dto: UpdateTodoDto) => {
    try {
      setError(null);

      const response = await api.patch<Todo>(`/todos/${id}`, dto);
      setTodos((prev) => prev.map((todo) => (todo.id === id ? response.data : todo)));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update todo';
      setError(errorMessage);
      console.error('Error updating todo:', err);
      throw err;
    }
  }, []);

  // Toggle todo completion
  const toggleTodo = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      await updateTodo(id, { completed: !todo.completed });
    },
    [todos, updateTodo]
  );

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    try {
      setError(null);

      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete todo';
      setError(errorMessage);
      console.error('Error deleting todo:', err);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch todos when filter changes
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Computed values
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  return {
    // State
    todos,
    filter,
    loading,
    error,
    submitLoading,

    // Actions
    fetchTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
    clearError,

    // Computed values
    filteredTodos,
    activeCount,
    completedCount,
  };
};

export default useTodoState;
