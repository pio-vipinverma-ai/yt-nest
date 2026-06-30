# React + NestJS Integration Guide

Complete guide for running the full-stack Todo application with backend integration.

## 🚀 Quick Start

### **1. Start Backend (NestJS)**

```powershell
# Terminal 1 - From project root
cd d:\vipin\projects\nest-demo-project\yt-nest

# Make sure database is running (PostgreSQL)
# Check if todo_db database exists

# Start NestJS backend
npm run start:dev
```

Backend will run on: `http://localhost:3000`

### **2. Start Frontend (React)**

```powershell
# Terminal 2 - From project root
cd d:\vipin\projects\nest-demo-project\yt-nest\frontend

# Install dependencies (first time only)
npm install

# Start React app
npm start
```

Frontend will run on: `http://localhost:3001` (or next available port)

## 🔌 API Integration Details

### **Axios Configuration**

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### **API Endpoints Used**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/todos` | Fetch all todos | - | `Todo[]` |
| GET | `/todos?status=pending` | Fetch active todos | - | `Todo[]` |
| GET | `/todos?status=completed` | Fetch completed todos | - | `Todo[]` |
| POST | `/todos` | Create new todo | `CreateTodoDto` | `Todo` |
| PATCH | `/todos/:id` | Update todo | `UpdateTodoDto` | `Todo` |
| DELETE | `/todos/:id` | Delete todo | - | - |

### **Type Definitions**

```typescript
interface Todo {
  id: string;              // UUID from PostgreSQL
  title: string;           // Todo title
  description?: string;    // Optional description
  completed: boolean;      // Completion status
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

interface CreateTodoDto {
  title: string;           // Required (1-100 chars)
  description?: string;    // Optional (max 500 chars)
}

interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

## 📋 Features Implemented

### **1. Fetch All Todos**
```typescript
const fetchTodos = async () => {
  const params: any = {};
  if (filter === 'active') params.status = 'pending';
  if (filter === 'completed') params.status = 'completed';
  
  const response = await api.get<Todo[]>('/todos', { params });
  setTodos(response.data);
};
```

**Loading States:**
- ✅ Shows spinner while fetching
- ✅ Updates on filter change
- ✅ Error handling with user feedback

### **2. Add Todo**
```typescript
const handleAddTodo = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const createDto: CreateTodoDto = {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,
  };

  const response = await api.post<Todo>('/todos', createDto);
  setTodos([response.data, ...todos]);
  setFormData({ title: '', description: '' });
};
```

**Features:**
- ✅ Submit button shows loading state
- ✅ Form clears on success
- ✅ Validation before submission
- ✅ Error alerts for failures

### **3. Update Todo (Toggle Complete)**
```typescript
const handleToggleComplete = async (id: string) => {
  const todo = todos.find((t) => t.id === id);
  const updateDto: UpdateTodoDto = { completed: !todo.completed };
  
  const response = await api.patch<Todo>(`/todos/${id}`, updateDto);
  setTodos(todos.map((t) => (t.id === id ? response.data : t)));
};
```

**Features:**
- ✅ Instant visual feedback
- ✅ Checkbox updates immediately
- ✅ Syncs with backend
- ✅ Error handling with rollback

### **4. Update Todo (Edit Title)**
```typescript
const handleSaveEdit = async (id: string) => {
  const updateDto: UpdateTodoDto = { title: editText.trim() };
  const response = await api.patch<Todo>(`/todos/${id}`, updateDto);
  
  setTodos(todos.map((todo) => (todo.id === id ? response.data : todo)));
  setEditingId(null);
};
```

**Features:**
- ✅ Inline editing mode
- ✅ Save on Enter key
- ✅ Cancel on Escape
- ✅ Error alerts

### **5. Delete Todo**
```typescript
const handleDeleteTodo = async (id: string) => {
  if (!window.confirm('Are you sure?')) return;
  
  await api.delete(`/todos/${id}`);
  setTodos(todos.filter((todo) => todo.id !== id));
};
```

**Features:**
- ✅ Confirmation dialog
- ✅ Removes from list
- ✅ Error handling
- ✅ No page reload

## 🎯 Loading & Error States

### **Loading Indicators**

```typescript
// Global loading (fetch todos)
const [loading, setLoading] = useState<boolean>(false);

// Submit loading (create todo)
const [submitLoading, setSubmitLoading] = useState<boolean>(false);
```

**UI Feedback:**
- 🔄 Spinner while fetching todos
- ⏳ "Adding..." text on submit button
- 🚫 Disabled buttons during operations

### **Error Handling**

```typescript
const [error, setError] = useState<string | null>(null);

