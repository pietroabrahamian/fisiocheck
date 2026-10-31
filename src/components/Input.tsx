import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native"
import { colors, radius } from "@/theme/colors"

type Props = TextInputProps & {
    label: string
    error?: string
}

export function Input({ label, error, style, ...props }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                placeholderTextColor={colors.ink3}
                accessibilityLabel={label}
                style={[styles.input, error ? styles.inputError : null, style]}
                {...props}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { gap: 6 },
    label: { fontSize: 13, fontWeight: "600", color: colors.ink2 },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        paddingHorizontal: 14,
        fontSize: 16,
        color: colors.ink,
    },
    inputError: { borderColor: colors.danger },
    error: { fontSize: 12.5, color: colors.danger },
})
