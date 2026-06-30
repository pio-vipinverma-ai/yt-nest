import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  // Optimistic update flags
  isOptimistic?: boolean; // True when waiting for API confirmation
  isDeleting?: boolean;   // True when delete is in progress
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

// Context State Interface
interface TodoContextState {
  // State
  todos: Todo[];
  filter: TodoFilter;
  loading: boolean;
  error: string | null;
  submitLoading: boolean;

  // Actions
  fetchTodos: () => Promise<void>;
  createTodo: (dto: CreateTodoDto) => Promise<void>;
  updateTodo: (id: string, dto: UpdateTodoDto) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  setFilter: (filter: TodoFilter) => void;
  clearError: () => void;

  // Computed values
  filteredTodos: Todo[];
  activeCount: number;
  completedCount: number;
}

// Create Context
const TodoContext = createContext<TodoContextState | undefined>(undefined);

// Provider Props
interface TodoProviderProps {
  children: ReactNode;
}

/**
 * TodoProvider - Centralized state management for Todo application
 * Provides all todo-related state and operations through Context API
 */
export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
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

      const response = await api.get<any>('/todos', {
        params: {
          page: 1,
          limit: 100,
        },
      });
      setTodos(response.data?.data || response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch todos';
      setError(errorMessage);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new todo with optimistic update
  const createTodo = useCallback(async (dto: CreateTodoDto) => {
    // Generate temporary ID for optimistic todo
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const now = new Date().toISOString();

    // Create optimistic todo
    const optimisticTodo: Todo = {
      id: tempId,
      title: dto.title,
      description: dto.description,
      completed: false,
      createdAt: now,
      updatedAt: now,
      isOptimistic: true, // Mark as pending API confirmation
    };

    try {
      setSubmitLoading(true);
      setError(null);

      // Optimistic update: Add todo immediately
      setTodos((prev) => [optimisticTodo, ...prev]);

      // Make API call
      const response = await api.post<Todo>('/todos', dto);

      // Success: Replace optimistic todo with real todo from server
      setTodos((prev) =>
        prev.map((todo) => (todo.id === tempId ? response.data : todo))
      );
    } catch (err: any) {
      // Rollback: Remove optimistic todo
      setTodos((prev) => prev.filter((todo) => todo.id !== tempId));

      const errorMessage = err.response?.data?.message || 'Failed to create todo';
      setError(errorMessage);
      console.error('Error creating todo:', err);
      throw err; // Re-throw to allow component-level handling
    } finally {
      setSubmitLoading(false);
    }
  }, []);

  // Update todo with optimistic update
  const updateTodo = useCallback(async (id: string, dto: UpdateTodoDto) => {
    // Find the todo to update
    const previousTodo = todos.find((todo) => todo.id === id);
    if (!previousTodo) {
      console.error(`Todo with id ${id} not found`);
      return;
    }

    // Create optimistic updated todo
    const optimisticTodo: Todo = {
      ...previousTodo,
      ...dto,
      updatedAt: new Date().toISOString(),
      isOptimistic: true,
    };

    try {
      setError(null);

      // Optimistic update: Update todo immediately
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? optimisticTodo : todo))
      );

      // Make API call
      const response = await api.patch<Todo>(`/todos/${id}`, dto);

      // Success: Replace with server response
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? response.data : todo))
      );
    } catch (err: any) {
      // Rollback: Restore previous state
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? previousTodo : todo))
      );

      const errorMessage = err.response?.data?.message || 'Failed to update todo';
      setError(errorMessage);
      console.error('Error updating todo:', err);
      throw err;
    }
  }, [todos]);

  // Toggle todo completion with optimistic update
  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      console.error(`Todo with id ${id} not found`);
      return;
    }

    // Optimistic toggle
    const optimisticTodo: Todo = {
      ...todo,
      completed: !todo.completed,
      updatedAt: new Date().toISOString(),
      isOptimistic: true,
    };

    try {
      setError(null);

      // Optimistic update: Toggle immediately
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? optimisticTodo : t))
      );

      // Make API call
      const response = await api.patch<Todo>(`/todos/${id}`, {
        completed: !todo.completed,
      });

      // Success: Replace with server response
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? response.data : t))
      );
    } catch (err: any) {
      // Rollback: Restore previous state
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? todo : t))
      );

      const errorMessage = err.response?.data?.message || 'Failed to toggle todo';
      setError(errorMessage);
      console.error('Error toggling todo:', err);
      throw err;
    }
  }, [todos]);

  // Delete todo with optimistic update
  const deleteTodo = useCallback(async (id: string) => {
    // Find the todo to delete (for rollback)
    const todoToDelete = todos.find((todo) => todo.id === id);
    if (!todoToDelete) {
      console.error(`Todo with id ${id} not found`);
      return;
    }

    // Store the index for proper rollback position
    const todoIndex = todos.findIndex((todo) => todo.id === id);

    try {
      setError(null);

      // Optimistic update: Mark as deleting and remove from UI
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, isDeleting: true } : todo
        )
      );

      // Remove after a brief moment to show delete animation
      setTimeout(() => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
      }, 200);

      // Make API call
      await api.delete(`/todos/${id}`);

      // Success: Todo already removed from UI
    } catch (err: any) {
      // Rollback: Restore deleted todo at original position
      setTodos((prev) => {
        const newTodos = [...prev];
        // Insert at original index if possible
        if (todoIndex >= 0 && todoIndex <= newTodos.length) {
          newTodos.splice(todoIndex, 0, todoToDelete);
        } else {
          newTodos.push(todoToDelete);
        }
        return newTodos;
      });

      const errorMessage = err.response?.data?.message || 'Failed to delete todo';
      setError(errorMessage);
      console.error('Error deleting todo:', err);
      throw err;
    }
  }, [todos]);

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

  // Context value
  const value: TodoContextState = {
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

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

/**
 * useTodoContext - Custom hook to access TodoContext
 * Throws error if used outside TodoProvider
 */
export const useTodoContext = (): TodoContextState => {
  const context = useContext(TodoContext);
  
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  
  return context;
};

// Export for convenience
export default TodoContext;
