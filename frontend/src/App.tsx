import { useCallback, useState } from 'react';
import axios from 'axios';
import Layout from './components/Layout/Layout';
import TodoForm from './components/TodoForm/TodoForm';
import TodoList from './components/TodoList/TodoList';
import VideoPlayer from './components/Video/VideoPlayer';
import './styles/global.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

console.log('API_BASE_URL:', API_BASE_URL); // Debug log

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = useCallback(() => {
    // Refresh the todo list
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleSubmit = async (data: { title: string; description?: string; file?: File }) => {
    console.log('handleSubmit called with:', data);
    console.log('Posting to:', `${API_BASE_URL}/todos`);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.file) formData.append('file', data.file);

      const response = await axios.post(`${API_BASE_URL}/todos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response);
    } catch (error) {
      console.error('Error submitting todo:', error);
      throw error;
    }
  };

  return (
    <Layout>
      <VideoPlayer />
      <TodoForm onSuccess={handleSuccess} onSubmit={handleSubmit} />
      <TodoList key={refreshKey} onRefresh={handleSuccess} />
    </Layout>
  );
}

export default App;
