import React from 'react';
import { useAuth } from '../context/AuthContext';
import TodoApp from '../components/TodoApp/TodoApp';
import './TodoPage.css';

export const TodoPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="todo-page">
      <div className="todo-page-header">
        <div className="user-info">
          <span className="welcome-text">Welcome, {user?.username}!</span>
          <span className="user-email">{user?.email}</span>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
      <TodoApp />
    </div>
  );
};
