import { Redirect } from "expo-router"
import { LoadingView } from "@/components/StateViews"
import { useAuth } from "@/contexts/AuthContext"

export default function Index() {
    const { user, initializing } = useAuth()

    if (initializing) return <LoadingView />
    return <Redirect href={user ? "/(app)" : "/(auth)/login"} />
}
