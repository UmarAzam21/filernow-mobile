// nativeApp\src\features\assistant\components\pending-actions-card.tsx

import { ArrowLeftRight, CreditCard, type LucideIcon, PencilLine, Plus, Tag, Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import type { PendingAction } from "../api/voice-api";

const ICON: Record<string, LucideIcon> = {
    add_entry: Plus,
    update_entry: PencilLine,
    delete_entry: Trash2,
    create_category: Tag,
    add_card: CreditCard,
    transfer: ArrowLeftRight,
};

type Props = { pending: PendingAction[]; busy: boolean; onRespond: (confirm: boolean) => void };

/**
 * What the assistant will do if the user agrees. Nothing changes until Confirm (or a spoken
 * "yes"); the user can also just say a correction ("no, make it 1500").
 */
export function PendingActionsCard({ pending, busy, onRespond }: Props) {
    const { t } = useTranslation();

    return (
        <Animated.View entering={FadeInDown.duration(320)} style={styles.card}>
            <Text style={styles.title}>{t("assistant.pending.title", { count: pending.length })}</Text>
            <View style={styles.list}>
                {pending.map((action, i) => {
                    const Icon = ICON[action.kind] ?? Plus;
                    const destructive = action.kind === "delete_entry";
                    return (
                        <View key={i} style={styles.row}>
                            <View style={[styles.iconTile, destructive && styles.iconTileDanger]}>
                                <Icon size={15} color="#fff" strokeWidth={2.4} />
                            </View>
                            <Text style={styles.description}>{action.description}</Text>
                        </View>
                    );
                })}
            </View>
            <Text style={styles.hint}>{t("assistant.pending.hint")}</Text>

            <View style={styles.actions}>
                <Pressable
                    onPress={() => onRespond(false)}
                    disabled={busy}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.btn, styles.btnGhost, (pressed || busy) && { opacity: 0.6 }]}>
                    <Text style={styles.btnText}>{t("assistant.pending.cancel")}</Text>
                </Pressable>
                <Pressable
                    onPress={() => onRespond(true)}
                    disabled={busy}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.btn, styles.btnPrimary, (pressed || busy) && { opacity: 0.7 }]}>
                    {busy ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>{t("assistant.pending.confirm")}</Text>
                    )}
                </Pressable>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 14,
        padding: 16,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    title: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "PlusJakartaSans_700Bold", letterSpacing: 0.3 },
    list: { marginTop: 10, gap: 10 },
    row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    iconTile: {
        width: 26,
        height: 26,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,92,112,0.55)",
    },
    iconTileDanger: { backgroundColor: "rgba(200,16,46,0.9)" },
    description: { flex: 1, color: "#fff", fontSize: 14, lineHeight: 20, fontFamily: "PlusJakartaSans_600SemiBold" },
    hint: { marginTop: 12, color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "PlusJakartaSans_500Medium" },
    actions: { flexDirection: "row", gap: 10, marginTop: 14 },
    btn: { flex: 1, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
    btnGhost: { backgroundColor: "rgba(255,255,255,0.12)" },
    btnPrimary: { backgroundColor: "#C8102E" },
    btnText: { color: "#fff", fontSize: 15, fontFamily: "PlusJakartaSans_700Bold" },
});
