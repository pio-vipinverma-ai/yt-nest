import React, { useState } from 'react';
import { Todo } from '../../types/todo.types';
import { useUpdateTodo } from '../../hooks/useUpdateTodo';
import { useDeleteTodo } from '../../hooks/useDeleteTodo';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  todo: Todo;
  onUpdate: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  
  const { toggleTodo, updateTodo, loading: updateLoading } = useUpdateTodo(onUpdate);
  const { deleteTodo, loading: deleteLoading } = useDeleteTodo(onUpdate);

  const handleToggle = async () => {
    try {
      await toggleTodo(todo.id, !todo.completed);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await deleteTodo(todo.id);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    try {
      await updateTodo(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  const loading = updateLoading || deleteLoading;

  if (isEditing) {
    return (
      <div className={styles.todoItem}>
        <input
          type="text"
          className={styles.editInput}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          maxLength={100}
        />
        <textarea
          className={styles.editTextarea}
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          maxLength={500}
          rows={2}
        />
        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={loading || !editTitle.trim()}
          >
            Save
          </button>
          <button
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
      <div className={styles.checkbox}>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={loading}
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{todo.title}</h3>
        {todo.description && (
          <p className={styles.description}>{todo.description}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.date}>
            {new Date(todo.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.editButton}
          onClick={handleEdit}
          disabled={loading}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={loading}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
