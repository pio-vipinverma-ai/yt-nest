# Todo API Testing Examples

This file contains examples for testing the Todo API using different tools.

## Using cURL (Windows PowerShell)

### 1. Create a Todo
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Buy groceries","description":"Milk, bread, eggs"}'
```

Or using curl (if installed):
```bash
curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d "{\"title\":\"Buy groceries\",\"description\":\"Milk, bread, eggs\"}"
```

### 2. Get All Todos
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos" -Method GET
```

### 3. Get Completed Todos
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos?status=completed" -Method GET
```

### 4. Get Pending Todos
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos?status=pending" -Method GET
```

### 5. Get Single Todo
```powershell
$todoId = "your-todo-id-here"
Invoke-RestMethod -Uri "http://localhost:3000/todos/$todoId" -Method GET
```

### 6. Update Todo
```powershell
$todoId = "your-todo-id-here"
Invoke-RestMethod -Uri "http://localhost:3000/todos/$todoId" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"completed":true,"title":"Updated title"}'
```

### 7. Delete Todo
```powershell
$todoId = "your-todo-id-here"
Invoke-RestMethod -Uri "http://localhost:3000/todos/$todoId" -Method DELETE
```

## Using Fetch (Browser/Node.js)

### Create Todo
```javascript
fetch('http://localhost:3000/todos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Buy groceries',
    description: 'Milk, bread, eggs'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Get All Todos
```javascript
fetch('http://localhost:3000/todos')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Update Todo
```javascript
const todoId = 'your-todo-id-here';
fetch(`http://localhost:3000/todos/${todoId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    completed: true
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Delete Todo
```javascript
const todoId = 'your-todo-id-here';
fetch(`http://localhost:3000/todos/${todoId}`, {
  method: 'DELETE'
});
```

## Using Axios (Node.js/React)

### Setup
```bash
npm install axios
```

### Create Todo
```javascript
import axios from 'axios';

axios.post('http://localhost:3000/todos', {
  title: 'Buy groceries',
  description: 'Milk, bread, eggs'
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### Get All Todos
```javascript
axios.get('http://localhost:3000/todos')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### Update Todo
```javascript
const todoId = 'your-todo-id-here';
axios.patch(`http://localhost:3000/todos/${todoId}`, {
  completed: true
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

## Complete Testing Script (PowerShell)

```powershell
# Test Todo API
Write-Host "Testing Todo API..." -ForegroundColor Green

# 1. Create a todo
Write-Host "`n1. Creating a todo..." -ForegroundColor Yellow
$todo1 = Invoke-RestMethod -Uri "http://localhost:3000/todos" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Learn NestJS","description":"Complete the tutorial"}'
Write-Host "Created: $($todo1.title) (ID: $($todo1.id))"

# 2. Create another todo
Write-Host "`n2. Creating another todo..." -ForegroundColor Yellow
$todo2 = Invoke-RestMethod -Uri "http://localhost:3000/todos" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Build Todo App"}'
Write-Host "Created: $($todo2.title) (ID: $($todo2.id))"

# 3. Get all todos
Write-Host "`n3. Getting all todos..." -ForegroundColor Yellow
$todos = Invoke-RestMethod -Uri "http://localhost:3000/todos" -Method GET
Write-Host "Total todos: $($todos.Count)"
$todos | ForEach-Object { Write-Host "  - $($_.title) (Completed: $($_.completed))" }

# 4. Update first todo
Write-Host "`n4. Marking first todo as completed..." -ForegroundColor Yellow
$updated = Invoke-RestMethod -Uri "http://localhost:3000/todos/$($todo1.id)" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"completed":true}'
Write-Host "Updated: $($updated.title) (Completed: $($updated.completed))"

# 5. Get completed todos
Write-Host "`n5. Getting completed todos..." -ForegroundColor Yellow
$completed = Invoke-RestMethod -Uri "http://localhost:3000/todos?status=completed" -Method GET
Write-Host "Completed todos: $($completed.Count)"
$completed | ForEach-Object { Write-Host "  - $($_.title)" }

# 6. Get pending todos
Write-Host "`n6. Getting pending todos..." -ForegroundColor Yellow
$pending = Invoke-RestMethod -Uri "http://localhost:3000/todos?status=pending" -Method GET
Write-Host "Pending todos: $($pending.Count)"
$pending | ForEach-Object { Write-Host "  - $($_.title)" }

# 7. Delete a todo
Write-Host "`n7. Deleting second todo..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/todos/$($todo2.id)" -Method DELETE
Write-Host "Deleted todo with ID: $($todo2.id)"

# 8. Verify deletion
Write-Host "`n8. Verifying deletion..." -ForegroundColor Yellow
$remaining = Invoke-RestMethod -Uri "http://localhost:3000/todos" -Method GET
Write-Host "Remaining todos: $($remaining.Count)"
$remaining | ForEach-Object { Write-Host "  - $($_.title)" }

Write-Host "`nAll tests completed!" -ForegroundColor Green
```

Save this script as `test-api.ps1` and run:
```powershell
.\test-api.ps1
```

## Using Postman

1. **Create Collection**: "Todo API"

2. **Add Requests**:

   **Create Todo** - POST `http://localhost:3000/todos`
   ```json
   {
     "title": "Buy groceries",
     "description": "Milk, bread, eggs"
   }
   ```

   **Get All Todos** - GET `http://localhost:3000/todos`

   **Get Todo by ID** - GET `http://localhost:3000/todos/{{todoId}}`

   **Update Todo** - PATCH `http://localhost:3000/todos/{{todoId}}`
   ```json
   {
     "completed": true
   }
   ```

   **Delete Todo** - DELETE `http://localhost:3000/todos/{{todoId}}`

## Expected Responses

### Success - Create Todo (201)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "createdAt": "2026-06-09T10:00:00.000Z",
  "updatedAt": "2026-06-09T10:00:00.000Z"
}
```

### Success - Get All Todos (200)
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "createdAt": "2026-06-09T10:00:00.000Z",
    "updatedAt": "2026-06-09T10:00:00.000Z"
  }
]
```

### Success - Delete Todo (204)
```
No content
```

### Error - Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Todo with ID \"invalid-id\" not found",
  "error": "Not Found"
}
```

### Error - Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "title must be a string",
    "title must be shorter than or equal to 100 characters"
  ],
  "error": "Bad Request"
}
```

## Database Inspection

To view the SQLite database:

1. Install SQLite browser or use VS Code extension
2. Open `todos.db` file
3. View `todos` table

Or use command line:
```bash
sqlite3 todos.db
.tables
SELECT * FROM todos;
.exit
```
