import { useState } from 'react';
import { todoApi } from '../services/todoApi';
import { CreateTodoDto } from '../types/todo.types';
import { getErrorMessage } from '../utils/api';

/**
 * Custom hook for creating a todo
 */
export const useCreateTodo = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTodo = async (dto: CreateTodoDto) => {
    try {
      setLoading(true);
      setError(null);
      await todoApi.createTodo(dto);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTodo,
    loading,
    error,
  };
};
