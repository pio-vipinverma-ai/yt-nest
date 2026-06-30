import { Todo, TodoFilter } from '../types/todo.types';
export declare const useTodos: (filter?: TodoFilter) => {
    todos: Todo[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
};
