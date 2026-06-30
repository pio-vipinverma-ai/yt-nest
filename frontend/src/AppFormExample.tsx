import { useState } from 'react';
import TodoForm from './components/TodoForm/TodoForm';
import axios from 'axios';
import './App.css';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Example App showing TodoForm with validation
 */
function AppFormExample() {
  const [todos, setTodos] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handle form submission
   */
  const handleSubmit = async (data: { title: string; description?: string }) => {
    setIsSubmitting(true);
    
    try {
      // Send to backend
      const response = await api.post('/todos', data);
      
      // Add to list
      setTodos([response.data, ...todos]);
      
      // Show success message
      setSuccessMessage('Todo created successfully! ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle form success (after submission and reset)
   */
  const handleSuccess = () => {
    console.log('Form submitted and reset successfully!');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Todo App with Validated Form</h1>
        <p>Comprehensive form validation example</p>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="success-banner">
          {successMessage}
        </div>
      )}

      {/* Todo Form with Validation */}
      <TodoForm 
        onSubmit={handleSubmit} 
        onSuccess={handleSuccess}
        isSubmitting={isSubmitting}
      />

      {/* Todo List */}
      <div className="todo-list-container">
        <h2>Your Todos ({todos.length})</h2>
        {todos.length === 0 ? (
          <p className="empty-state">No todos yet. Create one above! 🚀</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <div>
                  <h3>{todo.title}</h3>
                  {todo.description && <p>{todo.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Features List */}
      <div className="features">
        <h2>Form Features</h2>
        <ul>
          <li>✅ Required field validation</li>
          <li>✅ Real-time error messages</li>
          <li>✅ Character count with warnings</li>
          <li>✅ Form reset after submission</li>
          <li>✅ Loading states</li>
          <li>✅ Accessible (ARIA labels)</li>
          <li>✅ TypeScript support</li>
          <li>✅ Error-only-after-touch UX</li>
        </ul>
      </div>
    </div>
  );
}

export default AppFormExample;
