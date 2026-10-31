import { Ionicons } from "@expo/vector-icons"
import { Redirect, Tabs } from "expo-router"
import { LoadingView } from "@/components/StateViews"
import { useProfile } from "@/hooks/queries"
import { colors } from "@/theme/colors"
import { Role } from "@/types"

type IconName = keyof typeof Ionicons.glyphMap

export type TabConfig = { name: string; title: string; icon: IconName }

type Props = {
    /** Papel que pode ver estas abas; outro papel volta para o redirecionamento inicial */
    role: Role
    tabs: TabConfig[]
}

export function RoleTabs({ role, tabs }: Props) {
    const { data: profile, isPending } = useProfile()

    if (isPending) return <LoadingView />
    if (profile?.role !== role) return <Redirect href="/(app)" />

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.ink3,
                tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line, height: 64, paddingTop: 6 },
                sceneStyle: { backgroundColor: colors.canvas },
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused, size }) => (
                            <Ionicons name={tab.icon} color={focused ? colors.accent : colors.ink3} size={size} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    )
}
