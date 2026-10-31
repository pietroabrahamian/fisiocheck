import { Ionicons } from "@expo/vector-icons"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { colors } from "@/theme/colors"
import { Button } from "./Button"

export function LoadingView() {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
        </View>
    )
}

type EmptyProps = {
    icon: keyof typeof Ionicons.glyphMap
    title: string
    description?: string
}

export function EmptyState({ icon, title, description }: EmptyProps) {
    return (
        <View style={styles.empty}>
            <View style={styles.iconCircle}>
                <Ionicons name={icon} size={26} color={colors.accent} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
    )
}

type ErrorProps = {
    message: string
    onRetry?: () => void
    retryLabel?: string
}

export function ErrorView({ message, onRetry, retryLabel = "Tentar novamente" }: ErrorProps) {
    return (
        <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={32} color={colors.danger} />
            <Text style={styles.description}>{message}</Text>
            {onRetry ? <Button title={retryLabel} onPress={onRetry} variant="secondary" style={styles.action} /> : null}
        </View>
    )
}

type NoticeProps = {
    tone: "success" | "warning" | "danger"
    icon: keyof typeof Ionicons.glyphMap
    message: string
}

/** Faixa de aviso dentro de um card (sucesso, atenção ou erro) */
export function Notice({ tone, icon, message }: NoticeProps) {
    const palette = {
        success: { bg: colors.successSoft, fg: colors.success },
        warning: { bg: colors.warningSoft, fg: colors.warning },
        danger: { bg: colors.dangerSoft, fg: colors.danger },
    }[tone]
    return (
        <View style={[styles.notice, { backgroundColor: palette.bg }]} accessibilityRole="alert">
            <Ionicons name={icon} size={18} color={palette.fg} />
            <Text style={[styles.noticeText, { color: palette.fg }]}>{message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
    empty: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16, gap: 8 },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    title: { fontSize: 16, fontWeight: "800", color: colors.ink, textAlign: "center" },
    description: { fontSize: 13.5, color: colors.ink2, textAlign: "center", lineHeight: 19 },
    action: { marginTop: 8, height: 44, alignSelf: "center" },
    notice: { flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 12, borderRadius: 12 },
    noticeText: { flex: 1, fontSize: 13.5, lineHeight: 19, fontWeight: "600" },
})
