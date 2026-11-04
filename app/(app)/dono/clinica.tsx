import { useState } from "react"
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Input } from "@/components/Input"
import { Screen } from "@/components/Screen"
import { EmptyState, ErrorView, LoadingView, Notice } from "@/components/StateViews"
import { useAddProfessional, useClinics, useProfessionals, useSaveClinic, useToggleProfessional } from "@/hooks/queries"
import { Coords, describeCoords, geocodeAddress, getCurrentCoords, LocationPermissionError } from "@/services/locationService"
import { colors, radius } from "@/theme/colors"
import { Clinic } from "@/types"
import { formatDistance } from "@/utils/distance"
import { getErrorMessage } from "@/utils/errors"

const MIN_RADIUS = 20
const MAX_RADIUS = 2000

function showLocationError(error: unknown) {
    const buttons =
        error instanceof LocationPermissionError
            ? [{ text: "Cancelar" }, { text: "Abrir configurações", onPress: () => Linking.openSettings() }]
            : undefined
    Alert.alert("Localização", getErrorMessage(error), buttons)
}

type FormProps = {
    /** Clínica sendo editada; sem ela o formulário cadastra uma nova */
    editing: Clinic | null
    onDone: () => void
}

function ClinicForm({ editing, onDone }: FormProps) {
    const saveClinic = useSaveClinic()
    const [name, setName] = useState(editing?.name ?? "")
    const [address, setAddress] = useState(editing?.address ?? "")
    const [radiusText, setRadiusText] = useState(String(editing?.radiusMeters ?? 150))
    const [coords, setCoords] = useState<Coords | null>(
        editing ? { latitude: editing.latitude, longitude: editing.longitude } : null
    )
    const [locating, setLocating] = useState<"address" | "gps" | null>(null)
    const [errors, setErrors] = useState<{ name?: string; address?: string; radius?: string; coords?: string }>({})

    function changeAddress(text: string) {
        setAddress(text)
        setCoords(null) // o endereço mudou: precisa buscar de novo
    }

    async function searchAddress() {
        if (address.trim().length < 5) {
            setErrors((current) => ({ ...current, address: "Digite o endereço com número e cidade." }))
            return
        }
        setLocating("address")
        try {
            setCoords(await geocodeAddress(address.trim()))
            setErrors((current) => ({ ...current, address: undefined, coords: undefined }))
        } catch (error) {
            showLocationError(error)
        } finally {
            setLocating(null)
        }
    }

    async function fillWithCurrentLocation() {
        setLocating("gps")
        try {
            const current = await getCurrentCoords()
            setCoords(current)
            const found = await describeCoords(current)
            if (found) setAddress(found)
            setErrors((previous) => ({ ...previous, address: undefined, coords: undefined }))
        } catch (error) {
            showLocationError(error)
        } finally {
            setLocating(null)
        }
    }

    function handleSave() {
        const radiusMeters = Number(radiusText)
        const next: typeof errors = {}
        if (name.trim().length < 2) next.name = "Informe o nome da clínica."
        if (!Number.isInteger(radiusMeters) || radiusMeters < MIN_RADIUS || radiusMeters > MAX_RADIUS) {
            next.radius = `Use um número inteiro entre ${MIN_RADIUS} e ${MAX_RADIUS}.`
        }
        if (!coords) next.coords = "Busque o endereço ou use a localização atual."
        setErrors(next)
        if (Object.keys(next).length > 0 || !coords) return

        saveClinic.mutate(
            {
                id: editing?.id,
                clinic: {
                    name: name.trim(),
                    address: address.trim(),
                    radiusMeters,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                },
            },
            {
                onSuccess: () => {
                    Alert.alert(
                        editing ? "Clínica atualizada" : "Clínica cadastrada",
                        "Os pacientes já podem fazer check-in neste local."
                    )
                    onDone()
                },
                onError: (error) => Alert.alert("Não foi possível salvar", getErrorMessage(error)),
            }
        )
    }

    return (
        <Card title={editing ? `Editar ${editing.name}` : "Nova clínica"}>
            <Input label="Nome da clínica" placeholder="Ex.: Clínica FIAP Paulista" value={name} onChangeText={setName} error={errors.name} />
            <Input
                label="Endereço"
                placeholder="Ex.: Av. Paulista, 1106 - São Paulo - SP"
                value={address}
                onChangeText={changeAddress}
                error={errors.address}
            />
            <Button
                title="Buscar endereço"
                variant="secondary"
                onPress={searchAddress}
                loading={locating === "address"}
                disabled={locating !== null}
            />
            <Button
                title="Usar minha localização atual"
                variant="secondary"
                onPress={fillWithCurrentLocation}
                loading={locating === "gps"}
                disabled={locating !== null}
            />

            <View style={styles.location}>
                <Text style={styles.locationLabel}>Coordenadas</Text>
                <Text style={[styles.locationValue, errors.coords ? styles.locationError : null]}>
                    {coords
                        ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                        : errors.coords ?? "Ainda não definidas"}
                </Text>
            </View>

            <Input
                label="Raio permitido (metros)"
                placeholder="150"
                keyboardType="number-pad"
                value={radiusText}
                onChangeText={setRadiusText}
                error={errors.radius}
            />

            <Button
                title={editing ? "Salvar alterações" : "Cadastrar clínica"}
                onPress={handleSave}
                loading={saveClinic.isPending}
                disabled={locating !== null}
            />
            {editing ? <Button title="Cancelar edição" variant="secondary" onPress={onDone} /> : null}
        </Card>
    )
}

