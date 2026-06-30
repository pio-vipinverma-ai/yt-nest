# React Todo Frontend

Modern React application for managing todos.

## Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## Environment Variables

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:3000
```

## Build for Production

```bash
npm run build
```

The optimized build will be in the `build/` folder.

## Features

- Create, read, update, delete todos
- Mark as completed
- Filter by status (all, active, completed)
- Real-time statistics
- Responsive design
- Error handling
- Loading states

## Architecture

- **Components**: Presentational and container components
- **Hooks**: Custom hooks for data fetching
- **Services**: API integration layer
- **Types**: TypeScript interfaces
- **CSS Modules**: Scoped styling
