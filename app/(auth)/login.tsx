import { useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { AuthHeader } from "@/components/AuthHeader"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { resetPassword, signIn } from "@/services/authService"
import { colors } from "@/theme/colors"
import { isValidEmail } from "@/utils/validation"

export default function LoginScreen() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [loading, setLoading] = useState(false)
    const [sendingReset, setSendingReset] = useState(false)

    function validate() {
        const next: typeof errors = {}
        if (!isValidEmail(email)) next.email = "Informe um e-mail válido."
        if (!password) next.password = "Informe sua senha."
        setErrors(next)
        return Object.keys(next).length === 0
    }

    async function handleLogin() {
        if (!validate()) return
        setLoading(true)
        try {
            // O redirecionamento acontece no layout, quando o usuário do AuthContext muda
            await signIn(email, password)
        } catch (error) {
            Alert.alert("Não foi possível entrar", (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    async function handleForgotPassword() {
        if (!isValidEmail(email)) {
            setErrors({ email: "Digite seu e-mail acima para receber o link." })
            return
        }
        setSendingReset(true)
        try {
            await resetPassword(email)
            Alert.alert("E-mail enviado", "Se existir uma conta com este e-mail, você vai receber um link para criar uma nova senha.")
        } catch (error) {
            Alert.alert("Erro", (error as Error).message)
        } finally {
            setSendingReset(false)
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <AuthHeader title="Bem-vindo" subtitle="Entre para fazer o check-in da sua sessão." />

                    <View style={styles.form}>
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
                            placeholder="Sua senha"
                            secureTextEntry
                            autoComplete="password"
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                        />

                        <Pressable onPress={handleForgotPassword} disabled={sendingReset} style={styles.forgot}>
                            <Text style={styles.link}>{sendingReset ? "Enviando..." : "Esqueci minha senha"}</Text>
                        </Pressable>

                        <Button title="Entrar" onPress={handleLogin} loading={loading} />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Ainda não tem conta?</Text>
                        <Link href="/(auth)/cadastro" style={styles.link}>
                            Criar conta
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
    forgot: { alignSelf: "flex-end", marginTop: -4 },
    link: { color: colors.accent, fontWeight: "700", fontSize: 14 },
    footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 28 },
    footerText: { color: colors.ink2, fontSize: 14 },
})
