import { RoleTabs } from "@/components/RoleTabs"

export default function PatientLayout() {
    return (
        <RoleTabs
            role="paciente"
            tabs={[
                { name: "index", title: "Check-in", icon: "location-outline" },
                { name: "historico", title: "Histórico", icon: "time-outline" },
                { name: "perfil", title: "Perfil", icon: "person-outline" },
            ]}
        />
    )
}
