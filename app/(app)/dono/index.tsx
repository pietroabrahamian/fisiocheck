import { Ionicons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Card } from "@/components/Card"
import { CheckinItem } from "@/components/CheckinItem"
import { Screen } from "@/components/Screen"
import { EmptyState, ErrorView, LoadingView } from "@/components/StateViews"
import { useWeekCheckins } from "@/hooks/queries"
import { colors, radius } from "@/theme/colors"
import { Checkin } from "@/types"
import { addDays, formatWeekRange, startOfWeek, toWeekKey } from "@/utils/dates"
import { getErrorMessage } from "@/utils/errors"

type Count = { key: string; name: string; total: number }

/** Agrupa os check-ins e conta quantos tem cada grupo (maior primeiro) */
function countBy(checkins: Checkin[], getKey: (c: Checkin) => string, getName: (c: Checkin) => string): Count[] {
    const counts = new Map<string, Count>()
    for (const checkin of checkins) {
        const key = getKey(checkin)
        const current = counts.get(key) ?? { key, name: getName(checkin), total: 0 }
        current.total += 1
        counts.set(key, current)
    }
    return [...counts.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "pt-BR"))
}

function CountList({ items, unit }: { items: Count[]; unit: [string, string] }) {
    const max = items[0]?.total ?? 1
    return (
        <View style={styles.countList}>
            {items.map((item) => (
                <View key={item.key} style={styles.countRow}>
                    <View style={styles.countHeader}>
                        <Text style={styles.countName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={styles.countValue}>
                            {item.total} {item.total === 1 ? unit[0] : unit[1]}
                        </Text>
                    </View>
                    <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${(item.total / max) * 100}%` }]} />
                    </View>
                </View>
            ))}
        </View>
    )
}

export default function SummaryScreen() {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
    const weekKey = toWeekKey(weekStart)
    const isCurrentWeek = weekKey === toWeekKey(new Date())
    const { data: checkins, isPending, error, refetch, isRefetching } = useWeekCheckins(weekKey)

    const byProfessional = useMemo(
        () => countBy(checkins ?? [], (c) => c.professionalId, (c) => c.professionalName),
        [checkins]
    )
    const byPatient = useMemo(() => countBy(checkins ?? [], (c) => c.patientId, (c) => c.patientName), [checkins])

    const total = checkins?.length ?? 0

    return (
        <Screen title="Resumo semanal" subtitle="Aulas registradas pelos check-ins" refreshing={isRefetching} onRefresh={refetch}>
            <View style={styles.weekNav}>
                <Pressable
                    onPress={() => setWeekStart((current) => addDays(current, -7))}
                    style={styles.navButton}
                    accessibilityLabel="Semana anterior"
                >
                    <Ionicons name="chevron-back" size={20} color={colors.ink} />
                </Pressable>
                <View style={styles.weekInfo}>
                    <Text style={styles.weekRange}>{formatWeekRange(weekStart)}</Text>
                    <Text style={styles.weekLabel}>{isCurrentWeek ? "Semana atual" : weekKey}</Text>
                </View>
                <Pressable
                    onPress={() => setWeekStart((current) => addDays(current, 7))}
                    disabled={isCurrentWeek}
                    style={[styles.navButton, isCurrentWeek && styles.navDisabled]}
                    accessibilityLabel="Próxima semana"
                >
                    <Ionicons name="chevron-forward" size={20} color={colors.ink} />
                </Pressable>
            </View>

            {isPending ? (
                <View style={styles.loading}>
                    <LoadingView />
                </View>
            ) : error ? (
                <ErrorView message={getErrorMessage(error, "Não foi possível carregar o resumo.")} onRetry={() => refetch()} />
            ) : (
                <>
                    <View style={styles.hero}>
                        <Text style={styles.heroLabel}>Total de aulas na semana</Text>
                        <Text style={styles.heroValue}>{total}</Text>
                        <Text style={styles.heroLabel}>
                            {byPatient.length} {byPatient.length === 1 ? "paciente atendido" : "pacientes atendidos"}
                        </Text>
                    </View>

                    {total === 0 ? (
                        <Card>
                            <EmptyState
                                icon="calendar-clear-outline"
                                title="Nenhuma aula nesta semana"
                                description="Os check-ins dos pacientes aparecem aqui assim que forem feitos."
                            />
                        </Card>
                    ) : (
                        <>
                            <Card title="Aulas por profissional">
                                <Text style={styles.cardHint}>Base para o pagamento por aula.</Text>
                                <CountList items={byProfessional} unit={["aula", "aulas"]} />
                            </Card>

                            <Card title="Presenças por paciente">
                                <CountList items={byPatient} unit={["vez", "vezes"]} />
                            </Card>

                            <Card title="Check-ins da semana">
                                {checkins.map((checkin, index) => (
                                    <View key={checkin.id}>
                                        {index > 0 ? <View style={styles.divider} /> : null}
                                        <CheckinItem checkin={checkin} showPatient />
                                    </View>
                                ))}
                            </Card>
                        </>
                    )}
                </>
            )}
        </Screen>
    )
}

const styles = StyleSheet.create({
    weekNav: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.md,
        padding: 6,
    },
    navButton: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    navDisabled: { opacity: 0.3 },
    weekInfo: { flex: 1, alignItems: "center" },
    weekRange: { fontSize: 15, fontWeight: "800", color: colors.ink },
    weekLabel: { fontSize: 12, color: colors.ink3, marginTop: 1 },
    loading: { height: 200 },
    hero: { backgroundColor: colors.hero, borderRadius: radius.lg, padding: 20, gap: 4 },
    heroLabel: { color: colors.heroLight, fontSize: 13, fontWeight: "600" },
    heroValue: { color: colors.onHero, fontSize: 40, fontWeight: "800", letterSpacing: -1 },
    cardHint: { fontSize: 13, color: colors.ink3, marginTop: -6 },
    countList: { gap: 14 },
    countRow: { gap: 6 },
    countHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    countName: { flex: 1, fontSize: 14.5, fontWeight: "700", color: colors.ink },
    countValue: { fontSize: 14, fontWeight: "700", color: colors.accent, fontVariant: ["tabular-nums"] },
    barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.accentSoft, overflow: "hidden" },
    barFill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
    divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
})
