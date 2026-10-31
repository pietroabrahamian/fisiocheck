import { useState } from "react"
import { Alert, StyleSheet, Text, View } from "react-native"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { useProfile } from "@/hooks/queries"
import { signOut } from "@/services/authService"
import { colors } from "@/theme/colors"

// Tela de perfil usada pelo paciente e pelo dono
export function ProfileView() {
    const { data: profile } = useProfile()
    const [leaving, setLeaving] = useState(false)

    function confirmSignOut() {
        Alert.alert("Sair da conta", "Deseja mesmo sair?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", style: "destructive", onPress: handleSignOut },
        ])
    }

    async function handleSignOut() {
        setLeaving(true)
        try {
            // O layout redireciona para o login quando o usuário vira null
            await signOut()
        } catch {
            setLeaving(false)
            Alert.alert("Erro", "Não foi possível sair. Tente novamente.")
        }
    }

    return (
        <Screen title="Perfil">
            <Card>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{profile?.name.charAt(0).toUpperCase() ?? "?"}</Text>
                </View>
                <Text style={styles.name}>{profile?.name}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{profile?.role === "dono" ? "Dono da clínica" : "Paciente"}</Text>
                </View>
            </Card>

            <Button title="Sair da conta" variant="danger" onPress={confirmSignOut} loading={leaving} />
        </Screen>
    )
}

const styles = StyleSheet.create({
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.hero,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    avatarText: { fontSize: 26, fontWeight: "800", color: colors.onHero },
    name: { fontSize: 18, fontWeight: "800", color: colors.ink, textAlign: "center" },
    email: { fontSize: 14, color: colors.ink2, textAlign: "center", marginTop: -8 },
    badge: {
        alignSelf: "center",
        backgroundColor: colors.accentSoft,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeText: { fontSize: 12.5, fontWeight: "700", color: colors.accent },
})
