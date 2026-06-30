import { useState } from 'react';
import { todoApi } from '../services/todoApi';
import { UpdateTodoDto } from '../types/todo.types';
import { getErrorMessage } from '../utils/api';

/**
 * Custom hook for updating a todo
 */
export const useUpdateTodo = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateTodo = async (id: string, dto: UpdateTodoDto) => {
    try {
      setLoading(true);
      setError(null);
      await todoApi.updateTodo(id, dto);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    return updateTodo(id, { completed });
  };

  return {
    updateTodo,
    toggleTodo,
    loading,
    error,
  };
};
