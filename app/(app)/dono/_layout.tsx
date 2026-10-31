import { RoleTabs } from "@/components/RoleTabs"

export default function OwnerLayout() {
    return (
        <RoleTabs
            role="dono"
            tabs={[
                { name: "index", title: "Resumo", icon: "stats-chart-outline" },
                { name: "clinica", title: "Clínica", icon: "business-outline" },
                { name: "perfil", title: "Perfil", icon: "person-outline" },
            ]}
        />
    )
}
