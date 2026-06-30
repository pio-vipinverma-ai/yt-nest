import { TodoProvider } from './context/TodoContext';
import TodoAppWithContext from './components/TodoApp/TodoAppWithContext';

/**
 * App component with Context API implementation
 * Wraps the application with TodoProvider for centralized state management
 */
function AppWithContext() {
  return (
    <TodoProvider>
      <TodoAppWithContext />
    </TodoProvider>
  );
}

export default AppWithContext;
