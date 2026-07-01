import { CreateTodoDto } from '../types/todo.types';
export declare const useCreateTodo: (onSuccess?: () => void) => {
    createTodo: (dto: CreateTodoDto) => Promise<void>;
    loading: boolean;
    error: string | null;
};
