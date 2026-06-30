# Todo App Architecture - State Management

Visual guide to understanding the three state management approaches.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Todo Application                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Component   │  │    Custom    │  │   Context    │ │
│  │    State     │  │     Hook     │  │     API      │ │
│  │              │  │              │  │              │ │
│  │  TodoApp.tsx │  │ useTodoState │  │TodoContext   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────────────┐
                    │ NestJS API   │
                    │ (Backend)    │
                    └──────────────┘
                           ↓
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │  (Database)  │
                    └──────────────┘
```

---

## 1️⃣ Component State Pattern

```
┌─────────────────────────────────────────┐
│           TodoApp Component              │
├─────────────────────────────────────────┤
│                                          │
│  State:                                  │
│  • const [todos, setTodos]              │
│  • const [loading, setLoading]          │
│  • const [error, setError]              │
│                                          │
│  Effects:                                │
│  • useEffect(() => fetchTodos())        │
│                                          │
│  Actions:                                │
│  • fetchTodos()                          │
│  • createTodo()                          │
│  • updateTodo()                          │
│  • deleteTodo()                          │
│                                          │
│  Render:                                 │
│  • TodoForm                              │
│  • TodoList                              │
│  • TodoItem                              │
│                                          │
└─────────────────────────────────────────┘
```

**Data Flow:**
```
User Action → Component Handler → API Call → Update State → Re-render
```

---

## 2️⃣ Custom Hook Pattern

```
┌───────────────────────────────────────────────────────┐
│                   useTodoState Hook                    │
├───────────────────────────────────────────────────────┤
│                                                        │
│  State Management:                                     │
│  • const [todos, setTodos] = useState([])             │
│  • const [loading, setLoading] = useState(false)      │
│                                                        │
│  Actions (useCallback):                                │
│  • fetchTodos()                                        │
│  • createTodo(dto)                                     │
│  • updateTodo(id, dto)                                 │
│  • deleteTodo(id)                                      │
│                                                        │
│  Returns:                                              │
│  { todos, loading, createTodo, updateTodo, ... }      │
│                                                        │
└───────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                    ↓
┌───────────────┐                  ┌───────────────┐
│  TodoApp      │                  │  AnotherComp  │
│  Component    │                  │  Component    │
├───────────────┤                  ├───────────────┤
│               │                  │               │
│ const state = │                  │ const state = │
│ useTodoState()│                  │ useTodoState()│
│               │                  │               │
│ // Use state  │                  │ // Use state  │
│               │                  │               │
└───────────────┘                  └───────────────┘
     ⚠️ Separate instances - NOT shared state
```

**Data Flow:**
```
Component → Hook → API Call → Hook State → Component Re-render
```

---

## 3️⃣ Context API Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    TodoProvider                          │
│                  (Context Provider)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  State (centralized):                                    │
│  • const [todos, setTodos] = useState([])               │
│  • const [loading, setLoading] = useState(false)        │
│  • const [filter, setFilter] = useState('all')          │
│                                                          │
│  Actions:                                                │
│  • fetchTodos() - API call                              │
│  • createTodo(dto) - API call                           │
│  • updateTodo(id, dto) - API call                       │
│  • deleteTodo(id) - API call                            │
│                                                          │
│  Computed Values:                                        │
│  • filteredTodos                                         │
│  • activeCount                                           │
│  • completedCount                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  TodoForm    │  │  TodoList    │  │  TodoStats   │
├──────────────┤  ├──────────────┤  ├──────────────┤
│              │  │              │  │              │
│ const {...}= │  │ const {...}= │  │ const {...}= │
│ useTodo      │  │ useTodo      │  │ useTodo      │
│ Context()    │  │ Context()    │  │ Context()    │
│              │  │              │  │              │
│ // Access    │  │ // Access    │  │ // Access    │
│ // createTodo│  │ // todos     │  │ // stats     │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
     ✅ Shared state across all components
```

**Data Flow:**
```
Any Component → Context Action → API Call → Context State Update
                                                    ↓
All Subscribed Components Re-render with New State
```

---

## 🔄 State Update Flow Comparison

### **Component State**
```
User clicks button
    ↓
handleCreateTodo()
    ↓
API: POST /todos
    ↓
setTodos([newTodo, ...todos])
    ↓
Component re-renders
    ↓
Children re-render
```

### **Custom Hook**
```
User clicks button
    ↓
Component calls createTodo()
    ↓
Hook: API POST /todos
    ↓
Hook: setTodos([newTodo, ...todos])
    ↓
Component re-renders (this component only)
```

### **Context API**
```
User clicks button in TodoForm
    ↓
TodoForm calls createTodo() from context
    ↓
Provider: API POST /todos
    ↓
Provider: setTodos([newTodo, ...todos])
    ↓
ALL components using useTodoContext() re-render
    ↓
TodoForm, TodoList, TodoStats all update
```

---

## 📊 Component Tree Visualization

### **Without Context (Prop Drilling)**

```
App
 ├─ state: { todos, loading }
 ├─ actions: { createTodo, deleteTodo }
 │
 ├─ TodoForm
 │   └─ props: { createTodo } ← Passed from App
 │
 └─ TodoSection
     └─ props: { todos, deleteTodo } ← Passed from App
         │
         ├─ TodoList
         │   └─ props: { todos } ← Passed through
         │       │
         │       └─ TodoItem
         │           └─ props: { todo, deleteTodo } ← Passed through
         │
         └─ TodoStats
             └─ props: { todos } ← Passed through
```

**Problem:** Props passed through multiple levels! 😫

### **With Context API**

