import React from 'react';
interface TodoFormProps {
    onSuccess: () => void;
    onSubmit: (data: {
        title: string;
        description?: string;
        file?: File;
    }) => Promise<void>;
    isSubmitting?: boolean;
}
export declare const TodoForm: React.FC<TodoFormProps>;
export {};
