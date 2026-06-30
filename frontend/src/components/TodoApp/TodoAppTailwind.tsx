import React, { useState, useEffect, useCallback } from 'react';
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
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

type TodoFilter = 'all' | 'active' | 'completed';

/**
 * TodoApp Component with Tailwind CSS
 * Features: Modern design, responsive layout, card-based UI
 */
const TodoAppTailwind: React.FC = () => {
  // State management
  const [todos, setTodos] = useState<Todo[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Fetch todos
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
      setError(err.response?.data?.message || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitLoading(true);
      setError(null);
      const response = await api.post<Todo>('/todos', {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });
      setTodos([response.data, ...todos]);
      setFormData({ title: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create todo');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Toggle complete
  const handleToggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      const response = await api.patch<Todo>(`/todos/${id}`, { completed: !todo.completed });
      setTodos(todos.map((t) => (t.id === id ? response.data : t)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update todo');
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete todo');
    }
  };

  // Edit todo
  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;

    try {
      const response = await api.patch<Todo>(`/todos/${id}`, { title: editText.trim() });
      setTodos(todos.map((t) => (t.id === id ? response.data : t)));
      setEditingId(null);
      setEditText('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update todo');
    }
  };

  // Computed values
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            📝 Todo List
          </h1>
          <p className="text-gray-600 text-lg">Stay organized and productive</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 animate-slide-down">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 font-bold text-xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Todo Form - Card Style */}
        <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow mb-8 animate-scale-in">
          <form onSubmit={handleAddTodo} className="p-6">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all"
                  placeholder="What needs to be done? ✨"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
              </div>
              <div>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none"
                  placeholder="Add a description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={!formData.title.trim() || submitLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
              >
                {submitLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  '➕ Add Todo'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filters & Stats - Card Style */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              {(['all', 'active', 'completed'] as TodoFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    filter === f
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {activeCount} active
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {completedCount} completed
              </span>
            </div>
          </div>
        </div>

        {/* Todo List - Card Based */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center">
              <svg className="animate-spin h-12 w-12 mx-auto text-primary-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-gray-600 font-medium">Loading todos...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-12 text-center">
              <div className="text-6xl mb-4">
                {filter === 'all' && '🚀'}
                {filter === 'active' && '🎉'}
                {filter === 'completed' && '📝'}
              </div>
              <p className="text-gray-600 text-lg">
                {filter === 'all' && 'No todos yet. Add one above!'}
                {filter === 'active' && 'No active todos. Great job!'}
                {filter === 'completed' && 'No completed todos yet.'}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all p-6 animate-slide-up ${
                  todo.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(todo.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                        todo.completed
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500'
                          : 'border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {todo.completed && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          className="w-full px-4 py-2 border-2 border-primary-500 rounded-lg focus:ring-4 focus:ring-primary-100 outline-none"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(todo.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(todo.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3
                          className={`text-lg font-semibold mb-1 ${
                            todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p
                            className={`text-sm mb-2 ${
                              todo.completed ? 'line-through text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {todo.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(todo.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== todo.id && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(todo)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            Total: {todos.length} {todos.length === 1 ? 'todo' : 'todos'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoAppTailwind;
