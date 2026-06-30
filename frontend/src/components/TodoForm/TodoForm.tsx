import React, { useState, FormEvent, ChangeEvent } from 'react';
import styles from './TodoForm.module.css';

// Validation rules
const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^(?!\s*$).+/, // Not just whitespace
  },
  description: {
    maxLength: 500,
  },
};

// Error messages
const ERROR_MESSAGES = {
  titleRequired: 'Title is required',
  titleTooShort: 'Title must be at least 1 character',
  titleTooLong: 'Title must not exceed 100 characters',
  titleInvalid: 'Title cannot be empty or just whitespace',
  descriptionTooLong: 'Description must not exceed 500 characters',
};

interface TodoFormProps {
  onSuccess: () => void;
  onSubmit: (data: { title: string; description?: string; file?: File }) => Promise<void>;
  isSubmitting?: boolean;
}

interface FormData {
  title: string;
  description: string;
  file?: File;
}

interface FormErrors {
  title?: string;
  description?: string;
  submit?: string;
}

/**
 * TodoForm Component with Comprehensive Validation
 * 
 * Features:
 * - Required field validation
 * - Real-time error messages
 * - Character count display
 * - Form reset after submission
 * - Loading state handling
 * - Accessible error messages
 */
const TodoForm: React.FC<TodoFormProps> = ({ onSuccess, onSubmit, isSubmitting = false }) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    file: undefined,
  });

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  // Touched fields (to show errors only after user interaction)
  const [touched, setTouched] = useState<{ title: boolean; description: boolean }>({
    title: false,
    description: false,
  });

  /**
   * Validate a single field
   */
  const validateField = (name: keyof FormData, value?: string | File): string | undefined => {
    // Coerce non-string values (File or undefined) to empty string for text validation
    const val = typeof value === 'string' ? value : '';

    switch (name) {
      case 'title':
        if (VALIDATION_RULES.title.required && !val.trim()) {
          return ERROR_MESSAGES.titleRequired;
        }
        if (val.trim().length < VALIDATION_RULES.title.minLength) {
          return ERROR_MESSAGES.titleTooShort;
        }
        if (val.length > VALIDATION_RULES.title.maxLength) {
          return ERROR_MESSAGES.titleTooLong;
        }
        if (!VALIDATION_RULES.title.pattern.test(val)) {
          return ERROR_MESSAGES.titleInvalid;
        }
        break;

      case 'description':
        if (val.length > VALIDATION_RULES.description.maxLength) {
          return ERROR_MESSAGES.descriptionTooLong;
        }
        break;
    }
    return undefined;
  };

  /**
   * Validate all fields
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const titleError = validateField('title', formData.title);
    if (titleError) newErrors.title = titleError;

    const descriptionError = validateField('description', formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    // Validate file type if selected
    if (formData.file) {
      const allowedTypes = [
        'text/plain',
        'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.submit = 'Invalid attachment type. Only txt, csv, xls, xlsx, doc, and docx files are allowed.';
      }
      if (formData.file.size > 5 * 1024 * 1024) {
        newErrors.submit = 'Attachment size must be 5MB or smaller.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field if already touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[name as keyof FormErrors] = error;
        } else {
          delete newErrors[name as keyof FormErrors];
        }
        return newErrors;
      });
    }
  };

  /**
   * Handle field blur (mark as touched)
   */
  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur
    const error = validateField(name as keyof FormData, formData[name as keyof FormData]);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name as keyof FormErrors] = error;
      } else {
        delete newErrors[name as keyof FormErrors];
      }
      return newErrors;
    });
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({ title: '', description: '', file: undefined });
    setErrors({});
    setTouched({ title: false, description: false });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ title: true, description: true });

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Clear submit error
      setErrors((prev) => ({ ...prev, submit: undefined }));

      // Call parent onSubmit
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        file: formData.file,
      });

      // Reset form on success
      resetForm();
      onSuccess();
    } catch (error: any) {
      // Show submit error
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || error.message || 'Failed to create todo. Please try again.',
      }));
    }
  };

  // Character counts
  const titleCharCount = formData.title.length;
  const descriptionCharCount = formData.description.length;

  // Form is valid if no errors
  const isValid = Object.keys(errors).filter((key) => key !== 'submit').length === 0;
  const canSubmit = formData.title.trim().length > 0 && isValid && !isSubmitting;

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.formTitle}>Add New Todo</h2>

        {/* Submit Error Alert */}
        {errors.submit && (
          <div className={styles.alertError} role="alert">
            <span className={styles.alertIcon}>⚠️</span>
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Title Field */}
        <div className={styles.formGroup}>
          <label htmlFor="todo-title" className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="todo-title"
            name="title"
            className={`${styles.input} ${errors.title && touched.title ? styles.inputError : ''}`}
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={VALIDATION_RULES.title.maxLength}
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!!errors.title && touched.title}
            aria-describedby={errors.title && touched.title ? 'title-error' : undefined}
          />
          
          {/* Character Counter */}
          <div className={styles.helper}>
            <span className={`${styles.charCount} ${titleCharCount > 90 ? styles.charCountWarning : ''}`}>
              {titleCharCount}/{VALIDATION_RULES.title.maxLength}
            </span>
          </div>

          {/* Error Message */}
          {errors.title && touched.title && (
            <div id="title-error" className={styles.error} role="alert">
              <span className={styles.errorIcon}>✕</span>
              {errors.title}
            </div>
          )}
        </div>

        {/* Description Field */}
        <div className={styles.formGroup}>
          <label htmlFor="todo-description" className={styles.label}>
            Description <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="todo-description"
            name="description"
            className={`${styles.textarea} ${errors.description && touched.description ? styles.inputError : ''}`}
            placeholder="Add more details about your todo..."
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={VALIDATION_RULES.description.maxLength}
            disabled={isSubmitting}
            rows={4}
            aria-invalid={!!errors.description && touched.description}
            aria-describedby={errors.description && touched.description ? 'description-error' : undefined}
          />
          
          {/* Character Counter */}
          <div className={styles.helper}>
            <span className={`${styles.charCount} ${descriptionCharCount > 450 ? styles.charCountWarning : ''}`}>
              {descriptionCharCount}/{VALIDATION_RULES.description.maxLength}
            </span>
          </div>

          {/* Error Message */}
          {errors.description && touched.description && (
            <div id="description-error" className={styles.error} role="alert">
              <span className={styles.errorIcon}>✕</span>
              {errors.description}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="todo-file" className={styles.label}>
            Attachment <span className={styles.optional}>(optional)</span>
          </label>
          <input
            type="file"
            id="todo-file"
            name="file"
            className={styles.fileInput}
            accept=".txt,.csv,.xls,.xlsx,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFormData((prev) => ({ ...prev, file }));
              if (file && !['text/plain', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type)) {
                setErrors((prev) => ({
                  ...prev,
                  submit: 'Invalid attachment type. Only txt, csv, xls, xlsx, doc, and docx files are allowed.',
                }));
              } else if (file && file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                  ...prev,
                  submit: 'Attachment size must be 5MB or smaller.',
                }));
              } else {
                setErrors((prev) => ({ ...prev, submit: undefined }));
              }
            }}
            disabled={isSubmitting}
          />
          <small className={styles.helpText}>
            Accepted: .txt, .csv, .xls, .xlsx, .doc, .docx. Max 5MB.
          </small>
        </div>

        {/* Form Actions */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={!canSubmit}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Adding...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>➕</span>
                Add Todo
              </>
            )}
          </button>

          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={resetForm}
            disabled={isSubmitting || (formData.title === '' && formData.description === '')}
          >
            Clear
          </button>
        </div>

        {/* Help Text */}
        <div className={styles.help}>
          <small>
            <span className={styles.required}>*</span> Required field
          </small>
        </div>
      </form>
    </div>
  );
};

export default TodoForm;