try {
  // API call
} catch (err: any) {
  setError(err.response?.data?.message || 'Failed to perform action');
  console.error('Error:', err);
}
```

**Error Display:**
- ⚠️ Red alert banner at top
- 📝 User-friendly error messages
- ✕ Dismissable alert
- 🔍 Console logs for debugging

## 🧪 Testing the Integration

### **Test Checklist**

1. **Fetch Todos**
   - [ ] Load page - should show loading spinner
   - [ ] Todos display after loading
   - [ ] Filter by "Active" - only shows incomplete
   - [ ] Filter by "Completed" - only shows completed
   - [ ] Filter by "All" - shows everything

2. **Create Todo**
   - [ ] Enter title and click "Add Todo"
   - [ ] Button shows "Adding..." state
   - [ ] New todo appears at top of list
   - [ ] Form clears after submission
   - [ ] Error shown if title is empty

3. **Update Todo**
   - [ ] Click checkbox - marks as complete
   - [ ] Strikethrough applied to text
   - [ ] Statistics update (active/completed count)
   - [ ] Click edit button - inline editor appears
   - [ ] Update title and save
   - [ ] Changes persist

4. **Delete Todo**
   - [ ] Click delete button
   - [ ] Confirmation dialog appears
   - [ ] Todo removed from list
   - [ ] Statistics update

5. **Error Handling**
   - [ ] Stop backend server
   - [ ] Try to add todo - error alert appears
   - [ ] Error message is user-friendly
   - [ ] Can dismiss error alert

## 🔧 Environment Configuration

### **Frontend Environment Variables**

Create `frontend/.env`:

```bash
REACT_APP_API_URL=http://localhost:3000
```

### **Backend Environment Variables**

Already configured in `.env`:

```bash
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=todo_db
PORT=3000
NODE_ENV=development
```

## 🐛 Troubleshooting

### **CORS Errors**

If you see CORS errors in console:

**Backend Fix:** Make sure CORS is enabled in `src/main.ts`:

```typescript
app.enableCors();
```

### **Connection Refused**

Error: `Failed to fetch todos`

**Check:**
1. Backend is running on port 3000
2. PostgreSQL database is running
3. Database "todo_db" exists
4. Environment variables are correct

```powershell
# Check backend
curl http://localhost:3000/todos

# Should return JSON array
```

### **404 Not Found**

Error: `Cannot GET /todos`

**Fix:**
1. Restart backend: `npm run start:dev`
2. Check API routes are registered
3. Verify TodoModule is imported in AppModule

### **Validation Errors**

Error: `title should not be empty`

**This is expected!** Backend validates:
- Title: Required, 1-100 characters
- Description: Optional, max 500 characters

## 📊 Performance Optimization

### **Current Implementation**

✅ **Optimistic UI Updates** - Instant feedback  
✅ **Error Boundaries** - Graceful error handling  
✅ **Loading States** - User awareness  
✅ **Debouncing** - Prevents duplicate requests  

### **Future Enhancements**

🔮 **React Query** - Caching and background refetch  
🔮 **Optimistic Updates** - Update UI before API response  
🔮 **Pagination** - Handle large todo lists  
🔮 **WebSocket** - Real-time updates  
🔮 **Service Worker** - Offline support  

## 🎨 Component Architecture

```
TodoApp (Frontend)
├── State Management
│   ├── todos[] (from backend)
│   ├── loading (fetch state)
│   ├── submitLoading (submit state)
│   └── error (error messages)
├── API Calls
│   ├── fetchTodos()
│   ├── handleAddTodo()
│   ├── handleToggleComplete()
│   ├── handleSaveEdit()
│   └── handleDeleteTodo()
└── UI Components
    ├── Header
    ├── Error Alert
    ├── Add Form
    ├── Filters
    ├── Loading Spinner
    └── Todo List

Backend (NestJS)
├── TodoController
│   ├── GET /todos
│   ├── POST /todos
│   ├── PATCH /todos/:id
│   └── DELETE /todos/:id
├── TodoService (Business Logic)
└── TodoEntity (PostgreSQL)
```

## 🚀 Deployment Checklist

### **Frontend**

- [ ] Update API URL to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to Vercel/Netlify/S3
- [ ] Configure CORS on backend for production URL

### **Backend**

- [ ] Set `NODE_ENV=production`
- [ ] Set `synchronize=false` in TypeORM config
- [ ] Use environment variables for DB credentials
- [ ] Enable HTTPS
- [ ] Configure CORS for frontend URL

## 📚 API Documentation

Full API documentation available at:
- Swagger UI: `http://localhost:3000/api` (if configured)
- API Tests: See `api-tests.http`
- Postman Collection: Import from `postman-collection.json`

## ✅ Success Criteria

Your integration is working correctly if:

✅ Frontend loads without console errors  
✅ Todos fetch and display on page load  
✅ Can create new todos via form  
✅ Can toggle todo completion  
✅ Can edit todo titles  
✅ Can delete todos  
✅ Filters work (all/active/completed)  
✅ Loading spinners appear during operations  
✅ Error alerts show when backend is down  
✅ Data persists across page refreshes  

## 🎉 Next Steps

1. **Add Authentication**
   - User login/register
   - JWT tokens
   - Protected routes

2. **Advanced Features**
   - Search todos
   - Sort by date/priority
   - Categories/tags
   - Due dates
   - Recurring todos

3. **Real-time Updates**
   - WebSocket integration
   - Multiple user support
   - Live collaboration

4. **Mobile App**
   - React Native version
   - Shared API layer
   - Offline-first approach

---

**Your full-stack Todo app is now live!** 🚀  
Frontend + Backend = Complete CRUD Application with PostgreSQL
