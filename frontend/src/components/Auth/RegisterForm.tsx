import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { register, error, clearError, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Validate password match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      setValidationError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      return;
    }

    try {
      await register(email, username, password);
      // Redirect handled by parent component
    } catch (err) {
      // Error is handled by context
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <h2 className="auth-form-title">Create an Account</h2>
        
        {(error || validationError) && (
          <div className="auth-error">
            {validationError || error}
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
              disabled={isLoading}
              minLength={3}
              maxLength={50}
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
              placeholder="Create a password"
              disabled={isLoading}
              minLength={8}
            />
            <small className="form-hint">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="auth-switch-btn"
              disabled={isLoading}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
