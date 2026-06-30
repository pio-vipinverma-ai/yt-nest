export interface Todo {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
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
export declare const useTodoState: () => {
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
    setFilter: import("react").Dispatch<import("react").SetStateAction<TodoFilter>>;
    clearError: () => void;
    filteredTodos: Todo[];
    activeCount: number;
    completedCount: number;
};
export default useTodoState;
