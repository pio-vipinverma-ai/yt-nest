import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, clearError, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      // Redirect handled by parent component
    } catch (err) {
      // Error is handled by context
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2 className="auth-form-title">Login to Todo App</h2>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="auth-switch-btn"
              disabled={isLoading}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
