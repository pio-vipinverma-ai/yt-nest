# Todo API Documentation

## Overview
RESTful API for managing Todo items with full CRUD operations.

## Base URL
```
http://localhost:3000/todos
```

## Endpoints

### 1. Create Todo
**POST** `/todos`

Create a new todo item.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "createdAt": "2026-06-09T10:00:00.000Z",
  "updatedAt": "2026-06-09T10:00:00.000Z"
}
```

---

### 2. Get All Todos
**GET** `/todos`

Retrieve all todo items, with optional filtering.

**Query Parameters:**
- `status` (optional): `completed` | `pending`

**Examples:**
```
GET /todos                    # Get all todos
GET /todos?status=completed   # Get only completed todos
GET /todos?status=pending     # Get only pending todos
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "createdAt": "2026-06-09T10:00:00.000Z",
    "updatedAt": "2026-06-09T10:00:00.000Z"
  }
]
```

---

### 3. Get Todo by ID
**GET** `/todos/:id`

Retrieve a specific todo item by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "createdAt": "2026-06-09T10:00:00.000Z",
  "updatedAt": "2026-06-09T10:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Todo with ID \"uuid\" not found",
  "error": "Not Found"
}
```

---

### 4. Update Todo
**PATCH** `/todos/:id`

Update an existing todo item. All fields are optional.

**Request Body:**
```json
{
  "title": "Buy groceries and supplies",
  "description": "Updated description",
  "completed": true
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Buy groceries and supplies",
  "description": "Updated description",
  "completed": true,
  "createdAt": "2026-06-09T10:00:00.000Z",
  "updatedAt": "2026-06-09T10:30:00.000Z"
}
```

---

### 5. Delete Todo
**DELETE** `/todos/:id`

Delete a todo item.

**Response:** `204 No Content`

**Error Response:** `404 Not Found`

---

## Validation Rules

### CreateTodoDto
- `title`: Required, string, max 100 characters
- `description`: Optional, string, max 500 characters

### UpdateTodoDto
- `title`: Optional, string, max 100 characters
- `description`: Optional, string, max 500 characters
- `completed`: Optional, boolean

---

## Error Responses

### 400 Bad Request
Invalid input data or validation error.
```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "title must be a string"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
Resource not found.
```json
{
  "statusCode": 404,
  "message": "Todo with ID \"uuid\" not found",
  "error": "Not Found"
}
```

---

## Testing with cURL

### Create a todo:
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, bread, eggs"}'
```

### Get all todos:
```bash
curl http://localhost:3000/todos
```

### Get completed todos:
```bash
curl http://localhost:3000/todos?status=completed
```

### Get a specific todo:
```bash
curl http://localhost:3000/todos/{id}
```

### Update a todo:
```bash
curl -X PATCH http://localhost:3000/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### Delete a todo:
```bash
curl -X DELETE http://localhost:3000/todos/{id}
```
