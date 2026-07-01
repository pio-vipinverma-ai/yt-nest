import { UpdateTodoDto } from '../types/todo.types';
export declare const useUpdateTodo: (onSuccess?: () => void) => {
    updateTodo: (id: string, dto: UpdateTodoDto) => Promise<void>;
    toggleTodo: (id: string, completed: boolean) => Promise<void>;
    loading: boolean;
    error: string | null;
};
