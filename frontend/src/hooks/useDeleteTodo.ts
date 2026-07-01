import { useState } from 'react';
import { todoApi } from '../services/todoApi';
import { getErrorMessage } from '../utils/api';

/**
 * Custom hook for deleting a todo
 */
export const useDeleteTodo = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTodo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await todoApi.deleteTodo(id);
      onSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteTodo,
    loading,
    error,
  };
};
