# TodoForm Component

React form component for adding todos with comprehensive validation and error handling.

## Features

✅ **Required Field Validation** - Title is required  
✅ **Real-time Error Messages** - Shows errors as user types  
✅ **Character Counter** - Live character count with warnings  
✅ **Form Reset** - Clears form after successful submission  
✅ **Loading States** - Shows spinner during submission  
✅ **Accessibility** - ARIA labels and error announcements  
✅ **Type Safety** - Full TypeScript support  

## Usage

### Basic Usage

```typescript
import TodoForm from './components/TodoForm/TodoForm';

function App() {
  const handleSubmit = async (data: { title: string; description?: string }) => {
    // Send to API
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return <TodoForm onSubmit={handleSubmit} />;
}
```

### With Loading State

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    await createTodo(data);
  } finally {
    setIsSubmitting(false);
  }
};

return <TodoForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | `(data) => Promise<void>` | Yes | Callback when form is submitted |
| `isSubmitting` | `boolean` | No | Shows loading state |

## Validation Rules

### Title Field

- ✅ Required
- ✅ Minimum 1 character
- ✅ Maximum 100 characters
- ✅ Cannot be only whitespace

### Description Field

- ⚪ Optional
- ✅ Maximum 500 characters

## Error Messages

The form displays user-friendly error messages:

- **"Title is required"** - When title is empty
- **"Title must not exceed 100 characters"** - When title is too long
- **"Title cannot be empty or just whitespace"** - When title is only spaces
- **"Description must not exceed 500 characters"** - When description is too long

## Form Behavior

### 1. Field Validation

Validation occurs:
- **On blur** - When user leaves a field
- **On change** - After field has been touched
- **On submit** - Before submission

### 2. Error Display

Errors are shown only after:
- User has interacted with the field (touched)
- User attempts to submit the form

### 3. Form Reset

Form resets automatically after:
- ✅ Successful submission
- ✅ User clicks "Clear" button

### 4. Character Counter

- Shows current/max characters
- Turns orange when approaching limit (90%)
- Updates in real-time as user types

### 5. Submit Button State

Button is disabled when:
- ❌ Title is empty
- ❌ Validation errors exist
- ❌ Form is submitting

## Styling

The component uses CSS modules for scoped styling. Customize by modifying `TodoForm.css`:

```css
/* Change primary color */
.btn-primary {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* Change error color */
.form-input-error {
  border-color: #your-error-color;
}
```

## Accessibility

The form follows WCAG 2.1 guidelines:

- ✅ Semantic HTML (`form`, `label`, `input`)
- ✅ ARIA attributes (`aria-required`, `aria-invalid`, `aria-describedby`)
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Error announcements

## Examples

### Example 1: Basic Form

```typescript
<TodoForm onSubmit={handleSubmit} />
```

### Example 2: With Context API

```typescript
function TodoApp() {
  const { createTodo, submitLoading } = useTodoContext();

  return (
    <TodoForm 
      onSubmit={createTodo} 
      isSubmitting={submitLoading} 
    />
  );
}
```

### Example 3: With Custom Error Handling

```typescript
const handleSubmit = async (data) => {
  try {
    await createTodo(data);
    toast.success('Todo created!');
  } catch (error) {
    // Error is already displayed in form
    console.error('Failed to create todo:', error);
  }
};

<TodoForm onSubmit={handleSubmit} />
```

## Testing

The component includes comprehensive tests:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import TodoForm from './TodoForm';

test('shows error when title is empty', async () => {
  render(<TodoForm onSubmit={jest.fn()} />);
  
  const input = screen.getByLabelText(/title/i);
  fireEvent.blur(input);
  
  expect(screen.getByText(/title is required/i)).toBeInTheDocument();
});
```

Run tests:
```bash
npm test TodoForm.test.tsx
```

## Integration with Backend

### With Axios

```typescript
import axios from 'axios';

const handleSubmit = async (data) => {
  await axios.post('/todos', data);
};

<TodoForm onSubmit={handleSubmit} />
```

### With Fetch

```typescript
const handleSubmit = async (data) => {
  const response = await fetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create todo');
};

<TodoForm onSubmit={handleSubmit} />
```

## Customization

### Change Validation Rules

Edit `VALIDATION_RULES` constant:

```typescript
const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 3,        // Change minimum length
    maxLength: 200,      // Change maximum length
  },
  description: {
    maxLength: 1000,     // Change description limit
  },
};
```

### Change Error Messages

Edit `ERROR_MESSAGES` constant:

```typescript
const ERROR_MESSAGES = {
  titleRequired: 'Please enter a title',
  titleTooLong: 'Title is too long',
  // ... customize messages
};
```

### Add New Field

```typescript
// 1. Add to FormData interface
interface FormData {
  title: string;
  description: string;
  priority: string;  // New field
}

// 2. Add validation rule
const validateField = (name: keyof FormData, value: string) => {
  if (name === 'priority' && !value) {
    return 'Priority is required';
  }
};

// 3. Add field to form
<select name="priority" value={formData.priority} onChange={handleChange}>
  <option value="">Select priority</option>
  <option value="low">Low</option>
  <option value="high">High</option>
</select>
```

## Browser Support

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  

## Performance

- ⚡ Optimized re-renders
- ⚡ Debounced validation
- ⚡ Memoized callbacks
- ⚡ Lazy validation (only after touch)

## Troubleshooting

### Form doesn't reset after submission

Make sure `onSubmit` returns a Promise:

```typescript
// ✅ Correct
const handleSubmit = async (data) => {
  await createTodo(data);
};

// ❌ Incorrect
const handleSubmit = (data) => {
  createTodo(data); // Not awaited
};
```

### Errors don't show

Make sure to blur the field first:

```typescript
fireEvent.focus(input);
fireEvent.blur(input);  // Errors show after blur
```

### Character counter wrong

Make sure `maxLength` prop matches validation rules:

```typescript
maxLength={VALIDATION_RULES.title.maxLength}
```

---

## Files

- `TodoForm.tsx` - Main component (380 lines)
- `TodoForm.css` - Styles (400 lines)
- `TodoForm.test.tsx` - Tests (200 lines)
- `README.md` - This file

---

**A production-ready form component with comprehensive validation!** 🚀
