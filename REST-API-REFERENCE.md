# Todo REST API - Complete Reference

## Base URL
```
http://localhost:3000/todos
```

## Authentication
Currently no authentication required. (Can be added with JWT guards)

---

## Endpoints

### 1. Create Todo
**POST** `/todos`

Create a new todo item.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Buy groceries",           // Required: 1-100 characters
  "description": "Milk, bread, eggs"  // Optional: max 500 characters
}
```

#### Validation Rules
- `title`: Required, string, 1-100 characters
- `description`: Optional, string, max 500 characters

#### Success Response
**Status Code:** `201 Created`

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

#### Error Responses

**400 Bad Request** - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "Title is required",
    "Title must be at least 1 character",
    "Title must not exceed 100 characters"
  ],
  "error": "Bad Request"
}
```

#### cURL Example
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, bread, eggs"}'
```

#### PowerShell Example
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Buy groceries","description":"Milk, bread, eggs"}'
```

---

### 2. Get All Todos
**GET** `/todos`

Retrieve all todo items with optional filtering.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by completion status: `completed` or `pending` |

#### Request Examples
```
GET /todos                    # Get all todos
GET /todos?status=completed   # Get only completed todos
GET /todos?status=pending     # Get only pending todos
```

#### Success Response
**Status Code:** `200 OK`

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "createdAt": "2026-06-09T10:00:00.000Z",
    "updatedAt": "2026-06-09T10:00:00.000Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "title": "Complete assignment",
    "description": null,
    "completed": true,
    "createdAt": "2026-06-08T09:00:00.000Z",
    "updatedAt": "2026-06-09T11:00:00.000Z"
  }
]
```

#### Empty Result
```json
[]
```

#### cURL Examples
```bash
# Get all
curl http://localhost:3000/todos

# Get completed
curl "http://localhost:3000/todos?status=completed"

# Get pending
curl "http://localhost:3000/todos?status=pending"
```

#### PowerShell Examples
```powershell
# Get all
Invoke-RestMethod -Uri "http://localhost:3000/todos"

# Get completed
Invoke-RestMethod -Uri "http://localhost:3000/todos?status=completed"

# Get pending
Invoke-RestMethod -Uri "http://localhost:3000/todos?status=pending"
```

---

### 3. Get Todo by ID
**GET** `/todos/:id`

Retrieve a specific todo by its UUID.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The unique identifier of the todo |

#### Success Response
**Status Code:** `200 OK`

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

#### Error Responses

**400 Bad Request** - Invalid UUID
```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid v4 is expected)",
  "error": "Bad Request"
}
```

**404 Not Found** - Todo doesn't exist
```json
{
  "statusCode": 404,
  "message": "Todo with ID \"123e4567-e89b-12d3-a456-426614174000\" not found",
  "error": "Not Found"
}
```

#### cURL Example
```bash
curl http://localhost:3000/todos/123e4567-e89b-12d3-a456-426614174000
```

#### PowerShell Example
```powershell
$todoId = "123e4567-e89b-12d3-a456-426614174000"
Invoke-RestMethod -Uri "http://localhost:3000/todos/$todoId"
```

---

### 4. Update Todo
**PATCH** `/todos/:id`

Update an existing todo. All fields are optional.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The unique identifier of the todo |

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
All fields are optional. Only include fields you want to update.

```json
{
  "title": "Buy groceries and cook dinner",  // Optional: 1-100 characters
  "description": "Updated description",       // Optional: max 500 characters
  "completed": true                           // Optional: boolean
}
```

#### Partial Update Example
```json
{
  "completed": true
}
```

#### Validation Rules
- `title`: Optional, string, 1-100 characters
- `description`: Optional, string, max 500 characters
- `completed`: Optional, boolean

#### Success Response
**Status Code:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy groceries and cook dinner",
  "description": "Updated description",
  "completed": true,
  "createdAt": "2026-06-09T10:00:00.000Z",
  "updatedAt": "2026-06-09T12:00:00.000Z"
}
```

#### Error Responses

**400 Bad Request** - Invalid UUID
```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid v4 is expected)",
  "error": "Bad Request"
}
```

**400 Bad Request** - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "Title must be at least 1 character",
    "Completed must be a boolean value"
  ],
  "error": "Bad Request"
}
```

**404 Not Found** - Todo doesn't exist
```json
{
  "statusCode": 404,
  "message": "Todo with ID \"123e4567-e89b-12d3-a456-426614174000\" not found",
  "error": "Not Found"
}
```

#### cURL Example
```bash
curl -X PATCH http://localhost:3000/todos/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

#### PowerShell Example
```powershell
$todoId = "123e4567-e89b-12d3-a456-426614174000"
Invoke-RestMethod -Uri "http://localhost:3000/todos/$todoId" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"completed":true}'
```

---

### 5. Delete Todo
**DELETE** `/todos/:id`

Delete a todo permanently.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | UUID | Yes | The unique identifier of the todo |

#### Success Response
**Status Code:** `204 No Content`

No response body.

#### Error Responses

**400 Bad Request** - Invalid UUID
```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid v4 is expected)",
  "error": "Bad Request"
}
```

**404 Not Found** - Todo doesn't exist
```json
{
  "statusCode": 404,
  "message": "Todo with ID \"123e4567-e89b-12d3-a456-426614174000\" not found",
  "error": "Not Found"
}
```

#### cURL Example
```bash
curl -X DELETE http://localhost:3000/todos/123e4567-e89b-12d3-a456-426614174000
```

#### PowerShell Example
```powershell
$todoId = "123e4567-e89b-12d3-a456-426614174000"
Invoke-RestMethod -Uri "http://localhost:3000/todos/$todoId" -Method DELETE
```

