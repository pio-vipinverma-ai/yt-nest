import { Todo, CreateTodoDto, UpdateTodoDto, TodoFilter } from '../types/todo.types';
export declare const todoApi: {
    getTodos(filter?: TodoFilter): Promise<Todo[]>;
    getTodoById(id: string): Promise<Todo>;
    createTodo(dto: CreateTodoDto): Promise<Todo>;
    updateTodo(id: string, dto: UpdateTodoDto): Promise<Todo>;
    deleteTodo(id: string): Promise<void>;
    toggleTodo(id: string, completed: boolean): Promise<Todo>;
};
