import React, { useState } from 'react';
import { TodoFilter } from '../../types/todo.types';
import { useTodos } from '../../hooks/useTodos';
import TodoItem from '../TodoItem/TodoItem';
import styles from './TodoList.module.css';

interface TodoListProps {
  onRefresh?: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ onRefresh }) => {
  const [filter, setFilter] = useState<TodoFilter>('all');
  const { todos, loading, error, refresh } = useTodos();

  const handleRefresh = () => {
    refresh();
    onRefresh?.();
  };

  const filters: { value: TodoFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button className={styles.retryButton} onClick={handleRefresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f.value}
              className={`${styles.filterButton} ${
                filter === f.value ? styles.active : ''
              }`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        
        <div className={styles.stats}>
          <span>
            {todos.filter((t) => !t.completed).length} active
          </span>
          <span className={styles.separator}>•</span>
          <span>
            {todos.filter((t) => t.completed).length} completed
          </span>
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'all' && <p>No todos yet. Create one above!</p>}
          {filter === 'active' && <p>No active todos. Great job! 🎉</p>}
          {filter === 'completed' && <p>No completed todos yet.</p>}
        </div>
      ) : (
        <div className={styles.list}>
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
