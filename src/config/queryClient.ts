import { QueryClient } from "@tanstack/react-query"

// Cache das leituras do Firestore. Uma única instância para o app todo.
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30_000,
        },
    },
})
