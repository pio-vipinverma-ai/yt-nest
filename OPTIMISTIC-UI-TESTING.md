# Optimistic UI - Testing Guide

## 🧪 How to Test Optimistic Updates

This guide shows you how to test the optimistic UI updates implementation and verify that rollback works correctly.

---

## 🎯 Test Scenarios

### Scenario 1: Normal Operation (Success Path)

**What to Test:** Optimistic updates work and server confirms

**Steps:**
1. Start backend: `cd yt-nest && npm run start:dev`
2. Start frontend: `cd frontend && npm start`
3. Open browser: `http://localhost:3000`
4. Perform actions:
   - Add a new todo
   - Toggle a todo's completion
   - Edit a todo's title
   - Delete a todo

**Expected Behavior:**
- ✅ All changes appear **instantly** in UI
- ✅ Brief "Saving..." indicator visible
- ✅ Changes persist after page refresh
- ✅ No errors in console

---

### Scenario 2: Slow Network (Visual Feedback)

**What to Test:** Visual indicators during API calls

**Steps:**
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Select **Slow 3G** from throttling dropdown
4. Perform todo operations

**Expected Behavior:**
- ✅ Todo appears immediately (optimistic)
- ✅ Blue gradient background with dashed border
- ✅ Small spinner in top-right corner
- ✅ "Saving..." indicator visible for 3-5 seconds
- ✅ Changes to normal appearance when confirmed
- ✅ Operations feel instant despite slow network

**Visual States:**

```
Creating Todo:
┌──────────────────────────────────┐
│ 🔄 [Saving...]      Buy groceries │ ← Blue gradient bg
│    Get milk and eggs              │   Dashed border
│    Just now                        │   Pulse animation
└──────────────────────────────────┘

After Confirmation:
┌──────────────────────────────────┐
│ ☐  Buy groceries                  │ ← Normal appearance
│    Get milk and eggs              │   Solid background
│    2 minutes ago                   │   No indicators
└──────────────────────────────────┘
```

---

### Scenario 3: API Failure (Rollback)

**What to Test:** Automatic rollback when API fails

#### Test 3A: Create Todo Failure

**Steps:**
1. **Stop backend server** (Ctrl+C in backend terminal)
2. Try to create a new todo:
   - Title: "Test Rollback"
   - Click "Add Todo"

**Expected Behavior:**
- ✅ Todo appears immediately in list
- ✅ Shows optimistic styling (blue gradient)
- ✅ After ~10 seconds (timeout), todo **disappears**
- ✅ Error message displayed: "Failed to create todo"
- ✅ List returns to previous state

**Visual Timeline:**
```
t=0s:   Todo appears (optimistic)
t=1-9s: Waiting for response... (loading indicator)
t=10s:  Timeout → Rollback → Todo removed
        Error alert shown
```

---

#### Test 3B: Toggle Todo Failure

**Steps:**
1. Ensure backend is **stopped**
2. Click checkbox to toggle a todo

**Expected Behavior:**
- ✅ Checkbox toggles immediately
- ✅ Shows optimistic styling
- ✅ After timeout, checkbox **reverts** to original state
- ✅ Error message: "Failed to toggle todo"

---

#### Test 3C: Delete Todo Failure

**Steps:**
1. Backend **stopped**
2. Click delete button (🗑️) on a todo
3. Confirm deletion

**Expected Behavior:**
- ✅ "Deleting..." overlay appears immediately
- ✅ Todo slides out (animation)
- ✅ After timeout, todo **reappears** at original position
- ✅ Error message: "Failed to delete todo"

---

### Scenario 4: Rapid Concurrent Operations

**What to Test:** Multiple operations at once

**Steps:**
1. Backend **running**
2. Apply Slow 3G throttling
3. Quickly perform these actions:
   - Create 3 new todos
   - Toggle 2 existing todos
   - Delete 1 todo
   - All within 2 seconds

**Expected Behavior:**
- ✅ All operations appear instant
- ✅ Each shows its own loading indicator
- ✅ All operations complete successfully
- ✅ Final state matches server state
- ✅ No duplicates or missing todos

