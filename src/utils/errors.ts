import { FirebaseError } from "firebase/app"

/** Erro com uma mensagem já pronta para mostrar ao usuário */
export class AppError extends Error {}

const FIREBASE_MESSAGES: Record<string, string> = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/missing-password": "Informe sua senha.",
    "auth/email-already-in-use": "Já existe uma conta com este e-mail.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente novamente.",
    "auth/network-request-failed": "Sem conexão com a internet.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-token-expired": "Sua sessão expirou. Entre novamente.",
    "auth/invalid-api-key": "Configuração do Firebase inválida. Confira o arquivo .env.",
    "permission-denied": "Você não tem permissão para fazer isso.",
    unavailable: "Sem conexão com o servidor. Verifique sua internet.",
    "deadline-exceeded": "O servidor demorou para responder. Tente novamente.",
    unauthenticated: "Sua sessão expirou. Entre novamente.",
}

/** Traduz qualquer erro (Firebase, AppError ou desconhecido) para uma mensagem em português */
export function getErrorMessage(error: unknown, fallback = "Algo deu errado. Tente novamente."): string {
    if (error instanceof AppError) return error.message
    if (error instanceof FirebaseError) {
        // O Firestore às vezes avisa que está offline com o código "failed-precondition"
        if (error.message.toLowerCase().includes("offline")) return FIREBASE_MESSAGES.unavailable
        return FIREBASE_MESSAGES[error.code] ?? fallback
    }
    return fallback
}
