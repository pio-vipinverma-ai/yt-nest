import { Link } from 'react-router-dom';
import VideoPlayer from '../components/Video/VideoPlayer';

export function LivePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{ display: 'flex', gap: 12, padding: 16, background: '#111', color: '#fff' }}>
        <Link to="/todos" style={{ color: '#fff', textDecoration: 'none' }}>
          Todos
        </Link>
        <Link to="/live" style={{ color: '#fff', textDecoration: 'none' }}>
          Live Stream
        </Link>
      </nav>

      <div style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Live Camera Stream</h2>
        
        <VideoPlayer
        sourceUrl="http://localhost:3002/live/live/index.m3u8"
        />

      </div>
    </div>
  );
}
