import { useEffect, useState } from "react"
import { Alert, Linking, StyleSheet, Switch, Text, View } from "react-native"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Screen } from "@/components/Screen"
import { EmptyState, ErrorView, LoadingView, Notice } from "@/components/StateViews"
import { useAddProfessional, useClinic, useProfessionals, useSaveClinic, useToggleProfessional } from "@/hooks/queries"
import { Coords, getCurrentCoords, LocationPermissionError } from "@/services/locationService"
import { colors } from "@/theme/colors"
import { getErrorMessage } from "@/utils/errors"

const MIN_RADIUS = 20
const MAX_RADIUS = 2000

function ClinicForm() {
    const clinic = useClinic()
    const saveClinic = useSaveClinic()
    const [name, setName] = useState("")
    const [radiusText, setRadiusText] = useState("150")
    const [coords, setCoords] = useState<Coords | null>(null)
    const [locating, setLocating] = useState(false)
    const [errors, setErrors] = useState<{ name?: string; radius?: string; coords?: string }>({})

    // Preenche o formulário com o que já está salvo
    useEffect(() => {
        if (clinic.data) {
            setName(clinic.data.name)
            setRadiusText(String(clinic.data.radiusMeters))
            setCoords({ latitude: clinic.data.latitude, longitude: clinic.data.longitude })
        }
    }, [clinic.data])

    async function fillWithCurrentLocation() {
        setLocating(true)
        try {
            setCoords(await getCurrentCoords())
            setErrors((current) => ({ ...current, coords: undefined }))
        } catch (error) {
            const buttons =
                error instanceof LocationPermissionError
                    ? [{ text: "Cancelar" }, { text: "Abrir configurações", onPress: () => Linking.openSettings() }]
                    : undefined
            Alert.alert("Localização", getErrorMessage(error), buttons)
        } finally {
            setLocating(false)
        }
    }

    function handleSave() {
        const radiusMeters = Number(radiusText)
        const next: typeof errors = {}
        if (name.trim().length < 2) next.name = "Informe o nome da clínica."
        if (!Number.isInteger(radiusMeters) || radiusMeters < MIN_RADIUS || radiusMeters > MAX_RADIUS) {
            next.radius = `Use um número inteiro entre ${MIN_RADIUS} e ${MAX_RADIUS}.`
        }
        if (!coords) next.coords = "Defina o local da clínica."
        setErrors(next)
        if (Object.keys(next).length > 0 || !coords) return

        saveClinic.mutate(
            { name: name.trim(), radiusMeters, latitude: coords.latitude, longitude: coords.longitude },
            {
                onSuccess: () => Alert.alert("Clínica salva", "Os pacientes já podem fazer check-in neste local."),
                onError: (error) => Alert.alert("Não foi possível salvar", getErrorMessage(error)),
            }
        )
    }

    if (clinic.isPending) return <LoadingView />
    if (clinic.error) {
        return <ErrorView message={getErrorMessage(clinic.error, "Não foi possível carregar a clínica.")} onRetry={() => clinic.refetch()} />
    }

    return (
        <Card title="Local do check-in">
            {!clinic.data ? (
                <Notice
                    tone="warning"
                    icon="alert-circle"
                    message="A clínica ainda não está configurada. Os pacientes não conseguem fazer check-in."
                />
            ) : null}

            <Input label="Nome da clínica" placeholder="Ex.: Clínica Movimento" value={name} onChangeText={setName} error={errors.name} />
            <Input
                label="Raio permitido (metros)"
                placeholder="150"
                keyboardType="number-pad"
                value={radiusText}
                onChangeText={setRadiusText}
                error={errors.radius}
            />

            <View style={styles.location}>
                <Text style={styles.locationLabel}>Localização</Text>
                <Text style={[styles.locationValue, errors.coords ? styles.locationError : null]}>
                    {coords
                        ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                        : errors.coords ?? "Ainda não definida"}
                </Text>
            </View>
            <Button
                title={coords ? "Atualizar com minha localização atual" : "Usar minha localização atual"}
                variant="secondary"
                onPress={fillWithCurrentLocation}
                loading={locating}
            />
            <Text style={styles.footnote}>Faça isso estando dentro da clínica.</Text>

            <Button title="Salvar clínica" onPress={handleSave} loading={saveClinic.isPending} disabled={locating} />
        </Card>
    )
}

