import React from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>📝 Todo App</h1>
          <p className={styles.subtitle}>
            Manage your tasks efficiently
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>{children}</div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>Built with NestJS + React + TypeScript</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
