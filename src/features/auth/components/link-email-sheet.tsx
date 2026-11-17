// nativeApp\src\features\auth\components\link-email-sheet.tsx

import { Mail } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { GradientButton } from "@/components/ui/gradient-button";
import { ApiError, apiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/tokens";

import { linkEmail } from "../lib/session";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Props = { visible: boolean; onClose: () => void };

/** Bottom sheet to add the account email (PUT /expenses/auth/email). */
export function LinkEmailSheet({ visible, onClose }: Props) {
    const { t } = useTranslation("auth");
    const [email, setEmail] = useState("");
    const [focused, setFocused] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const valid = EMAIL.test(email.trim());

    const close = () => {
        setEmail("");
        setError(null);
        onClose();
    };

    const save = async () => {
        if (!valid || saving) return;
        setSaving(true);
        setError(null);
        try {
            await linkEmail(email);
            toast.success(t("linkEmail.saved"));
            close();
        } catch (e) {
            // 409 = used by another account (readable detail); 422 = the server rejected the format
            setError(e instanceof ApiError && e.status === 422 ? t("linkEmail.invalid") : apiErrorMessage(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={close}
            title={t("linkEmail.sheetTitle")}
            subtitle={t("linkEmail.sheetSubtitle")}
            footer={<GradientButton label={t("linkEmail.save")} icon={Mail} onPress={save} disabled={!valid || saving} />}>
            <Text className="mb-2 ml-1 font-jakarta-medium text-para-base text-[#5F5A5C]">{t("linkEmail.label")}</Text>
            <View className={cn("rounded-[22px] p-1", focused ? "bg-[#FDE9ED]" : "bg-transparent")}>
                <TextInput
                    value={email}
                    onChangeText={(v) => {
                        setEmail(v);
                        setError(null);
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onSubmitEditing={save}
                    placeholder={t("linkEmail.placeholder")}
                    placeholderTextColor="#A9A1A4"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="done"
                    selectionColor={colors.primary}
                    cursorColor={colors.primary}
                    accessibilityLabel={t("linkEmail.label")}
                    className={cn(
                        "h-14 rounded-[18px] border bg-white px-5 font-jakarta text-text-dark",
                        error ? "border-red-500" : focused ? "border-[#E0566E]" : "border-[#E6E0DE]",
                    )}
                    style={{ fontSize: 17, writingDirection: "ltr" }}
                />
            </View>
            {error ? <Text className="ml-1 mt-2 font-jakarta-medium text-[13px] text-red-500">{error}</Text> : null}
        </BottomSheet>
    );
}