```
<TodoProvider>  ← State lives here
  │
  ├─ App
  │   │
  │   ├─ TodoForm
  │   │   └─ useTodoContext() ← Direct access! ✅
  │   │
  │   └─ TodoSection
  │       │
  │       ├─ TodoList
  │       │   └─ useTodoContext() ← Direct access! ✅
  │       │       │
  │       │       └─ TodoItem
  │       │           └─ useTodoContext() ← Direct access! ✅
  │       │
  │       └─ TodoStats
  │           └─ useTodoContext() ← Direct access! ✅
```

**Solution:** Any component can access state directly! 🎉

---

## 🎯 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── TodoApp/
│   │       ├── TodoApp.tsx              ← Component State
│   │       ├── TodoAppWithContext.tsx   ← Context Consumer
│   │       └── TodoApp.css
│   │
│   ├── context/
│   │   └── TodoContext.tsx              ← Context Provider
│   │
│   ├── hooks/
│   │   └── useTodoState.ts              ← Custom Hook
│   │
│   ├── App.tsx                          ← Basic App
│   ├── AppWithContext.tsx               ← App with Provider
│   └── index.tsx
│
├── STATE-MANAGEMENT.md                  ← Full guide
├── STATE-PATTERNS-COMPARISON.md         ← Quick comparison
└── STATE-ARCHITECTURE.md                ← This file
```

---

## 🔧 Code Structure Comparison

### **Component State Structure**

```typescript
function TodoApp() {
  // ┌─── STATE ────┐
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ┌─── EFFECTS ────┐
  useEffect(() => {
    fetchTodos();
  }, []);
  
  // ┌─── ACTIONS ────┐
  const fetchTodos = async () => { /* ... */ };
  const createTodo = async () => { /* ... */ };
  
  // ┌─── RENDER ────┐
  return <div>...</div>;
}
```

### **Custom Hook Structure**

```typescript
// ┌─────── useTodoState.ts ───────┐
export const useTodoState = () => {
  const [todos, setTodos] = useState([]);
  
  const createTodo = useCallback(async () => {
    // Logic here
  }, []);
  
  return { todos, createTodo };
};

// ┌─────── TodoApp.tsx ───────┐
function TodoApp() {
  const { todos, createTodo } = useTodoState();
  
  return <div>...</div>;
}
```

### **Context API Structure**

```typescript
// ┌─────── TodoContext.tsx ───────┐
const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  
  const value = { todos, createTodo };
  
  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => useContext(TodoContext);

// ┌─────── App.tsx ───────┐
function App() {
  return (
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  );
}

// ┌─────── TodoApp.tsx ───────┐
function TodoApp() {
  const { todos, createTodo } = useTodoContext();
  
  return <div>...</div>;
}
```

---

## 🎨 Visual: State Location

### **Component State**
```
┌─────────────────┐
│    TodoApp      │ ← State lives here
│  ┌───────────┐  │
│  │ State:    │  │
│  │ • todos   │  │
│  │ • loading │  │
│  └───────────┘  │
└─────────────────┘
```

### **Custom Hook**
```
┌─────────────────┐
│ useTodoState()  │ ← State logic here
│  ┌───────────┐  │
│  │ State:    │  │
│  │ • todos   │  │
│  │ Actions:  │  │
│  │ • create  │  │
│  └───────────┘  │
└────────┬────────┘
         │ returns
         ↓
┌─────────────────┐
│    TodoApp      │ ← Component uses it
│  Uses hook      │
└─────────────────┘
```

### **Context API**
```
┌─────────────────┐
│  TodoProvider   │ ← State lives at top
│  ┌───────────┐  │
│  │ State:    │  │
│  │ • todos   │  │
│  │ • actions │  │
│  └───────────┘  │
│        │        │
│   Provides to   │
│        ↓        │
│  ┌───────────┐  │
│  │ TodoApp   │  │
│  │ TodoForm  │  │
│  │ TodoList  │  │
│  └───────────┘  │
└─────────────────┘
```

---

## 📈 Scalability Path

```
Small App (1-3 components)
    ↓ Component State
    │ ✅ Simple
    │ ✅ Fast to build
    │
Medium App (4-10 components)
    ↓ Custom Hook
    │ ✅ Reusable logic
    │ ✅ Cleaner code
    │
Large App (10+ components)
    ↓ Context API
    │ ✅ Shared state
    │ ✅ No prop drilling
    │
Enterprise App (50+ components)
    ↓ Redux / Zustand
    │ ✅ Advanced features
    │ ✅ DevTools
    │ ✅ Middleware
```

---

## 🎯 Quick Decision Guide

```
Do you have multiple components that need the same data?
│
├─ NO → Use Component State or Custom Hook
│   │
│   └─ Do you want to reuse the logic?
│       │
│       ├─ YES → Custom Hook
│       └─ NO → Component State
│
└─ YES → Use Context API or State Management Library
    │
    └─ Is your app complex?
        │
        ├─ NO → Context API
        └─ YES → Redux / Zustand
```

---

## 💡 Key Takeaways

1. **Component State**: ✅ Start here for simple apps
2. **Custom Hook**: ✅ Extract when logic is reused
3. **Context API**: ✅ Use when state is shared
4. **Redux/Zustand**: ✅ Use for complex applications

---

## 🚀 Try It Yourself

### **See Current Implementation (Component State)**
```bash
# Already running!
npm start
```

### **Try Context API Version**
```typescript
// In src/index.tsx, replace:
import App from './App';

// With:
import AppWithContext from './AppWithContext';
```

**Same functionality, different architecture!** 🎉

---

**Choose the right tool for the job!** Each pattern has its place. 🛠️
