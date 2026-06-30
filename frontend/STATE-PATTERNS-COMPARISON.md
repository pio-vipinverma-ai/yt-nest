# State Management Patterns - Quick Comparison

This document shows how to use each state management pattern in the Todo app.

---

## 🎯 Three Approaches Available

### **1. Component State (Original)**
- ✅ File: `TodoApp.tsx`
- ✅ Uses: `useState`, `useEffect`
- ✅ Best for: Single component, simple apps

### **2. Custom Hook**
- ✅ File: `useTodoState.ts`
- ✅ Uses: Encapsulated logic in hook
- ✅ Best for: Reusable logic, multiple components

### **3. Context API**
- ✅ File: `TodoContext.tsx` + `TodoAppWithContext.tsx`
- ✅ Uses: Global state with Provider
- ✅ Best for: Shared state, avoiding prop drilling

---

## 🚀 How to Switch Between Patterns

### **Option 1: Component State (Current)**

```typescript
// src/App.tsx
import TodoApp from './components/TodoApp/TodoApp';

function App() {
  return <TodoApp />;
}
```

### **Option 2: Custom Hook**

```typescript
// Create new component using the hook
import { useTodoState } from './hooks/useTodoState';

function TodoAppWithHook() {
  const {
    filteredTodos,
    loading,
    createTodo,
    toggleTodo,
    deleteTodo,
  } = useTodoState();
  
  // Your UI code here
  return <div>...</div>;
}
```

### **Option 3: Context API** (Recommended for scaling)

```typescript
// src/index.tsx or src/App.tsx
import AppWithContext from './AppWithContext';

// Replace <App /> with:
root.render(<AppWithContext />);
```

**That's it!** TodoProvider wraps the app and provides state globally.

---

## 📊 Feature Comparison

| Feature | Component State | Custom Hook | Context API |
|---------|----------------|-------------|-------------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| **Code Organization** | ❌ Mixed | ✅ Separated | ✅ Centralized |
| **Reusability** | ❌ No | ✅ Yes | ✅ Yes |
| **Shared State** | ❌ No | ❌ No | ✅ Yes |
| **Prop Drilling** | ❌ Yes | ⚠️ Partial | ✅ No |
| **Performance** | ✅ Good | ✅ Good | ⚠️ Can optimize |
| **Testing** | ✅ Easy | ✅ Easy | ⚠️ Medium |
| **Bundle Size** | ✅ Smallest | ✅ Small | ⚠️ Medium |

---

## 💻 Code Examples

### **1. Component State Pattern**

```typescript
function TodoApp() {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    fetchTodos();
  }, []);
  
  // Actions
  const fetchTodos = async () => {
    setLoading(true);
    const response = await api.get('/todos');
    setTodos(response.data);
    setLoading(false);
  };
  
  const createTodo = async (dto) => {
    const response = await api.post('/todos', dto);
    setTodos([response.data, ...todos]);
  };
  
  // Render
  return (
    <div>
      <TodoForm onCreate={createTodo} />
      <TodoList todos={todos} loading={loading} />
    </div>
  );
}
```

**Pros:**
- ✅ Simple and straightforward
- ✅ All logic in one place
- ✅ Easy to understand

**Cons:**
- ❌ Mixed concerns (UI + logic)
- ❌ Hard to reuse
- ❌ Gets messy as app grows

---

### **2. Custom Hook Pattern**

```typescript
// useTodoState.ts
export const useTodoState = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  
  const createTodo = useCallback(async (dto) => {
    const response = await api.post('/todos', dto);
    setTodos([response.data, ...todos]);
  }, [todos]);
  
  return { todos, loading, createTodo };
};

// TodoApp.tsx
function TodoApp() {
  const { todos, loading, createTodo } = useTodoState();
  
  return (
    <div>
      <TodoForm onCreate={createTodo} />
      <TodoList todos={todos} loading={loading} />
    </div>
  );
}
```

**Pros:**
- ✅ Separates logic from UI
- ✅ Reusable across components
- ✅ Easy to test
- ✅ Clean component code

**Cons:**
- ❌ Creates new instance per component
- ❌ No shared state
- ❌ Need to pass props

---

### **3. Context API Pattern**

```typescript
// TodoContext.tsx
export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  
  const createTodo = useCallback(async (dto) => {
    const response = await api.post('/todos', dto);
    setTodos([response.data, ...todos]);
  }, [todos]);
  
  return (
    <TodoContext.Provider value={{ todos, createTodo }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => useContext(TodoContext);

// App.tsx
function App() {
  return (
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  );
}

// TodoApp.tsx
function TodoApp() {
  const { todos, createTodo } = useTodoContext();
  
  return (
    <div>
      <TodoForm />  {/* No props needed! */}
      <TodoList />  {/* No props needed! */}
    </div>
  );
}

// TodoForm.tsx
function TodoForm() {
  const { createTodo, submitLoading } = useTodoContext();
  // Component automatically has access to state!
}
```

**Pros:**
- ✅ Single source of truth
- ✅ No prop drilling
- ✅ Shared state globally
- ✅ Scales well
- ✅ Clean component tree

