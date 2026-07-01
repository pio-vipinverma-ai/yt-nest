import { useState, useEffect, useCallback } from 'react';
import { todoApi } from '../services/todoApi';
import { Todo } from '../types/todo.types';
import { getErrorMessage } from '../utils/api';

/**
 * Custom hook for managing todos list
 */
export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApi.getTodos('all');
      setTodos(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    refresh,
  };
};
