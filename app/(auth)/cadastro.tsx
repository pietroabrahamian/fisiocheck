import { useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { AuthHeader } from "@/components/AuthHeader"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { signUp } from "@/services/authService"
import { colors } from "@/theme/colors"
import { isValidEmail } from "@/utils/validation"

type Errors = { name?: string; email?: string; password?: string; confirm?: string }

export default function SignUpScreen() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [errors, setErrors] = useState<Errors>({})
    const [loading, setLoading] = useState(false)

    function validate() {
        const next: Errors = {}
        if (name.trim().length < 2) next.name = "Informe seu nome completo."
        if (!isValidEmail(email)) next.email = "Informe um e-mail válido."
        if (password.length < 6) next.password = "A senha precisa ter pelo menos 6 caracteres."
        if (confirm !== password) next.confirm = "As senhas não conferem."
        setErrors(next)
        return Object.keys(next).length === 0
    }

    async function handleSignUp() {
        if (!validate()) return
        setLoading(true)
        try {
            // Ao criar a conta o usuário já fica logado e o layout leva para a área do paciente
            await signUp(name, email, password)
        } catch (error) {
            Alert.alert("Não foi possível cadastrar", (error as Error).message)
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <AuthHeader title="Criar conta" subtitle="Cadastre-se para registrar suas sessões na clínica." />

                    <View style={styles.form}>
                        <Input
                            label="Nome"
                            placeholder="Seu nome completo"
                            autoComplete="name"
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                        />
                        <Input
                            label="E-mail"
                            placeholder="voce@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            value={email}
                            onChangeText={setEmail}
                            error={errors.email}
                        />
                        <Input
                            label="Senha"
                            placeholder="Mínimo de 6 caracteres"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                        />
                        <Input
                            label="Confirmar senha"
                            placeholder="Repita a senha"
                            secureTextEntry
                            value={confirm}
                            onChangeText={setConfirm}
                            error={errors.confirm}
                        />

                        <Button title="Criar conta" onPress={handleSignUp} loading={loading} style={styles.button} />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Já tem conta?</Text>
                        <Link href="/(auth)/login" style={styles.link}>
                            Entrar
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.canvas },
    content: { flexGrow: 1, justifyContent: "center", padding: 24 },
    form: { gap: 16 },
    button: { marginTop: 8 },
    link: { color: colors.accent, fontWeight: "700", fontSize: 14 },
    footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 28 },
    footerText: { color: colors.ink2, fontSize: 14 },
})
