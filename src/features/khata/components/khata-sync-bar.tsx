// nativeApp\src\features\khata\components\khata-sync-bar.tsx

import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useBusinessStore } from "@/features/business/store/business-store";
import { EMPTY_REMOTE, useKhataStore } from "@/features/khata/store/khata-store";
import { colors } from "@/theme/tokens";

/**
 * Refreshes the active business from the server whenever a Khata screen comes into view, and
 * shows a slim status line: loading the first time, or an error with retry (cached data stays).
 */
export function KhataSyncBar() {
    const { t } = useTranslation("khata");
    const sync = useKhataStore((s) => s.sync);
    const syncing = useKhataStore((s) => s.syncing);
    const error = useKhataStore((s) => s.syncError);
    const businessId = useBusinessStore((s) => s.activeId);
    const syncedAt = useKhataStore((s) => (s.remote[businessId] ?? EMPTY_REMOTE).syncedAt);

    useFocusEffect(
        useCallback(() => {
            sync();
        }, [sync]),
    );

    if (syncing && !syncedAt) {
        return (
            <View className="mx-4 mt-4 flex-row items-center gap-2 rounded-brand-12 border border-border-clr bg-white px-3 py-2.5">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text className="font-jakarta-medium text-xs text-text-secondary">{t("sync.loading")}</Text>
            </View>
        );
    }
    if (!error) return null;

    return (
        <View className="mx-4 mt-4 flex-row items-center justify-between gap-3 rounded-brand-12 border border-[#F1B9C4] bg-[#FFF5F6] px-3 py-2.5">
            <Text className="flex-1 font-jakarta-medium text-xs text-text-secondary">
                {syncedAt ? t("sync.offline") : error}
            </Text>
            <Pressable
                accessibilityRole="button"
                onPress={sync}
                disabled={syncing}
                className="min-h-10 justify-center rounded-brand-8 border border-border-clr bg-white px-3 active:bg-page-bg">
                {syncing ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                    <Text className="font-jakarta-semibold text-xs text-primary">{t("sync.retry")}</Text>
                )}
            </Pressable>
        </View>
    );
}
