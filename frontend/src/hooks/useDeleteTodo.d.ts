export declare const useDeleteTodo: (onSuccess?: () => void) => {
    deleteTodo: (id: string) => Promise<void>;
    loading: boolean;
    error: string | null;
};
