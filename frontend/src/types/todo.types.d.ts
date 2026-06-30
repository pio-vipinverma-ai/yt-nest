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
}
export interface UpdateTodoDto {
    title?: string;
    description?: string;
    completed?: boolean;
}
export type TodoFilter = 'all' | 'active' | 'completed';
export interface ApiError {
    statusCode: number;
    message: string | string[];
    error: string;
}
