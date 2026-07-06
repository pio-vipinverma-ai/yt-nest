import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../utils/api';
import VideoPlayer from '../Video/VideoPlayer';
import './TodoApp.css';


// TypeScript interfaces
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  attachmentName?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
}

interface TodoFormData {
  title: string;
  description: string;
  file?: File | null;
}

interface CreateTodoDto {
  title: string;
  description?: string;
  file?: File | null;
}

interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * Complete Todo Application Component with Backend Integration
 * Features: Add, Delete, Mark Complete, Filter
 * Backend: NestJS API with PostgreSQL
 */
const TodoApp: React.FC = () => {
  // State management
  const [todos, setTodos] = useState<Todo[]>([]);
  const [formData, setFormData] = useState<TodoFormData>({ title: '', description: '', file: null });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Fetch todos from backend
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<any>('/todos', {
        params: {
          limit: 100,
        },
      });

      // Handle paginated response structure and keep all todos for local filtering
      setTodos(response.data?.data || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load todos on mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      setSubmitLoading(true);
      setError(null);
      
      const createDto: CreateTodoDto = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        file: formData.file,
      };

      const body = new FormData();
      body.append('title', createDto.title);
      if (createDto.description) {
        body.append('description', createDto.description);
      }
      if (createDto.file) {
        body.append('file', createDto.file);
      }

      const response = await apiClient.post<Todo>('/todos', body, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTodos([response.data, ...todos]);
      setFormData({ title: '', description: '', file: null });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create todo');
      console.error('Error creating todo:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Open attachment in a new tab with authenticated request
  const handleOpenAttachment = async (todo: Todo) => {
    if (!todo.attachmentName) return;

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      setError('Unable to open attachment window. Please allow popups for this site.');
      return;
    }

    try {
      const response = await apiClient.get<Blob>(`/todos/${todo.id}/attachment`, {
        responseType: 'blob',
      });
      const fileUrl = URL.createObjectURL(response.data);
      newWindow.location.href = fileUrl;
    } catch (err: any) {
      newWindow.close();
      setError(err.response?.data?.message || 'Failed to open attachment');
      console.error('Error opening attachment:', err);
    }
  };

  // Toggle todo completion
  const handleToggleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    try {
      const updateDto: UpdateTodoDto = { completed: !todo.completed };
      const response = await apiClient.patch<Todo>(`/todos/${id}`, updateDto);
      
      setTodos(
        todos.map((t) => (t.id === id ? response.data : t))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update todo');
      console.error('Error toggling todo:', err);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await apiClient.delete(`/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  // Start editing
  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  // Save edit
  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    
    try {
      const updateDto: UpdateTodoDto = { title: editText.trim() };
      const response = await apiClient.patch<Todo>(`/todos/${id}`, updateDto);
      
      setTodos(
        todos.map((todo) => (todo.id === id ? response.data : todo))
      );
      setEditingId(null);
      setEditText('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Filter todos
  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  };

  // Statistics
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  const filteredTodos = getFilteredTodos();

  return (
    <div className="todo-app">
      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button className="alert-close" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header className="todo-header">
        <h1>📝 Todo List</h1>
        <p>Stay organized and productive</p>
        
      <VideoPlayer
        sourceUrl="http://localhost:3002/assets/hls/index.m3u8"
      />

      </header>

      {/* Add Todo Form */}
      <form className="todo-form" onSubmit={handleAddTodo}>
        <div className="form-group">
          <input
            type="text"
            className="todo-input"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <textarea
            className="todo-textarea"
            placeholder="Add a description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={500}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="todo-file" className="todo-file-label">
            Attachment (optional)
          </label>
          <input
            id="todo-file"
            type="file"
            accept=".txt,.csv,.xls,.xlsx,.doc,.docx"
            onChange={(e) => setFormData({
              ...formData,
              file: e.target.files?.[0] ?? null,
            })}
          />
          {formData.file && (
            <div className="todo-file-name">Selected: {formData.file.name}</div>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!formData.title.trim() || submitLoading}
        >
          {submitLoading ? '⏳ Adding...' : '➕ Add Todo'}
        </button>
      </form>

      {/* Filters and Stats */}
      <div className="todo-controls">
        <div className="filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        <div className="stats">
          <span className="stat">{activeCount} active</span>
          <span className="separator">•</span>
          <span className="stat">{completedCount} completed</span>
        </div>
      </div>

      {/* Todo List */}
      <div className="todo-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading todos...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            {filter === 'all' && <p>No todos yet. Add one above! 🚀</p>}
            {filter === 'active' && <p>No active todos. Great job! 🎉</p>}
            {filter === 'completed' && <p>No completed todos yet.</p>}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              {/* Checkbox */}
              <div className="todo-checkbox">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id)}
                  id={`todo-${todo.id}`}
                />
                <label htmlFor={`todo-${todo.id}`}></label>
              </div>

              {/* Content */}
              <div className="todo-content">
                {editingId === todo.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(todo.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleSaveEdit(todo.id)}
                      >
                        ✓
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="todo-title">{todo.title}</h3>
                    {todo.description && (
                      <p className="todo-description">{todo.description}</p>
                    )}
                    {todo.attachmentName && (
                      <p className="todo-attachment">
                        <button
                          type="button"
                          className="todo-attachment-link"
                          title="Open attachment in a new tab"
                          aria-label={`Open attachment ${todo.attachmentName} in a new tab`}
                          onClick={() => handleOpenAttachment(todo)}
                        >
                          <span className="todo-attachment-icon">📎</span>
                          <span>
                            {todo.attachmentName}
                            {todo.attachmentSize ? ` · ${Math.round(todo.attachmentSize / 1024)} KB` : ''}
                          </span>
                        </button>
                      </p>
                    )}
                    <span className="todo-date">
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== todo.id && (
                <div className="todo-actions">
                  <button
                    className="btn btn-icon"
                    onClick={() => handleStartEdit(todo)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-icon btn-danger"
                    onClick={() => handleDeleteTodo(todo.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {filteredTodos.length > 0 && (
        <footer className="todo-footer">
          <p>Total: {filteredTodos.length} todos</p>
        </footer>
      )}
    </div>
  );
};

export default TodoApp;
