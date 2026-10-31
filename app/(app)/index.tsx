import { Redirect } from "expo-router"
import { ErrorView, LoadingView } from "@/components/StateViews"
import { useProfile } from "@/hooks/queries"
import { signOut } from "@/services/authService"
import { AppError, getErrorMessage } from "@/utils/errors"

// Decide a área do usuário pelo papel salvo no Firestore (users/{uid}.role)
export default function RoleRedirect() {
    const { data: profile, isPending, error, refetch } = useProfile()

    if (isPending) return <LoadingView />
    if (error) {
        // Perfil inexistente não se resolve tentando de novo: oferece sair da conta
        const missingProfile = error instanceof AppError
        return (
            <ErrorView
                message={getErrorMessage(error, "Não foi possível carregar seu perfil.")}
                onRetry={missingProfile ? signOut : () => refetch()}
                retryLabel={missingProfile ? "Sair" : "Tentar novamente"}
            />
        )
    }

    return <Redirect href={profile.role === "dono" ? "/(app)/dono" : "/(app)/paciente"} />
}