function ClinicsSection() {
    const clinics = useClinics()
    const [editing, setEditing] = useState<Clinic | null>(null)
    // Muda a cada salvar/cancelar para o formulário começar limpo
    const [formKey, setFormKey] = useState(0)

    function finishForm() {
        setEditing(null)
        setFormKey((current) => current + 1)
    }

    function startEditing(clinic: Clinic) {
        setEditing(clinic)
        setFormKey((current) => current + 1)
    }

    return (
        <>
            <Card title="Clínicas">
                {clinics.isPending ? (
                    <View style={styles.loading}>
                        <LoadingView />
                    </View>
                ) : clinics.error ? (
                    <ErrorView
                        message={getErrorMessage(clinics.error, "Não foi possível carregar as clínicas.")}
                        onRetry={() => clinics.refetch()}
                    />
                ) : clinics.data.length === 0 ? (
                    <Notice
                        tone="warning"
                        icon="alert-circle"
                        message="Nenhuma clínica cadastrada. Os pacientes não conseguem fazer check-in."
                    />
                ) : (
                    clinics.data.map((item, index) => (
                        <View key={item.id}>
                            {index > 0 ? <View style={styles.divider} /> : null}
                            <View style={styles.clinic}>
                                <View style={styles.clinicIcon}>
                                    <Ionicons name="business" size={18} color={colors.accent} />
                                </View>
                                <View style={styles.texts}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemInfo}>
                                        {[item.address, `raio de ${formatDistance(item.radiusMeters)}`].filter(Boolean).join(" · ")}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() => startEditing(item)}
                                    style={styles.editButton}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Editar ${item.name}`}
                                >
                                    <Ionicons name="create-outline" size={20} color={colors.accent} />
                                </Pressable>
                            </View>
                        </View>
                    ))
                )}
            </Card>

            <ClinicForm key={formKey} editing={editing} onDone={finishForm} />
        </>
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
                            <View style={styles.texts}>
                                <Text style={[styles.itemName, !item.active && styles.inactive]}>{item.name}</Text>
                                <Text style={styles.itemInfo}>
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
    const clinics = useClinics()
    const professionals = useProfessionals()

    function refetchAll() {
        clinics.refetch()
        professionals.refetch()
    }

    return (
        <Screen
            title="Clínicas"
            subtitle="Locais de check-in e profissionais"
            refreshing={clinics.isRefetching || professionals.isRefetching}
            onRefresh={refetchAll}
        >
            <ClinicsSection />
            <ProfessionalsSection />
        </Screen>
    )
}

const styles = StyleSheet.create({
    location: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
    locationLabel: { fontSize: 13, fontWeight: "600", color: colors.ink2 },
    locationValue: { flex: 1, textAlign: "right", fontSize: 14, color: colors.ink, fontVariant: ["tabular-nums"] },
    locationError: { color: colors.danger },
    divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
    loading: { height: 120 },
    clinic: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
    clinicIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accentSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    editButton: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
    professional: { flexDirection: "row", alignItems: "center", gap: 12 },
    texts: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: "700", color: colors.ink },
    itemInfo: { fontSize: 13, color: colors.ink2, marginTop: 1 },
    inactive: { color: colors.ink3 },
})
