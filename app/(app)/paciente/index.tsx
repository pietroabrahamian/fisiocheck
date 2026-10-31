import { Ionicons } from "@expo/vector-icons"
import { useMemo, useState } from "react"
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Screen } from "@/components/Screen"
import { ErrorView, LoadingView, Notice } from "@/components/StateViews"
import { useAuth } from "@/contexts/AuthContext"
import { useClinic, useCreateCheckin, useMyCheckins, useProfessionals, useProfile } from "@/hooks/queries"
import { LocationPermissionError } from "@/services/locationService"
import { colors, radius } from "@/theme/colors"
import { formatTime, formatWeekday, formatWeekRange, toDateKey, toWeekKey, weekDays } from "@/utils/dates"
import { getErrorMessage } from "@/utils/errors"

export default function CheckinScreen() {
    const { user } = useAuth()
    const profile = useProfile()
    const clinic = useClinic()
    const professionals = useProfessionals()
    const checkins = useMyCheckins()
    const createCheckin = useCreateCheckin()
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const queries = [profile, clinic, professionals, checkins]
    const today = new Date()
    const todayKey = toDateKey(today)
    const weekKey = toWeekKey(today)

    const activeProfessionals = useMemo(() => (professionals.data ?? []).filter((item) => item.active), [professionals.data])
    const weekCheckins = useMemo(() => (checkins.data ?? []).filter((item) => item.week === weekKey), [checkins.data, weekKey])
    const todayCheckin = weekCheckins.find((item) => item.date === todayKey)
    const checkedDays = new Set(weekCheckins.map((item) => item.date))

    function refetchAll() {
        queries.forEach((query) => query.refetch())
    }

    function selectProfessional(id: string) {
        setSelectedId(id)
        createCheckin.reset() // limpa o erro da tentativa anterior
    }

    function handleCheckin() {
        const professional = activeProfessionals.find((item) => item.id === selectedId)
        if (!professional || !clinic.data || !profile.data || !user) return

        createCheckin.mutate(
            { patientId: user.uid, patientName: profile.data.name, professional, clinic: clinic.data },
            {
                onSuccess: (checkin) => {
                    setSelectedId(null)
                    Alert.alert("Check-in feito!", `Sessão de hoje registrada com ${checkin.professionalName}. Boa sessão!`)
                },
            }
        )
    }

    if (queries.some((query) => query.isPending)) return <LoadingView />

    const failed = queries.find((query) => query.error)
    if (failed) {
        return <ErrorView message={getErrorMessage(failed.error, "Não foi possível carregar seus dados.")} onRetry={refetchAll} />
    }

    const sessions = weekCheckins.length
    const checkinError = createCheckin.error

    return (
        <Screen
            title={`Olá, ${profile.data?.name.split(" ")[0]}`}
            subtitle={clinic.data?.name ?? "FisioCheck"}
            refreshing={queries.some((query) => query.isRefetching)}
            onRefresh={refetchAll}
        >
            <View style={styles.hero}>
                <Text style={styles.heroLabel}>Minha semana · {formatWeekRange(today)}</Text>
                <Text style={styles.heroValue}>
                    {sessions} {sessions === 1 ? "sessão" : "sessões"}
                </Text>
                <View style={styles.days}>
                    {weekDays(today).map((day) => {
                        const key = toDateKey(day)
                        const done = checkedDays.has(key)
                        return (
                            <View key={key} style={styles.day}>
                                <View style={[styles.dayDot, done && styles.dayDotDone, key === todayKey && styles.dayDotToday]}>
                                    {done ? <Ionicons name="checkmark" size={14} color={colors.hero} /> : null}
                                </View>
                                <Text style={styles.dayLabel}>{formatWeekday(day)}</Text>
                            </View>
                        )
                    })}
                </View>
            </View>

            <Card title="Check-in de hoje">
                {todayCheckin ? (
                    <Notice
                        tone="success"
                        icon="checkmark-circle"
                        message={`Check-in feito às ${formatTime(todayCheckin.createdAt)} com ${todayCheckin.professionalName}. Até a próxima sessão!`}
                    />
                ) : !clinic.data ? (
                    <Notice
                        tone="warning"
                        icon="alert-circle"
                        message="A clínica ainda não configurou o local de check-in. Avise a recepção."
                    />
                ) : activeProfessionals.length === 0 ? (
                    <Notice
                        tone="warning"
                        icon="alert-circle"
                        message="Nenhum profissional disponível no momento. Avise a recepção."
                    />
                ) : (
                    <>
                        <Text style={styles.hint}>Com quem é a sua sessão hoje?</Text>
                        <View style={styles.options}>
                            {activeProfessionals.map((item) => {
                                const selected = item.id === selectedId
                                return (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => selectProfessional(item.id)}
                                        disabled={createCheckin.isPending}
                                        style={[styles.option, selected && styles.optionSelected]}
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: selected }}
                                    >
                                        <Ionicons
                                            name={selected ? "radio-button-on" : "radio-button-off"}
                                            size={20}
                                            color={selected ? colors.accent : colors.ink3}
                                        />
                                        <View style={styles.optionTexts}>
                                            <Text style={styles.optionName}>{item.name}</Text>
                                            {item.specialty ? <Text style={styles.optionSpecialty}>{item.specialty}</Text> : null}
                                        </View>
                                    </Pressable>
                                )
                            })}
                        </View>

                        {checkinError ? (
                            <>
                                <Notice tone="danger" icon="close-circle" message={getErrorMessage(checkinError)} />
                                {checkinError instanceof LocationPermissionError ? (
                                    <Button title="Abrir configurações" variant="secondary" onPress={() => Linking.openSettings()} />
                                ) : null}
                            </>
                        ) : null}

                        <Button
                            title={createCheckin.isPending ? "Confirmando localização..." : "Fazer check-in"}
                            onPress={handleCheckin}
                            loading={createCheckin.isPending}
                            disabled={!selectedId}
                        />
                        <Text style={styles.footnote}>
                            Usamos sua localização só agora, para confirmar que você está na clínica.
                        </Text>
                    </>
                )}
            </Card>
        </Screen>
    )
}

const styles = StyleSheet.create({
    hero: { backgroundColor: colors.hero, borderRadius: radius.lg, padding: 20, gap: 6 },
    heroLabel: { color: colors.heroLight, fontSize: 13, fontWeight: "600" },
    heroValue: { color: colors.onHero, fontSize: 34, fontWeight: "800", letterSpacing: -1 },
    days: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    day: { alignItems: "center", gap: 6 },
    dayDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: colors.hero2,
        backgroundColor: colors.hero2,
        alignItems: "center",
        justifyContent: "center",
    },
    dayDotDone: { backgroundColor: colors.heroLight, borderColor: colors.heroLight },
    dayDotToday: { borderColor: colors.onHero },
    dayLabel: { color: colors.heroLight, fontSize: 11.5, fontWeight: "600" },
    hint: { fontSize: 14, color: colors.ink2 },
    options: { gap: 8 },
    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.surface2,
    },
    optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    optionTexts: { flex: 1 },
    optionName: { fontSize: 15, fontWeight: "700", color: colors.ink },
    optionSpecialty: { fontSize: 13, color: colors.ink2, marginTop: 1 },
    footnote: { fontSize: 12, color: colors.ink3, textAlign: "center" },
})
