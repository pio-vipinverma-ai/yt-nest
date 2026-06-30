# State Management Guide

Complete guide to state management patterns in the Todo application using React hooks and Context API.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Basic Hooks (useState, useEffect)](#basic-hooks)
3. [Custom Hooks Pattern](#custom-hooks-pattern)
4. [Context API Pattern](#context-api-pattern)
5. [Comparison & Best Practices](#comparison--best-practices)
6. [Usage Examples](#usage-examples)

---

## Overview

This application demonstrates three state management approaches:

| Pattern | File | Best For |
|---------|------|----------|
| **Component State** | `TodoApp.tsx` | Small apps, single component |
| **Custom Hook** | `useTodoState.ts` | Reusable logic, multiple components |
| **Context API** | `TodoContext.tsx` | Global state, deep prop drilling |

---

## Basic Hooks (useState, useEffect)

### **useState - State Management**

```typescript
// Simple state
const [todos, setTodos] = useState<Todo[]>([]);
const [loading, setLoading] = useState(false);

// Object state
const [formData, setFormData] = useState({ 
  title: '', 
  description: '' 
});

// Updating state
setTodos([newTodo, ...todos]);
setFormData({ ...formData, title: 'New Title' });
```

### **useEffect - Side Effects**

```typescript
// Run on mount
useEffect(() => {
  fetchTodos();
}, []); // Empty dependency array

// Run when filter changes
useEffect(() => {
  fetchTodos();
}, [filter]); // Re-run when filter changes

// Cleanup
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer); // Cleanup
}, []);
```

### **useCallback - Memoization**

```typescript
// Prevent unnecessary re-creation of functions
const fetchTodos = useCallback(async () => {
  const response = await api.get('/todos');
  setTodos(response.data);
}, [filter]); // Re-create when filter changes
```

---

## Custom Hooks Pattern

### **useTodoState Hook**

**File:** [`src/hooks/useTodoState.ts`](src/hooks/useTodoState.ts)

**Purpose:** Encapsulate all todo logic in a reusable hook

```typescript
export const useTodoState = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  
  const createTodo = useCallback(async (dto: CreateTodoDto) => {
    const response = await api.post('/todos', dto);
    setTodos([response.data, ...todos]);
  }, [todos]);
  
  return {
    todos,
    loading,
    createTodo,
    // ... other methods
  };
};
```

### **Using the Custom Hook**

```typescript
function TodoApp() {
  const {
    todos,
    loading,
    createTodo,
    toggleTodo,
    deleteTodo
  } = useTodoState();
  
  return (
    <div>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      ))}
    </div>
  );
}
```

### **Advantages**

✅ Reusable across components  
✅ Separates logic from UI  
✅ Easy to test  
✅ No prop drilling  
✅ Lightweight  

### **Disadvantages**

❌ Creates new instance per component  
❌ No shared state between components  
❌ Can cause unnecessary re-renders  

---

## Context API Pattern

### **TodoContext Implementation**

**File:** [`src/context/TodoContext.tsx`](src/context/TodoContext.tsx)

### **1. Create Context**

```typescript
interface TodoContextState {
  todos: Todo[];
  loading: boolean;
  createTodo: (dto: CreateTodoDto) => Promise<void>;
  // ... other methods
}

const TodoContext = createContext<TodoContextState | undefined>(undefined);
```

### **2. Create Provider**

```typescript
export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  
  const createTodo = useCallback(async (dto: CreateTodoDto) => {
    const response = await api.post('/todos', dto);
    setTodos([response.data, ...todos]);
  }, [todos]);
  
  const value = {
    todos,
    loading,
    createTodo,
    // ... other methods
  };
  
  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};
```

### **3. Create Custom Hook**

```typescript
export const useTodoContext = () => {
  const context = useContext(TodoContext);
  
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  
  return context;
};
```

### **4. Wrap App with Provider**

```typescript
// src/AppWithContext.tsx
function App() {
  return (
    <TodoProvider>
      <TodoAppWithContext />
    </TodoProvider>
  );
}
```

### **5. Use Context in Components**

```typescript
function TodoAppWithContext() {
  const {
    todos,
    loading,
    createTodo,
    toggleTodo,
    deleteTodo
  } = useTodoContext();
  
  return (
    <div>
      <TodoForm onCreate={createTodo} />
      <TodoList 
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
}
```

### **Advantages**

✅ Single source of truth  
✅ No prop drilling  
✅ Shared state across components  
✅ Easy to test  
✅ Scales well  

### **Disadvantages**

❌ Can cause unnecessary re-renders  
❌ More boilerplate  
❌ Harder to debug  

---

## Comparison & Best Practices

### **When to Use Each Pattern**

| Scenario | Recommended Pattern |
|----------|---------------------|
| Single component app | **Component State** (useState) |
| Reusable logic | **Custom Hook** (useTodoState) |
| Multiple components need same data | **Context API** (TodoContext) |
| Deep component tree | **Context API** |
| Performance critical | **Custom Hook** + memo |
| Large application | **Redux** or **Zustand** |

### **Performance Optimization**

#### **1. Memoization**

```typescript
// Memoize computed values
const filteredTodos = useMemo(() => {
  return todos.filter(todo => !todo.completed);
}, [todos]);

// Memoize callbacks
const handleCreate = useCallback(async (dto: CreateTodoDto) => {
  await createTodo(dto);
}, [createTodo]);
```

#### **2. Split Contexts**

```typescript
// Instead of one large context
<TodoProvider>
  <UserProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </UserProvider>
</TodoProvider>

// Split by domain
<TodoDataProvider>  {/* Data operations */}
  <TodoUIProvider>  {/* UI state */}
    <App />
  </TodoUIProvider>
</TodoDataProvider>
```

#### **3. Selective Updates**

```typescript
// Use multiple contexts for different concerns
const TodoDataContext = createContext(...);  // todos, loading
const TodoActionsContext = createContext(...); // createTodo, updateTodo

// Components only re-render when their context changes
function TodoList() {
  const { todos } = useTodoData();  // Only re-renders on data change
  return <div>{todos.map(...)}</div>;
}

function TodoForm() {
  const { createTodo } = useTodoActions();  // Never re-renders
  return <form onSubmit={createTodo}>...</form>;
}
```

---

## Usage Examples

### **Example 1: Basic Component State**

```typescript
function SimpleTodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function loadTodos() {
      setLoading(true);
      const response = await fetch('/todos');
      setTodos(await response.json());
      setLoading(false);
    }
    loadTodos();
  }, []);
  
  const addTodo = async (title: string) => {
    const response = await fetch('/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    const newTodo = await response.json();
    setTodos([newTodo, ...todos]);
  };
  
  return <div>{loading ? 'Loading...' : todos.map(...)}</div>;
}
```

### **Example 2: Custom Hook**

```typescript
function TodoAppWithHook() {
  const {
    todos,
    loading,
    createTodo,
    toggleTodo,
    deleteTodo,
  } = useTodoState();
  
  const handleSubmit = async (data: FormData) => {
    await createTodo(data);
  };
  
  return (
    <div>
      <TodoForm onSubmit={handleSubmit} />
      <TodoList 
        todos={todos}
        loading={loading}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
}
```

### **Example 3: Context API**

```typescript
// App.tsx
function App() {
  return (
    <TodoProvider>
      <Layout>
        <TodoForm />
        <TodoList />
        <TodoStats />
      </Layout>
    </TodoProvider>
  );
}

// TodoForm.tsx
function TodoForm() {
  const { createTodo, submitLoading } = useTodoContext();
  // Component logic...
}

// TodoList.tsx
function TodoList() {
  const { filteredTodos, loading } = useTodoContext();
  // Component logic...
}

// TodoStats.tsx
function TodoStats() {
  const { activeCount, completedCount } = useTodoContext();
  // Component logic...
}
```

---

## State Structure

### **Recommended State Shape**

```typescript
interface AppState {
  // Data
  todos: Todo[];
  
  // UI State
  loading: boolean;
  error: string | null;
  submitLoading: boolean;
  
  // Filter State
  filter: 'all' | 'active' | 'completed';
  
  // Form State (keep local)
  formData: { title: string; description: string };
  editingId: string | null;
}
```

### **State Normalization**

For large datasets, normalize state:

```typescript
interface NormalizedState {
  todos: {
    byId: { [id: string]: Todo };
    allIds: string[];
  };
  ui: {
    loading: boolean;
    error: string | null;
  };
}

// Access
const todo = state.todos.byId[id];
const allTodos = state.todos.allIds.map(id => state.todos.byId[id]);
```

---

## Testing

### **Testing Component State**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoApp from './TodoApp';

test('creates todo', async () => {
  render(<TodoApp />);
  
  const input = screen.getByPlaceholderText('What needs to be done?');
  const button = screen.getByText('Add Todo');
  
  await userEvent.type(input, 'New Todo');
  await userEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText('New Todo')).toBeInTheDocument();
  });
});
```

### **Testing Custom Hook**

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useTodoState } from './useTodoState';

test('creates todo', async () => {
  const { result } = renderHook(() => useTodoState());
  
  await act(async () => {
    await result.current.createTodo({ title: 'Test Todo' });
  });
  
  expect(result.current.todos).toHaveLength(1);
  expect(result.current.todos[0].title).toBe('Test Todo');
});
```

### **Testing Context**

```typescript
import { render, screen } from '@testing-library/react';
import { TodoProvider } from './TodoContext';
import TodoApp from './TodoApp';

test('provides context to children', () => {
  render(
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  );
  
  expect(screen.getByText('Todo List')).toBeInTheDocument();
});
```

---

## Migration Guide

### **Component State → Custom Hook**

```typescript
// Before: Component State
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const createTodo = async (dto) => { /* ... */ };
  // ... logic
}

// After: Custom Hook
function TodoApp() {
  const { todos, createTodo } = useTodoState();
  // ... UI only
}
```

### **Custom Hook → Context API**

```typescript
// Before: Custom Hook (each component has own state)
function App() {
  return (
    <>
      <TodoForm />  {/* useTodoState() */}
      <TodoList />  {/* useTodoState() */}
    </>
  );
}

// After: Context API (shared state)
function App() {
  return (
    <TodoProvider>
      <TodoForm />  {/* useTodoContext() */}
      <TodoList />  {/* useTodoContext() */}
    </TodoProvider>
  );
}
```

---

## Quick Reference

### **useState**

```typescript
const [state, setState] = useState(initialValue);
setState(newValue);
setState(prev => prev + 1);
```

### **useEffect**

```typescript
useEffect(() => {
  // Effect
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

### **useCallback**

```typescript
const memoizedFn = useCallback(() => {
  // Function
}, [dependencies]);
```

### **useContext**

```typescript
const value = useContext(MyContext);
```

### **useMemo**

```typescript
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

---

## Files Reference

| File | Purpose |
|------|---------|
| [`TodoContext.tsx`](src/context/TodoContext.tsx) | Context API implementation |
| [`useTodoState.ts`](src/hooks/useTodoState.ts) | Custom hook pattern |
| [`TodoApp.tsx`](src/components/TodoApp/TodoApp.tsx) | Basic component state |
| [`TodoAppWithContext.tsx`](src/components/TodoApp/TodoAppWithContext.tsx) | Context consumer |
| [`AppWithContext.tsx`](src/AppWithContext.tsx) | App with provider |

---

## Next Steps

1. **Try Context API**: Replace `App.tsx` with `AppWithContext.tsx`
2. **Compare Performance**: Test both implementations
3. **Add More Features**: Categories, tags, priorities
4. **Consider Redux**: For larger applications
5. **Optimize Re-renders**: Use React DevTools Profiler

---

**Choose the right pattern for your needs!** 🚀

- **Small app**: Component State
- **Medium app**: Custom Hooks
- **Large app**: Context API or Redux