function ProfessionalsSection() {
    const professionals = useProfessionals()
    const addProfessional = useAddProfessional()
    const toggleProfessional = useToggleProfessional()
    const [name, setName] = useState("")
    const [specialty, setSpecialty] = useState("")
    const [nameError, setNameError] = useState<string>()

    function handleAdd() {
        if (name.trim().length < 2) {
            setNameError("Informe o nome do profissional.")
            return
        }
        setNameError(undefined)
        addProfessional.mutate(
            { name, specialty },
            {
                onSuccess: () => {
                    Alert.alert("Profissional cadastrado", `${name.trim()} já aparece para os pacientes no check-in.`)
                    setName("")
                    setSpecialty("")
                },
                onError: (error) => Alert.alert("Não foi possível cadastrar", getErrorMessage(error)),
            }
        )
    }

    function handleToggle(id: string) {
        const professional = professionals.data?.find((item) => item.id === id)
        if (!professional) return
        toggleProfessional.mutate(professional, {
            onError: (error) => Alert.alert("Não foi possível alterar", getErrorMessage(error)),
        })
    }

    return (
        <Card title="Profissionais">
            <Input label="Nome" placeholder="Ex.: Ana Souza" value={name} onChangeText={setName} error={nameError} />
            <Input label="Especialidade (opcional)" placeholder="Ex.: Pilates" value={specialty} onChangeText={setSpecialty} />
            <Button title="Adicionar profissional" onPress={handleAdd} loading={addProfessional.isPending} />

            <View style={styles.divider} />

            {professionals.isPending ? (
                <View style={styles.loading}>
                    <LoadingView />
                </View>
            ) : professionals.error ? (
                <ErrorView
                    message={getErrorMessage(professionals.error, "Não foi possível carregar os profissionais.")}
                    onRetry={() => professionals.refetch()}
                />
            ) : professionals.data.length === 0 ? (
                <EmptyState
                    icon="people-outline"
                    title="Nenhum profissional"
                    description="Cadastre quem dá as aulas para os pacientes escolherem no check-in."
                />
            ) : (
                professionals.data.map((item) => {
                    const updating = toggleProfessional.isPending && toggleProfessional.variables?.id === item.id
                    return (
                        <View key={item.id} style={styles.professional}>
                            <View style={styles.professionalTexts}>
                                <Text style={[styles.professionalName, !item.active && styles.inactive]}>{item.name}</Text>
                                <Text style={styles.professionalInfo}>
                                    {[item.specialty, item.active ? "Ativo" : "Inativo"].filter(Boolean).join(" · ")}
                                </Text>
                            </View>
                            <Switch
                                value={item.active}
                                onValueChange={() => handleToggle(item.id)}
                                disabled={updating}
                                trackColor={{ true: colors.accent, false: colors.lineStrong }}
                                thumbColor={colors.surface}
                                accessibilityLabel={`${item.active ? "Desativar" : "Ativar"} ${item.name}`}
                            />
                        </View>
                    )
                })
            )}
        </Card>
    )
}

export default function ClinicScreen() {
    const clinic = useClinic()
    const professionals = useProfessionals()

    function refetchAll() {
        clinic.refetch()
        professionals.refetch()
    }

    return (
        <Screen
            title="Clínica"
            subtitle="Local do check-in e profissionais"
            refreshing={clinic.isRefetching || professionals.isRefetching}
            onRefresh={refetchAll}
        >
            <ClinicForm />
            <ProfessionalsSection />
        </Screen>
    )
}

const styles = StyleSheet.create({
    location: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
    locationLabel: { fontSize: 13, fontWeight: "600", color: colors.ink2 },
    locationValue: { flex: 1, textAlign: "right", fontSize: 14, color: colors.ink, fontVariant: ["tabular-nums"] },
    locationError: { color: colors.danger },
    footnote: { fontSize: 12, color: colors.ink3, textAlign: "center", marginTop: -4 },
    divider: { height: 1, backgroundColor: colors.line },
    loading: { height: 120 },
    professional: { flexDirection: "row", alignItems: "center", gap: 12 },
    professionalTexts: { flex: 1 },
    professionalName: { fontSize: 15, fontWeight: "700", color: colors.ink },
    professionalInfo: { fontSize: 13, color: colors.ink2, marginTop: 1 },
    inactive: { color: colors.ink3 },
})
