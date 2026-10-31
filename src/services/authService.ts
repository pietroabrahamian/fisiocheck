import {
    createUserWithEmailAndPassword,
    deleteUser,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
} from "firebase/auth"
import { auth } from "@/config/firebase"
import { queryClient } from "@/config/queryClient"
import { getErrorMessage } from "@/utils/errors"
import { createProfile } from "./profileService"

export async function signIn(email: string, password: string): Promise<void> {
    try {
        await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (error) {
        throw new Error(getErrorMessage(error, "Não foi possível entrar."))
    }
}

export async function signUp(name: string, email: string, password: string): Promise<void> {
    let createdUser
    try {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
        createdUser = credential.user
        // Todo cadastro feito pelo app é de paciente; o dono é definido no Console do Firebase
        await createProfile(createdUser.uid, { name: name.trim(), email: email.trim(), role: "paciente" })
    } catch (error) {
        // Se a conta foi criada mas o perfil não foi salvo, desfaz a conta para não ficar "pela metade"
        if (createdUser) await deleteUser(createdUser).catch(() => undefined)
        throw new Error(getErrorMessage(error, "Não foi possível criar sua conta."))
    }
}

export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email.trim())
    } catch (error) {
        throw new Error(getErrorMessage(error, "Não foi possível enviar o e-mail."))
    }
}

export async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
    // Apaga o cache para o próximo usuário não ver dados de quem saiu
    queryClient.clear()
}
