import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { AuthPage } from './pages/AuthPage';
import { TodoPage } from './pages/TodoPage';
import { LivePage } from './pages/LivePage';
import './index.css';

/**
 * Main App Component with Authentication
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Default route - redirect to todos or auth based on auth status */}
        <Route path="/" element={<Navigate to="/todos" replace />} />

        {/* Auth routes (login/register) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected todo route */}
        <Route
          path="/todos"
          element={
            <PrivateRoute>
              <TodoPage />
            </PrivateRoute>
          }
        />

        <Route path="/live" element={<LivePage />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
