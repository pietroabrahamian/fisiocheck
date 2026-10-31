import { Redirect, Stack } from "expo-router"
import { LoadingView } from "@/components/StateViews"
import { useAuth } from "@/contexts/AuthContext"
import { colors } from "@/theme/colors"

// Tudo dentro de (app) exige usuário logado
export default function AppLayout() {
    const { user, initializing } = useAuth()

    if (initializing) return <LoadingView />
    if (!user) return <Redirect href="/(auth)/login" />

    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
}
