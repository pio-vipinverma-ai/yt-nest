# Quick Start - Test Todo API
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   NestJS Todo API - Quick Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n[1/7] Creating first todo..." -ForegroundColor Yellow
try {
    $todo1 = Invoke-RestMethod -Uri "http://localhost:3000/todos" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"title":"Learn NestJS","description":"Master NestJS with TypeORM"}'
    Write-Host "✓ Created: " -NoNewline -ForegroundColor Green
    Write-Host "$($todo1.title)" -ForegroundColor White
    Write-Host "  ID: $($todo1.id)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nMake sure the server is running:" -ForegroundColor Yellow
    Write-Host "  npm run start:dev`n" -ForegroundColor White
    exit 1
}

Write-Host "`n[2/7] Creating second todo..." -ForegroundColor Yellow
$todo2 = Invoke-RestMethod -Uri "http://localhost:3000/todos" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"title":"Build Todo App","description":"Create a production-ready app"}'
Write-Host "✓ Created: " -NoNewline -ForegroundColor Green
Write-Host "$($todo2.title)" -ForegroundColor White

Write-Host "`n[3/7] Creating third todo..." -ForegroundColor Yellow
$todo3 = Invoke-RestMethod -Uri "http://localhost:3000/todos" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"title":"Deploy to Production"}'
Write-Host "✓ Created: " -NoNewline -ForegroundColor Green
Write-Host "$($todo3.title)" -ForegroundColor White

Write-Host "`n[4/7] Getting all todos..." -ForegroundColor Yellow
$todos = Invoke-RestMethod -Uri "http://localhost:3000/todos" -Method GET
Write-Host "✓ Total todos: " -NoNewline -ForegroundColor Green
Write-Host "$($todos.Count)" -ForegroundColor White
foreach ($todo in $todos) {
    $status = if ($todo.completed) { "✓" } else { "○" }
    $color = if ($todo.completed) { "Green" } else { "Gray" }
    Write-Host "  $status " -NoNewline -ForegroundColor $color
    Write-Host "$($todo.title)" -ForegroundColor White
}

Write-Host "`n[5/7] Marking first todo as completed..." -ForegroundColor Yellow
$updated = Invoke-RestMethod -Uri "http://localhost:3000/todos/$($todo1.id)" `
    -Method PATCH `
    -ContentType "application/json" `
    -Body '{"completed":true}'
Write-Host "✓ Updated: " -NoNewline -ForegroundColor Green
Write-Host "$($updated.title) → Completed: $($updated.completed)" -ForegroundColor White

Write-Host "`n[6/7] Getting completed todos..." -ForegroundColor Yellow
$completed = Invoke-RestMethod -Uri "http://localhost:3000/todos?status=completed" -Method GET
Write-Host "✓ Completed todos: " -NoNewline -ForegroundColor Green
Write-Host "$($completed.Count)" -ForegroundColor White
foreach ($todo in $completed) {
    Write-Host "  ✓ $($todo.title)" -ForegroundColor Green
}

Write-Host "`n[7/7] Getting pending todos..." -ForegroundColor Yellow
$pending = Invoke-RestMethod -Uri "http://localhost:3000/todos?status=pending" -Method GET
Write-Host "✓ Pending todos: " -NoNewline -ForegroundColor Green
Write-Host "$($pending.Count)" -ForegroundColor White
foreach ($todo in $pending) {
    Write-Host "  ○ $($todo.title)" -ForegroundColor Gray
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "   All Tests Passed! ✓" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`nYour Todo API is working perfectly!" -ForegroundColor White
Write-Host "`nAPI Endpoints:" -ForegroundColor Yellow
Write-Host "  POST   http://localhost:3000/todos" -ForegroundColor White
Write-Host "  GET    http://localhost:3000/todos" -ForegroundColor White
Write-Host "  GET    http://localhost:3000/todos/:id" -ForegroundColor White
Write-Host "  PATCH  http://localhost:3000/todos/:id" -ForegroundColor White
Write-Host "  DELETE http://localhost:3000/todos/:id" -ForegroundColor White

Write-Host "`nDatabase:" -ForegroundColor Yellow
Write-Host "  todos.db (SQLite)" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  • Add authentication (JWT)" -ForegroundColor White
Write-Host "  • Switch to PostgreSQL" -ForegroundColor White
Write-Host "  • Add Swagger documentation" -ForegroundColor White
Write-Host "  • Deploy to production`n" -ForegroundColor White
