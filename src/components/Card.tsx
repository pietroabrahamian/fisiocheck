import { ReactNode } from "react"
import { StyleSheet, Text, View, ViewStyle } from "react-native"
import { colors, radius } from "@/theme/colors"

type Props = {
    title?: string
    right?: ReactNode
    children: ReactNode
    style?: ViewStyle
}

export function Card({ title, right, children, style }: Props) {
    return (
        <View style={[styles.card, style]}>
            {title ? (
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    {right}
                </View>
            ) : null}
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.lg,
        padding: 16,
        gap: 12,
    },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: { fontSize: 16, fontWeight: "800", color: colors.ink, letterSpacing: -0.2 },
})
