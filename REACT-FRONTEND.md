# React Todo Application

A modern React application for managing todos, integrated with NestJS backend.

## Tech Stack

- **React 18+** - UI library
- **TypeScript** - Type safety
- **Axios** - HTTP client
- **React Query** - Data fetching & caching
- **CSS Modules** - Scoped styling
- **ESLint + Prettier** - Code quality

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/          # React components
│   │   ├── TodoList/
│   │   ├── TodoItem/
│   │   ├── TodoForm/
│   │   └── Layout/
│   ├── hooks/              # Custom hooks
│   │   ├── useTodos.ts
│   │   └── useCreateTodo.ts
│   ├── services/           # API services
│   │   └── todoApi.ts
│   ├── types/              # TypeScript types
│   │   └── todo.types.ts
│   ├── utils/              # Utility functions
│   │   └── api.ts
│   ├── styles/             # Global styles
│   │   └── global.css
│   ├── App.tsx             # Main app component
│   ├── index.tsx           # Entry point
│   └── config.ts           # Configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Quick Start

```bash
# Create React app
cd frontend
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Features

- ✅ Create, read, update, delete todos
- ✅ Mark todos as completed
- ✅ Filter by status (all, completed, pending)
- ✅ Real-time updates
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

## API Integration

The app connects to the NestJS backend at `http://localhost:3000/todos`
