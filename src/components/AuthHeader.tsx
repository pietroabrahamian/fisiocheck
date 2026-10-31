import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"
import { colors } from "@/theme/colors"

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <View style={styles.container}>
            <View style={styles.brand}>
                <View style={styles.logo}>
                    <Ionicons name="pulse" size={22} color={colors.heroLight} />
                </View>
                <Text style={styles.brandName}>FisioCheck</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { gap: 6, marginBottom: 24 },
    brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
    logo: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.hero,
        alignItems: "center",
        justifyContent: "center",
    },
    brandName: { fontSize: 20, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
    title: { fontSize: 28, fontWeight: "800", color: colors.ink, letterSpacing: -0.7 },
    subtitle: { fontSize: 15, color: colors.ink2 },
})
