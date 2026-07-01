import React, { ReactNode } from 'react';
export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
    isOptimistic?: boolean;
    isDeleting?: boolean;
}
export interface CreateTodoDto {
    title: string;
    description?: string;
    file?: File | null;
}
export interface UpdateTodoDto {
    title?: string;
    description?: string;
    completed?: boolean;
}
export type TodoFilter = 'all' | 'active' | 'completed';
interface TodoContextState {
    todos: Todo[];
    filter: TodoFilter;
    loading: boolean;
    error: string | null;
    submitLoading: boolean;
    fetchTodos: () => Promise<void>;
    createTodo: (dto: CreateTodoDto) => Promise<void>;
    updateTodo: (id: string, dto: UpdateTodoDto) => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
    setFilter: (filter: TodoFilter) => void;
    clearError: () => void;
    filteredTodos: Todo[];
    activeCount: number;
    completedCount: number;
}
declare const TodoContext: React.Context<TodoContextState | undefined>;
interface TodoProviderProps {
    children: ReactNode;
}
export declare const TodoProvider: React.FC<TodoProviderProps>;
export declare const useTodoContext: () => TodoContextState;
export default TodoContext;
