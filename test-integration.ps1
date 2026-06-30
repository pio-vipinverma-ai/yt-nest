# Test Backend API Connection
# Run this before starting the frontend to verify backend is ready

Write-Host "🧪 Testing NestJS Backend API Connection..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
}

# Test 1: Health Check
Write-Host "1️⃣ Testing server connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/todos" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not responding!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solution: Start the backend with 'npm run start:dev'" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Fetch Todos
Write-Host "2️⃣ Fetching todos..." -ForegroundColor Yellow
try {
    $todos = Invoke-RestMethod -Uri "$baseUrl/todos" -Method GET -Headers $headers
    Write-Host "✅ Successfully fetched todos!" -ForegroundColor Green
    Write-Host "   Count: $($todos.Count) todos" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to fetch todos!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Create Todo
Write-Host "3️⃣ Creating test todo..." -ForegroundColor Yellow
$testTodo = @{
    title = "Test Todo - $(Get-Date -Format 'HH:mm:ss')"
    description = "This is a test todo created by the integration test script"
} | ConvertTo-Json

try {
    $newTodo = Invoke-RestMethod -Uri "$baseUrl/todos" -Method POST -Headers $headers -Body $testTodo
    Write-Host "✅ Successfully created todo!" -ForegroundColor Green
    Write-Host "   ID: $($newTodo.id)" -ForegroundColor Gray
    Write-Host "   Title: $($newTodo.title)" -ForegroundColor Gray
    $testId = $newTodo.id
} catch {
    Write-Host "❌ Failed to create todo!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $testId = $null
}

Write-Host ""

# Test 4: Update Todo
if ($testId) {
    Write-Host "4️⃣ Updating test todo..." -ForegroundColor Yellow
    $updateData = @{
        completed = $true
    } | ConvertTo-Json
    
    try {
        $updatedTodo = Invoke-RestMethod -Uri "$baseUrl/todos/$testId" -Method PATCH -Headers $headers -Body $updateData
        Write-Host "✅ Successfully updated todo!" -ForegroundColor Green
        Write-Host "   Completed: $($updatedTodo.completed)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to update todo!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test 5: Delete Todo
    Write-Host "5️⃣ Deleting test todo..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "$baseUrl/todos/$testId" -Method DELETE -Headers $headers
        Write-Host "✅ Successfully deleted todo!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to delete todo!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Backend API Tests Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Keep backend running (npm run start:dev)" -ForegroundColor White
Write-Host "  2. Open new terminal" -ForegroundColor White
Write-Host "  3. cd frontend" -ForegroundColor White
Write-Host "  4. npm start" -ForegroundColor White
Write-Host ""
Write-Host "Frontend will connect to: $baseUrl" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
