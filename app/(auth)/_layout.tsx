import { Redirect, Stack } from "expo-router"
import { LoadingView } from "@/components/StateViews"
import { useAuth } from "@/contexts/AuthContext"
import { colors } from "@/theme/colors"

export default function AuthLayout() {
    const { user, initializing } = useAuth()

    if (initializing) return <LoadingView />
    if (user) return <Redirect href="/(app)" />

    return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} />
}