---

### Scenario 5: Delete Position Preservation

**What to Test:** Deleted todo restored at correct position

**Steps:**
1. Create 5 todos: "Todo 1", "Todo 2", "Todo 3", "Todo 4", "Todo 5"
2. **Stop backend**
3. Delete "Todo 3" (middle todo)
4. Wait for rollback

**Expected Behavior:**
- ✅ "Todo 3" disappears immediately
- ✅ List shows: Todo 1, Todo 2, Todo 4, Todo 5
- ✅ After timeout, "Todo 3" **reappears between Todo 2 and Todo 4**
- ✅ Original order restored: 1, 2, 3, 4, 5

---

## 🛠️ Developer Testing Tools

### Chrome DevTools Network Throttling

**Preset Profiles:**
- **Fast 3G**: 100ms delay (moderate testing)
- **Slow 3G**: 500ms delay (see indicators clearly)
- **Offline**: Immediate failure (test rollback)

**Custom Throttling:**
1. Network tab → Throttling dropdown → Add custom profile
2. Set:
   - Download: 500 kb/s
   - Upload: 500 kb/s
   - Latency: 1000ms

---

### React DevTools

**Inspect Optimistic State:**

1. Install React DevTools extension
2. Open Components tab
3. Select `TodoProvider`
4. Inspect `todos` array
5. Look for properties:
   ```javascript
   {
     id: "temp-1234567890-0.123456",
     isOptimistic: true,  // ← Optimistic flag
     isDeleting: false
   }
   ```

---

### Console Debugging

Add console logs to see state changes:

```typescript
// In TodoContext.tsx
const createTodo = async (dto: CreateTodoDto) => {
  console.log('🟡 Optimistic create:', optimisticTodo);
  
  try {
    const response = await api.post('/todos', dto);
    console.log('✅ Create confirmed:', response.data);
  } catch (err) {
    console.log('❌ Create failed, rolling back');
  }
};
```

---

## 📊 Test Matrix

| Scenario | Network | Backend | Expected Result |
|----------|---------|---------|-----------------|
| Normal create | Fast | Running | Success, no rollback |
| Normal toggle | Fast | Running | Success, no rollback |
| Normal delete | Fast | Running | Success, no rollback |
| Create (slow network) | Slow 3G | Running | Success with delay |
| Create (backend down) | Any | Stopped | Rollback after timeout |
| Toggle (backend down) | Any | Stopped | Revert to original state |
| Delete (backend down) | Any | Stopped | Todo restored |
| Concurrent operations | Slow 3G | Running | All succeed eventually |
| Rapid toggles | Fast | Running | Final state correct |

---

## ✅ Verification Checklist

After implementing optimistic updates, verify:

### Visual Feedback
- [ ] Optimistic todos have blue gradient background
- [ ] Optimistic todos have dashed border
- [ ] "Saving..." indicator appears in top-right
- [ ] Spinner animates smoothly
- [ ] Deleting overlay shows "Deleting..." text
- [ ] Pulse animation visible on optimistic items

### Functionality
- [ ] Create todo appears instantly
- [ ] Toggle checkbox responds immediately
- [ ] Delete animates smoothly
- [ ] All actions feel instant on fast network
- [ ] Loading indicators visible on slow network

### Rollback
- [ ] Failed create removes optimistic todo
- [ ] Failed toggle reverts checkbox
- [ ] Failed delete restores todo at original position
- [ ] Error messages display correctly
- [ ] No console errors during rollback

### Edge Cases
- [ ] Multiple concurrent operations work
- [ ] Rapid actions don't cause duplicates
- [ ] Network timeout triggers rollback
- [ ] Page refresh shows correct state
- [ ] No memory leaks with many operations

---

## 🐛 Common Issues & Solutions

### Issue 1: Optimistic Todo Not Appearing

**Symptom:** Todo doesn't show immediately when created

**Debug:**
```typescript
// Check if state update is synchronous
console.log('Before:', todos);
setTodos((prev) => {
  const updated = [optimisticTodo, ...prev];
  console.log('After:', updated);
  return updated;
});
```

