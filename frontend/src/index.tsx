import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithAuth from './AppWithAuth';
import './styles/global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>
);
