# Quick API Reference

## 🚀 Start Server
```bash
npm run start:dev
```

## 📋 All Endpoints

```
POST   /todos           - Create todo
GET    /todos           - Get all todos
GET    /todos/:id       - Get one todo
PATCH  /todos/:id       - Update todo
DELETE /todos/:id       - Delete todo
```

## 🧪 Test Examples

### Create
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"title":"Buy groceries"}'
```

### Get All
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos"
```

### Get One
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos/{id}"
```

### Update
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos/{id}" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body '{"completed":true}'
```

### Delete
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/todos/{id}" -Method DELETE
```

## 📚 Documentation Files

- [REST-API-REFERENCE.md](REST-API-REFERENCE.md) - Complete API docs
- [BEST-PRACTICES-SUMMARY.md](BEST-PRACTICES-SUMMARY.md) - All best practices
- [api-tests.http](api-tests.http) - VS Code REST Client tests

## ✅ Features

- ✅ UUID validation
- ✅ DTO validation
- ✅ Proper HTTP status codes
- ✅ Error handling
- ✅ Query filtering
- ✅ Async operations
- ✅ TypeScript strict mode
- ✅ PostgreSQL optimized
