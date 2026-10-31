import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/config/firebase"

// Só informa quem está logado. Login/cadastro ficam em authService e o perfil em useProfile.
type AuthContextValue = {
    user: User | null
    /** true enquanto o Firebase restaura a sessão salva */
    initializing: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [initializing, setInitializing] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setInitializing(false)
        })
        return unsubscribe
    }, [])

    return <AuthContext.Provider value={{ user, initializing }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth precisa ser usado dentro de um AuthProvider")
    }
    return context
}