---

## HTTP Status Codes

| Status Code | Description | When Used |
|-------------|-------------|-----------|
| **200 OK** | Success | GET, PATCH requests |
| **201 Created** | Resource created | POST request |
| **204 No Content** | Success with no body | DELETE request |
| **400 Bad Request** | Validation error or invalid UUID | Invalid request data |
| **404 Not Found** | Resource not found | Todo with given ID doesn't exist |
| **500 Internal Server Error** | Server error | Unexpected server errors |

---

## Validation Error Examples

### Missing Required Field
```json
{
  "statusCode": 400,
  "message": [
    "Title is required"
  ],
  "error": "Bad Request"
}
```

### Field Too Long
```json
{
  "statusCode": 400,
  "message": [
    "Title must not exceed 100 characters"
  ],
  "error": "Bad Request"
}
```

### Invalid Type
```json
{
  "statusCode": 400,
  "message": [
    "Title must be a string",
    "Completed must be a boolean value"
  ],
  "error": "Bad Request"
}
```

### Invalid UUID Format
```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid v4 is expected)",
  "error": "Bad Request"
}
```

---

## Complete Workflow Example

### PowerShell Script
```powershell
# 1. Create a todo
$todo = Invoke-RestMethod -Uri "http://localhost:3000/todos" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Learn NestJS","description":"Complete tutorial"}'

Write-Host "Created todo: $($todo.id)"

# 2. Get all todos
$todos = Invoke-RestMethod -Uri "http://localhost:3000/todos"
Write-Host "Total todos: $($todos.Count)"

# 3. Get specific todo
$retrieved = Invoke-RestMethod -Uri "http://localhost:3000/todos/$($todo.id)"
Write-Host "Retrieved: $($retrieved.title)"

# 4. Update todo
$updated = Invoke-RestMethod -Uri "http://localhost:3000/todos/$($todo.id)" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"completed":true}'

Write-Host "Updated completed: $($updated.completed)"

# 5. Get completed todos
$completed = Invoke-RestMethod -Uri "http://localhost:3000/todos?status=completed"
Write-Host "Completed todos: $($completed.Count)"

# 6. Delete todo
Invoke-RestMethod -Uri "http://localhost:3000/todos/$($todo.id)" -Method DELETE
Write-Host "Todo deleted"
```

---

## Best Practices Implemented

### ✅ RESTful Design
- Proper HTTP methods (GET, POST, PATCH, DELETE)
- Resource-based URLs (`/todos`)
- Correct status codes (200, 201, 204, 400, 404)

### ✅ Validation
- DTO validation with class-validator
- UUID v4 validation for IDs
- Custom error messages
- MinLength and MaxLength constraints

### ✅ Error Handling
- Consistent error response format
- Proper HTTP status codes
- Descriptive error messages
- NotFoundException for missing resources

### ✅ Documentation
- JSDoc comments on all endpoints
- Request/response examples
- Validation rules documented
- Error scenarios covered

### ✅ Type Safety
- TypeScript interfaces
- Strict typing on all methods
- Return type annotations
- DTO classes for type safety

### ✅ Async Operations
- All controller methods are async
- Proper use of async/await
- Promise return types

### ✅ Code Organization
- Separation of concerns (Controller → Service → Repository)
- DTOs for data transfer
- Entities for database models
- Modular architecture

---

## Testing the API

### Using the Test Script
```powershell
.\test-api.ps1
```

### Using Postman
Import the collection with these endpoints:
1. Create Todo - POST `/todos`
2. Get All Todos - GET `/todos`
3. Get Todo by ID - GET `/todos/:id`
4. Update Todo - PATCH `/todos/:id`
5. Delete Todo - DELETE `/todos/:id`

### Using VS Code REST Client
Create a `api-test.http` file:

```http
### Create Todo
POST http://localhost:3000/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}

### Get All Todos
GET http://localhost:3000/todos

### Get Todo by ID
GET http://localhost:3000/todos/{{todoId}}

### Update Todo
PATCH http://localhost:3000/todos/{{todoId}}
Content-Type: application/json

{
  "completed": true
}

### Delete Todo
DELETE http://localhost:3000/todos/{{todoId}}
```

---

## Additional Features

### Query Parameters (Extensible)
Can be extended to include:
- Pagination: `?page=1&limit=10`
- Sorting: `?sortBy=createdAt&order=DESC`
- Search: `?search=groceries`

### Response Headers
- `Content-Type: application/json`
- `X-Powered-By: Express` (can be disabled in production)

### CORS
CORS is enabled for all origins in development. Configure for production.

---

## Security Considerations (Production)

1. **Rate Limiting**: Add rate limiting middleware
2. **Authentication**: Implement JWT authentication
3. **Authorization**: Add role-based access control
4. **Input Sanitization**: Already handled by validation pipes
5. **SQL Injection**: Protected by TypeORM parameterization
6. **CORS**: Configure allowed origins properly
7. **HTTPS**: Use HTTPS in production
8. **Helmet**: Add helmet middleware for security headers

---

## Performance Considerations

1. **Database Indexes**: Added on `completed` and `createdAt`
2. **Connection Pooling**: PostgreSQL default pooling
3. **Async Operations**: Non-blocking I/O
4. **Pagination**: Should be added for large datasets
5. **Caching**: Can add Redis for frequently accessed data

---

For more details, see:
- [POSTGRESQL-SETUP.md](POSTGRESQL-SETUP.md) - Database setup
- [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Project overview
- [TODO-ENTITY-REFERENCE.md](TODO-ENTITY-REFERENCE.md) - Entity details
