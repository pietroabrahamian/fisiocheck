import { FirebaseError } from "firebase/app"
import { AppError, getErrorMessage } from "@/utils/errors"
import { isValidEmail } from "@/utils/validation"

describe("getErrorMessage", () => {
    it("usa a mensagem do AppError", () => {
        expect(getErrorMessage(new AppError("Você já fez check-in hoje."))).toBe("Você já fez check-in hoje.")
    })

    it("traduz códigos do Firebase", () => {
        expect(getErrorMessage(new FirebaseError("auth/invalid-credential", "x"))).toBe("E-mail ou senha incorretos.")
        expect(getErrorMessage(new FirebaseError("auth/email-already-in-use", "x"))).toBe("Já existe uma conta com este e-mail.")
        expect(getErrorMessage(new FirebaseError("permission-denied", "x"))).toBe("Você não tem permissão para fazer isso.")
    })

    it("reconhece o Firestore offline", () => {
        const error = new FirebaseError("failed-precondition", "Failed to get document because the client is offline.")
        expect(getErrorMessage(error)).toBe("Sem conexão com o servidor. Verifique sua internet.")
    })

    it("cai no texto padrão para erro desconhecido", () => {
        expect(getErrorMessage(new FirebaseError("algo/novo", "x"))).toBe("Algo deu errado. Tente novamente.")
        expect(getErrorMessage(new Error("interno"), "Falhou.")).toBe("Falhou.")
        expect(getErrorMessage(undefined)).toBe("Algo deu errado. Tente novamente.")
    })
})

describe("isValidEmail", () => {
    it("aceita e-mails válidos (com espaços nas pontas)", () => {
        expect(isValidEmail("admin@gmail.com")).toBe(true)
        expect(isValidEmail("  paciente@gmail.com ")).toBe(true)
    })

    it("recusa e-mails inválidos", () => {
        expect(isValidEmail("")).toBe(false)
        expect(isValidEmail("admin")).toBe(false)
        expect(isValidEmail("admin@gmail")).toBe(false)
        expect(isValidEmail("ad min@gmail.com")).toBe(false)
    })
})
