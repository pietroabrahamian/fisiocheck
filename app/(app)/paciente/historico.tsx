import { StyleSheet, Text, View } from "react-native"
import { Card } from "@/components/Card"
import { CheckinItem } from "@/components/CheckinItem"
import { Screen } from "@/components/Screen"
import { EmptyState, ErrorView, LoadingView } from "@/components/StateViews"
import { useMyCheckins } from "@/hooks/queries"
import { colors } from "@/theme/colors"
import { getErrorMessage } from "@/utils/errors"

export default function HistoryScreen() {
    const { data: checkins, isPending, error, refetch, isRefetching } = useMyCheckins()

    if (isPending) return <LoadingView />
    if (error) {
        return <ErrorView message={getErrorMessage(error, "Não foi possível carregar o histórico.")} onRetry={() => refetch()} />
    }

    const total = checkins.length

    return (
        <Screen
            title="Histórico"
            subtitle={total ? `${total} ${total === 1 ? "sessão registrada" : "sessões registradas"}` : undefined}
            refreshing={isRefetching}
            onRefresh={refetch}
        >
            <Card>
                {total === 0 ? (
                    <EmptyState
                        icon="calendar-outline"
                        title="Nenhum check-in ainda"
                        description="Quando você fizer o check-in na clínica, suas sessões aparecem aqui."
                    />
                ) : (
                    checkins.map((checkin, index) => (
                        <View key={checkin.id}>
                            {index > 0 ? <View style={styles.divider} /> : null}
                            <CheckinItem checkin={checkin} />
                        </View>
                    ))
                )}
            </Card>
            {total > 0 ? <Text style={styles.footnote}>Puxe a tela para baixo para atualizar.</Text> : null}
        </Screen>
    )
}

const styles = StyleSheet.create({
    divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
    footnote: { fontSize: 12, color: colors.ink3, textAlign: "center" },
})
