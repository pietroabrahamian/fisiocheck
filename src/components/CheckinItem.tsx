import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"
import { colors } from "@/theme/colors"
import { Checkin } from "@/types"
import { formatLongDate, formatTime } from "@/utils/dates"

type Props = {
    checkin: Checkin
    /** Na visão do dono mostra o nome do paciente */
    showPatient?: boolean
}

export function CheckinItem({ checkin, showPatient }: Props) {
    return (
        <View style={styles.row}>
            <View style={styles.icon}>
                <Ionicons name="checkmark" size={18} color={colors.success} />
            </View>
            <View style={styles.texts}>
                <Text style={styles.title} numberOfLines={1}>
                    {showPatient ? checkin.patientName : formatLongDate(checkin.date)}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {showPatient ? `${formatLongDate(checkin.date)} · ` : ""}com {checkin.professionalName}
                    {checkin.clinicName ? ` · ${checkin.clinicName}` : ""}
                </Text>
            </View>
            <Text style={styles.time}>{formatTime(checkin.createdAt)}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.successSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    texts: { flex: 1, minWidth: 0 },
    title: { fontSize: 15, fontWeight: "700", color: colors.ink },
    subtitle: { fontSize: 13, color: colors.ink2, marginTop: 1 },
    time: { fontSize: 13, color: colors.ink3, fontVariant: ["tabular-nums"] },
})