**Cons:**
- ❌ More boilerplate
- ❌ Can cause re-renders
- ❌ Harder to debug

---

## 🎯 When to Use Each

### **Use Component State When:**
- 📝 Building a small, single-page app
- 📝 State is only used in one component
- 📝 Learning React basics
- 📝 Prototyping quickly

### **Use Custom Hook When:**
- 📝 Need to reuse logic across components
- 📝 Want separation of concerns
- 📝 Each component needs its own state
- 📝 Building a library

### **Use Context API When:**
- 📝 Multiple components need same data
- 📝 Deep component tree (prop drilling)
- 📝 Global settings (theme, auth, i18n)
- 📝 Medium to large applications
- 📝 Need centralized state management

---

## 🔄 Migration Path

```
Component State
      ↓
Custom Hook (refactor logic)
      ↓
Context API (share state)
      ↓
Redux/Zustand (complex apps)
```

---

## 🧪 Try It Yourself

### **Step 1: See Component State**
```typescript
// Current setup in App.tsx
import TodoApp from './components/TodoApp/TodoApp';
```
✅ Already working!

### **Step 2: Try Custom Hook**
```typescript
// Create TodoAppWithHook.tsx
import { useTodoState } from './hooks/useTodoState';

function TodoAppWithHook() {
  const todoState = useTodoState();
  // Use todoState...
}

// In App.tsx
import TodoAppWithHook from './TodoAppWithHook';
```

### **Step 3: Try Context API**
```typescript
// In src/index.tsx
import AppWithContext from './AppWithContext';

root.render(<AppWithContext />);
```

---

## 📈 Performance Considerations

### **Component State**
```typescript
// Re-renders when state changes
const [todos, setTodos] = useState([]);
// ✅ Only this component re-renders
```

### **Custom Hook**
```typescript
// Each component gets its own instance
const Component1 = () => useTodoState(); // Instance 1
const Component2 = () => useTodoState(); // Instance 2
// ⚠️ Not sharing state!
```

### **Context API**
```typescript
// All consumers re-render when context changes
<TodoProvider>
  <TodoForm />   {/* Re-renders */}
  <TodoList />   {/* Re-renders */}
  <TodoStats />  {/* Re-renders */}
</TodoProvider>

// Optimize with memo
const TodoForm = memo(() => {
  const { createTodo } = useTodoContext();
  // Only re-renders if createTodo changes
});
```

---

## 🎓 Learning Path

1. **Week 1**: Master Component State
   - Practice useState
   - Practice useEffect
   - Build small components

2. **Week 2**: Learn Custom Hooks
   - Extract logic to hooks
   - Practice useCallback
   - Practice useMemo

3. **Week 3**: Understand Context API
   - Create simple contexts
   - Practice useContext
   - Optimize re-renders

4. **Week 4**: Advanced Patterns
   - Multiple contexts
   - Context splitting
   - Performance optimization

---

## 📚 Resources

### **Files to Study**

1. **Component State**
   - [`TodoApp.tsx`](src/components/TodoApp/TodoApp.tsx)
   - Simple, all-in-one implementation

2. **Custom Hook**
   - [`useTodoState.ts`](src/hooks/useTodoState.ts)
   - Reusable hook implementation

3. **Context API**
   - [`TodoContext.tsx`](src/context/TodoContext.tsx)
   - Provider implementation
   - [`TodoAppWithContext.tsx`](src/components/TodoApp/TodoAppWithContext.tsx)
   - Consumer implementation
   - [`AppWithContext.tsx`](src/AppWithContext.tsx)
   - App wrapper

### **Official Docs**

- [useState Hook](https://react.dev/reference/react/useState)
- [useEffect Hook](https://react.dev/reference/react/useEffect)
- [useContext Hook](https://react.dev/reference/react/useContext)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Context API](https://react.dev/learn/passing-data-deeply-with-context)

---

## ✅ Quick Decision Tree

```
Do you need shared state?
├─ No → Use Component State or Custom Hook
│  ├─ Reusable logic? → Custom Hook
│  └─ Simple component? → Component State
│
└─ Yes → Use Context API or Redux
   ├─ Medium complexity? → Context API
   └─ Large app? → Redux/Zustand
```

---

## 🚀 Recommendation for This Project

For the **Todo App**, I recommend:

### **Starting Out**
✅ **Component State** - Already implemented, works great!

### **Growing App**
✅ **Context API** - When you add:
- User authentication
- Multiple pages/routes
- Shared settings
- Multiple features

### **Large Scale**
✅ **Redux/Zustand** - When you need:
- Time-travel debugging
- Middleware (logging, analytics)
- DevTools integration
- Complex state interactions

---

## 💡 Pro Tips

1. **Start Simple**: Use component state first
2. **Extract When Needed**: Move to custom hooks when you repeat logic
3. **Go Global Carefully**: Only use Context for truly global state
4. **Split Contexts**: Create separate contexts for different domains
5. **Measure Performance**: Use React DevTools Profiler
6. **Don't Over-Engineer**: Context is often enough, Redux isn't always needed

---

**Choose wisely and build amazing apps!** 🎉
