import { QueryClientProvider } from "@tanstack/react-query"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { queryClient } from "@/config/queryClient"
import { AuthProvider } from "@/contexts/AuthContext"
import { colors } from "@/theme/colors"

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <StatusBar style="dark" />
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
            </AuthProvider>
        </QueryClientProvider>
    )
}
