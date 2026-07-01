import React from 'react';
import { Todo } from '../../types/todo.types';
interface TodoItemProps {
    todo: Todo;
    onUpdate: () => void;
}
export declare const TodoItem: React.FC<TodoItemProps>;
export {};
