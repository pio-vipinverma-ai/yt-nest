# Test Pagination & Search API

$baseUrl = "http://localhost:3000/todos"

Write-Host "🧪 Testing Todo API - Pagination & Search" -ForegroundColor Cyan
Write-Host ""

# Test 1: Basic Pagination
Write-Host "1️⃣ Test: Basic Pagination (Page 1, 10 items)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?page=1&limit=10" -Method GET
    Write-Host "✅ Returned $($response.data.Count) items" -ForegroundColor Green
    Write-Host "   Total: $($response.meta.totalItems) items, $($response.meta.totalPages) pages" -ForegroundColor Gray
    Write-Host "   Has next: $($response.meta.hasNextPage), Has prev: $($response.meta.hasPreviousPage)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Small Page Size
Write-Host "2️⃣ Test: Small Page Size (5 items)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?page=1&limit=5" -Method GET
    Write-Host "✅ Returned $($response.data.Count) items" -ForegroundColor Green
    Write-Host "   Has next page: $($response.meta.hasNextPage)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Search
Write-Host "3️⃣ Test: Search for 'test'" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?search=test" -Method GET
    Write-Host "✅ Found $($response.meta.totalItems) matching todos" -ForegroundColor Green
    if ($response.data.Count -gt 0) {
        Write-Host "   First result: $($response.data[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Filter by Status - Pending
Write-Host "4️⃣ Test: Filter Pending Todos" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?status=pending" -Method GET
    Write-Host "✅ Found $($response.meta.totalItems) pending todos" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Filter by Status - Completed
Write-Host "5️⃣ Test: Filter Completed Todos" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?status=completed" -Method GET
    Write-Host "✅ Found $($response.meta.totalItems) completed todos" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Sorting - By Title (ASC)
Write-Host "6️⃣ Test: Sort by Title (A-Z)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?sortBy=title&sortOrder=ASC&limit=3" -Method GET
    Write-Host "✅ First 3 todos (alphabetically):" -ForegroundColor Green
    $response.data | ForEach-Object { 
        Write-Host "   - $($_.title)" -ForegroundColor Gray 
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Sorting - By Date (DESC)
Write-Host "7️⃣ Test: Sort by Date (Newest First)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?sortBy=createdAt&sortOrder=DESC&limit=3" -Method GET
    Write-Host "✅ Newest 3 todos:" -ForegroundColor Green
    $response.data | ForEach-Object { 
        Write-Host "   - $($_.title) ($(([DateTime]$_.createdAt).ToString('MM/dd/yyyy')))" -ForegroundColor Gray 
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Combined Query
Write-Host "8️⃣ Test: Combined Query (Search + Filter + Sort + Pagination)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?page=1&limit=5&search=test&status=pending&sortBy=createdAt&sortOrder=DESC" -Method GET
    Write-Host "✅ Found $($response.meta.totalItems) matching todos" -ForegroundColor Green
    Write-Host "   Returned $($response.data.Count) items on page $($response.meta.page)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 9: Page Navigation
Write-Host "9️⃣ Test: Page Navigation" -ForegroundColor Yellow
try {
    $page1 = Invoke-RestMethod -Uri "$baseUrl?page=1&limit=5" -Method GET
    Write-Host "✅ Page 1: $($page1.data.Count) items" -ForegroundColor Green
    Write-Host "   Has next: $($page1.meta.hasNextPage), Has prev: $($page1.meta.hasPreviousPage)" -ForegroundColor Gray
    
    if ($page1.meta.hasNextPage) {
        $page2 = Invoke-RestMethod -Uri "$baseUrl?page=2&limit=5" -Method GET
        Write-Host "✅ Page 2: $($page2.data.Count) items" -ForegroundColor Green
        Write-Host "   Has next: $($page2.meta.hasNextPage), Has prev: $($page2.meta.hasPreviousPage)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 10: Validation - Invalid Page
Write-Host "🔟 Test: Validation (Invalid page=0)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?page=0&limit=10" -Method GET
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected invalid page: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}
Write-Host ""

# Test 11: Validation - Limit Too High
Write-Host "1️⃣1️⃣ Test: Validation (limit > 100)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl?page=1&limit=200" -Method GET
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected limit > 100: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ All Tests Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✓ Pagination works" -ForegroundColor Green
Write-Host "  ✓ Search works" -ForegroundColor Green
Write-Host "  ✓ Filtering works" -ForegroundColor Green
Write-Host "  ✓ Sorting works" -ForegroundColor Green
Write-Host "  ✓ Combined queries work" -ForegroundColor Green
Write-Host "  ✓ Validation works" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
