import React, { useState } from 'react';
import { useTodoContext } from '../../context/TodoContext';
import './TodoApp.css';

/**
 * TodoApp Component with Context API
 * Uses centralized state management from TodoContext
 */
const TodoAppWithContext: React.FC = () => {
  // Get state and actions from context
  const {
    filteredTodos,
    filter,
    loading,
    error,
    submitLoading,
    activeCount,
    completedCount,
    createTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setFilter,
    clearError,
  } = useTodoContext();

  // Local form state
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Handle form submission
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    try {
      await createTodo({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });
      setFormData({ title: '', description: '' });
    } catch (err) {
      // Error is handled by context
    }
  };

  // Handle toggle complete
  const handleToggleComplete = async (id: string) => {
    try {
      await toggleTodo(id);
    } catch (err) {
      // Error is handled by context
    }
  };

  // Handle delete
  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await deleteTodo(id);
    } catch (err) {
      // Error is handled by context
    }
  };

  // Start editing
  const handleStartEdit = (todo: any) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  };

  // Save edit
  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;

    try {
      await updateTodo(id, { title: editText.trim() });
      setEditingId(null);
      setEditText('');
    } catch (err) {
      // Error is handled by context
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="todo-app">
      {/* Header */}
      <header className="todo-header">
        <h1>📝 Todo List</h1>
        <p>Stay organized and productive</p>
        <small style={{ color: '#999' }}>Powered by Context API</small>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button className="alert-close" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

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
              className={`todo-item ${todo.completed ? 'completed' : ''} ${
                todo.isOptimistic ? 'optimistic' : ''
              } ${todo.isDeleting ? 'deleting' : ''}`}
              style={{
                opacity: todo.isOptimistic || todo.isDeleting ? 0.6 : 1,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Optimistic Update Indicator */}
              {todo.isOptimistic && (
                <div className="optimistic-indicator" title="Saving...">
                  <span className="spinner-small"></span>
                </div>
              )}

              {/* Deleting Indicator */}
              {todo.isDeleting && (
                <div className="deleting-overlay">
                  <span className="spinner-small"></span>
                  <span>Deleting...</span>
                </div>
              )}

              {/* Checkbox */}
              <div className="todo-checkbox">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id)}
                  id={`todo-${todo.id}`}
                  disabled={todo.isDeleting}
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
                    disabled={todo.isDeleting || todo.isOptimistic}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-icon btn-danger"
                    onClick={() => handleDeleteTodo(todo.id)}
                    title="Delete"
                    disabled={todo.isDeleting || todo.isOptimistic}
                  >
                    {todo.isDeleting ? '⏳' : '🗑️'}
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

export default TodoAppWithContext;
