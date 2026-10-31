import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native"
import { colors, radius } from "@/theme/colors"

type Variant = "primary" | "secondary" | "danger"

type Props = {
    title: string
    onPress: () => void
    variant?: Variant
    loading?: boolean
    disabled?: boolean
    style?: ViewStyle
}

export function Button({ title, onPress, variant = "primary", loading, disabled, style }: Props) {
    const inactive = disabled || loading
    return (
        <Pressable
            onPress={onPress}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!inactive, busy: !!loading }}
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                inactive && styles.disabled,
                pressed && styles.pressed,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? colors.onAccent : colors.ink} />
            ) : (
                <Text style={[styles.text, variant === "primary" ? styles.textPrimary : variant === "danger" ? styles.textDanger : null]}>
                    {title}
                </Text>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    base: {
        height: 54,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.lineStrong },
    danger: { backgroundColor: colors.dangerSoft },
    disabled: { opacity: 0.55 },
    pressed: { transform: [{ scale: 0.98 }] },
    text: { fontSize: 15, fontWeight: "700", color: colors.ink },
    textPrimary: { color: colors.onAccent },
    textDanger: { color: colors.danger },
})
