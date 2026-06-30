# Form Validation Example - Quick Start

This guide shows how to use the validated TodoForm component.

## 🚀 Quick Start

### Step 1: Import the Component

```typescript
import { TodoForm } from './components/TodoForm/TodoForm';
```

### Step 2: Create Submit Handler

```typescript
const handleSubmit = async (data: { title: string; description?: string }) => {
  // Send to your API
  await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
```

### Step 3: Use the Component

```typescript
<TodoForm 
  onSubmit={handleSubmit}
  onSuccess={() => console.log('Success!')}
  isSubmitting={false}
/>
```

## ✨ Features Demonstrated

### 1. Title Validation

**Rules:**
- ✅ Required field
- ✅ 1-100 characters
- ✅ Cannot be only whitespace

**Try it:**
1. Leave title empty → See error after blur
2. Type only spaces → See error
3. Type 101 characters → See error

### 2. Real-time Error Messages

**Behavior:**
- Errors show only after field is touched (blur)
- Errors update as you type (after first blur)
- Friendly error messages

**Try it:**
1. Focus title field
2. Blur without typing → "Title is required"
3. Focus again and type → Error disappears

### 3. Character Counter

**Features:**
- Live character count
- Warning when approaching limit (90%)
- Separate counters for title and description

**Try it:**
1. Type in title → See "5/100"
2. Type 91+ characters → Counter turns orange

### 4. Form Reset

**Behavior:**
- Auto-resets after successful submission
- Manual reset with "Clear" button
- Clears all fields and errors

**Try it:**
1. Fill form
2. Click "Clear" → Form resets
3. Submit successfully → Form auto-resets

### 5. Loading States

**Features:**
- Submit button shows spinner
- All fields disabled during submission
- Button text changes to "Adding..."

**Try it:**
1. Fill form
2. Click submit → See loading state

## 📋 Complete Example

```typescript
import React, { useState } from 'react';
import { TodoForm } from './components/TodoForm/TodoForm';
import axios from 'axios';

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todos, setTodos] = useState([]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/todos', data);
      setTodos([response.data, ...todos]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    alert('Todo created!');
  };

  return (
    <div>
      <h1>My Todos</h1>
      
      <TodoForm 
        onSubmit={handleSubmit}
        onSuccess={handleSuccess}
        isSubmitting={isSubmitting}
      />
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🎯 Validation Rules

### Title Field

```typescript
{
  required: true,
  minLength: 1,
  maxLength: 100,
  pattern: /^(?!\s*$).+/  // Not just whitespace
}
```

### Description Field

```typescript
{
  maxLength: 500
}
```

## 🧪 Test Scenarios

### Scenario 1: Empty Title
1. Leave title empty
2. Click submit or blur field
3. ✅ See: "Title is required"

### Scenario 2: Whitespace Only
1. Type "   " in title
2. Blur field
3. ✅ See: "Title cannot be empty or just whitespace"

### Scenario 3: Title Too Long
1. Type 101 characters
2. ✅ See: "Title must not exceed 100 characters"
3. ✅ Character counter shows "101/100" in red

### Scenario 4: Valid Submission
1. Type "Buy groceries" in title
2. Type "Milk, bread, eggs" in description
3. Click "Add Todo"
4. ✅ Form submits
5. ✅ Form resets
6. ✅ Success callback fires

### Scenario 5: Submission Error
1. Stop backend server
2. Fill form and submit
3. ✅ See error alert at top
4. ✅ Form stays filled (not reset)
5. ✅ Can retry

## 🎨 Customization

### Change Validation Rules

```typescript
// In TodoForm.tsx
const VALIDATION_RULES = {
  title: {
    minLength: 3,        // Change to 3
    maxLength: 200,      // Change to 200
  },
};
```

### Change Error Messages

```typescript
const ERROR_MESSAGES = {
  titleRequired: 'Please enter a title',  // Custom message
  titleTooLong: 'Title is too long',
};
```

### Change Styling

```css
/* In TodoForm.module.css */
.buttonPrimary {
  background: #your-color;  /* Change color */
}
```

## 🚦 Form States

### States Tracked

```typescript
{
  // Data
  formData: { title: '', description: '' },
  
  // Validation
  errors: { title?: string, description?: string },
  
  // Interaction
  touched: { title: boolean, description: boolean },
  
  // Loading
  isSubmitting: boolean
}
```

### State Flow

```
Initial State
    ↓
User focuses field
    ↓
User types
    ↓
User blurs field → Mark as touched
    ↓
Validate field → Show errors
    ↓
User fixes errors → Errors clear
    ↓
User submits → Validate all
    ↓
Valid? → Submit to API
    ↓
Success → Reset form
```

## 📱 Responsive Design

The form is mobile-friendly:

```css
@media (max-width: 768px) {
  /* Stacked buttons */
  /* Larger touch targets */
  /* Optimized spacing */
}
```

## ♿ Accessibility

### ARIA Attributes

```html
<input
  aria-required="true"
  aria-invalid="true"
  aria-describedby="title-error"
/>

<div id="title-error" role="alert">
  Error message
</div>
```

### Keyboard Navigation

- Tab → Next field
- Shift+Tab → Previous field
- Enter → Submit form
- Escape → (Can add to clear)

## 🐛 Troubleshooting

### Form doesn't reset

**Problem:** Form still has values after submission

**Solution:** Make sure `onSubmit` is async and resolves:

```typescript
const handleSubmit = async (data) => {
  await api.post('/todos', data);  // Must await!
};
```

### Errors don't show

**Problem:** Errors never appear

**Solution:** Fields must be blurred first:

```typescript
// Errors show only after touch
<input onBlur={handleBlur} />
```

### Validation too strict

**Problem:** Can't submit valid data

**Solution:** Check validation rules:

```typescript
// Make description optional
description: {
  maxLength: 500,
  // No required: true
}
```

## 📊 Props API

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | `(data) => Promise<void>` | ✅ Yes | Handle form submission |
| `onSuccess` | `() => void` | ✅ Yes | Called after success |
| `isSubmitting` | `boolean` | ❌ No | Show loading state |

## 🎉 You're Ready!

Your form now has:
- ✅ Comprehensive validation
- ✅ Error messages
- ✅ Character counters  
- ✅ Loading states
- ✅ Auto-reset
- ✅ Accessibility

**Try it now:**
```bash
npm start
```

Then test all the validation scenarios! 🚀
