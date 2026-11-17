// nativeApp\src\features\auth\components\link-email-card.tsx

import { ChevronRight, Mail } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

import { useAuthStore } from "../store/auth-store";
import { LinkEmailSheet } from "./link-email-sheet";

/** Dashboard prompt shown until the account has an email (from login/register or GET /me). */
export function LinkEmailCard() {
    const { t } = useTranslation("auth");
    // account is null until the session is known; only prompt when we know there's no email
    const needsEmail = useAuthStore((s) => s.account !== null && !s.account.email);
    const [open, setOpen] = useState(false);

    if (!needsEmail && !open) return null;

    return (
        <>
            {needsEmail ? (
                <Pressable
                    onPress={() => setOpen(true)}
                    accessibilityRole="button"
                    accessibilityHint={t("linkEmail.body")}
                    className="flex-row items-center gap-3 rounded-brand-12 border border-[#F1B9C4] bg-[#FFF5F6] p-brand-12 active:opacity-80">
                    <View className="h-11 w-11 items-center justify-center rounded-brand-12 bg-white">
                        <Mail size={22} color={colors.primary} strokeWidth={2.2} />
                    </View>
                    <View className="flex-1">
                        <Text className="font-jakarta-bold text-text-dark" style={{ fontSize: 15 }}>
                            {t("linkEmail.title")}
                        </Text>
                        <Text className="mt-0.5 font-jakarta text-para-small text-[#6E6669]">{t("linkEmail.body")}</Text>
                    </View>
                    <ChevronRight size={20} color={colors.primary} strokeWidth={2.4} />
                </Pressable>
            ) : null}
            <LinkEmailSheet visible={open} onClose={() => setOpen(false)} />
        </>
    );
}
