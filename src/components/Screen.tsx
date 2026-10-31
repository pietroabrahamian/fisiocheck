import { ReactNode } from "react"
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "@/theme/colors"

type Props = {
    title: string
    subtitle?: string
    children: ReactNode
    /** Puxar para baixo para recarregar */
    refreshing?: boolean
    onRefresh?: () => void
}

export function Screen({ title, subtitle, children, refreshing = false, onRefresh }: Props) {
    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} /> : undefined
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
                {children}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.canvas },
    content: { padding: 20, gap: 16, paddingBottom: 32 },
    header: { paddingTop: 8, paddingBottom: 4 },
    title: { fontSize: 24, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
    subtitle: { fontSize: 13.5, color: colors.ink3, marginTop: 2 },
})