**Solution:** Ensure using functional state update

---

### Issue 2: Rollback Not Happening

**Symptom:** Failed operation doesn't revert

**Debug:**
```typescript
try {
  await api.post('/todos', dto);
} catch (err) {
  console.log('Caught error:', err);
  console.log('Rolling back...');
  // Rollback code here
}
```

**Solution:** Verify catch block executes and removes correct item

---

### Issue 3: Visual Indicators Not Showing

**Symptom:** No blue gradient or spinner visible

**Debug:**
1. Check React DevTools for `isOptimistic` flag
2. Inspect element CSS classes
3. Verify CSS file loaded

**Solution:**
```typescript
// Ensure flag is set
const optimisticTodo = {
  ...todo,
  isOptimistic: true  // ← Must be true
};

// Check className in component
<div className={`todo-item ${todo.isOptimistic ? 'optimistic' : ''}`}>
```

---

## 🎯 Performance Testing

### Measure Perceived Performance

**Test Setup:**
1. Clear browser cache
2. Disable throttling (fast network)
3. Open Performance tab in DevTools
4. Record performance

**Benchmark: Create Todo**

Without Optimistic Updates:
```
User clicks → Wait → API call → Response → Update UI → Done
               200ms                                    Total: 250ms
```

With Optimistic Updates:
```
User clicks → Update UI → API call → Response → Confirm → Done
               10ms                                        Total: 10ms
```

**Result:** 96% faster perceived performance!

---

## 📝 Test Report Template

```markdown
## Optimistic UI Test Report

**Date:** 2026-06-09
**Tester:** [Your Name]
**Environment:** Chrome 120, Windows 11

### Scenario 1: Normal Operations
- Create Todo: ✅ Pass
- Toggle Todo: ✅ Pass
- Delete Todo: ✅ Pass
- Notes: All operations instant

### Scenario 2: Slow Network
- Visual Indicators: ✅ Pass
- Loading States: ✅ Pass
- Notes: Clear feedback on Slow 3G

### Scenario 3: API Failures
- Create Rollback: ✅ Pass
- Toggle Rollback: ✅ Pass
- Delete Rollback: ✅ Pass
- Notes: Proper error messages

### Scenario 4: Concurrent Operations
- Multiple Creates: ✅ Pass
- Mixed Operations: ✅ Pass
- Notes: No race conditions

### Overall: ✅ All Tests Passed
```

---

## 🚀 Automated Testing (Future)

### Unit Tests (Jest)

```typescript
describe('Optimistic UI', () => {
  it('should add todo optimistically', async () => {
    const { result } = renderHook(() => useTodoContext());
    
    act(() => {
      result.current.createTodo({ title: 'Test' });
    });
    
    // Verify optimistic todo exists
    expect(result.current.todos[0].isOptimistic).toBe(true);
  });

  it('should rollback on API error', async () => {
    // Mock API failure
    mockApi.post.mockRejectedValueOnce(new Error('API Error'));
    
    const { result } = renderHook(() => useTodoContext());
    
    await act(async () => {
      await expect(
        result.current.createTodo({ title: 'Test' })
      ).rejects.toThrow();
    });
    
    // Verify rollback
    expect(result.current.todos).toHaveLength(0);
  });
});
```

### E2E Tests (Playwright/Cypress)

```typescript
test('optimistic create and rollback', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');
  
  // Stop backend (simulate failure)
  await stopBackend();
  
  // Add todo
  await page.fill('input[placeholder="What needs to be done?"]', 'Test Todo');
  await page.click('button:has-text("Add Todo")');
  
  // Verify optimistic appearance
  const todo = page.locator('.todo-item.optimistic');
  await expect(todo).toBeVisible();
  
  // Wait for rollback
  await page.waitForTimeout(11000);
  
  // Verify rollback
  await expect(todo).not.toBeVisible();
  await expect(page.locator('.alert-error')).toBeVisible();
});
```

---

## 📚 Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Testing](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing!** 🎉
