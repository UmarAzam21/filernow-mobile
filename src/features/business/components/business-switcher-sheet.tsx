// nativeApp\src\features\business\components\business-switcher-sheet.tsx

import { Plus } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientFill, PRIMARY_GRADIENT } from "@/components/ui/gradient-fill";
import { addBusiness, switchBusiness } from "@/features/auth/lib/session";
import { MAX_BUSINESSES } from "@/features/business/data/business-options";
import { useBusinessStore } from "@/features/business/store/business-store";
import { apiErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/tokens";

import { AddBusinessFields, useAddBusinessForm } from "./add-business-form";
import { BusinessRow } from "./business-row";

export type BusinessSheetMode = "switch" | "add";

type Props = {
    visible: boolean;
    mode: BusinessSheetMode;
    onModeChange: (mode: BusinessSheetMode) => void;
    onClose: () => void;
};

/** "Switch Business" list and "Add New Business" form, shown as two steps of one bottom sheet. */
export function BusinessSwitcherSheet({ visible, mode, onModeChange, onClose }: Props) {
    const { t } = useTranslation("business");
    const businesses = useBusinessStore((s) => s.businesses);
    const activeId = useBusinessStore((s) => s.activeId);
    const form = useAddBusinessForm();
    const [busy, setBusy] = useState(false);
    const atLimit = businesses.length >= MAX_BUSINESSES;

    const close = () => {
        form.reset();
        onClose();
    };

    // The server's active business scopes the token, so switching/adding go through the API.
    const select = async (id: string) => {
        if (busy) return;
        if (id === activeId) return close();
        setBusy(true);
        try {
            await switchBusiness(id);
            close();
        } catch (e) {
            toast.error(apiErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    const create = async () => {
        const name = form.values.name.trim().replace(/\s+/g, " ");
        if (!name || busy) return;
        if (businesses.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
            toast.error(t("exists", { name }));
            return;
        }
        if (atLimit) {
            toast.error(t("maxBusinesses", { count: MAX_BUSINESSES }));
            return;
        }
        setBusy(true);
        try {
            await addBusiness({ ...form.values, name });
            toast.success(t("created", { name }));
            close();
        } catch (e) {
            toast.error(apiErrorMessage(e));
        } finally {
            setBusy(false);
        }
    };

    if (mode === "add") {
        return (
            <BottomSheet
                visible={visible}
                onClose={close}
                title={t("addTitle")}
                subtitle={t("addSubtitle")}
                footer={
                    <GradientButton label={t("create")} icon={Plus} onPress={create} disabled={!form.canSubmit || busy} />
                }>
                <AddBusinessFields form={form} onSubmitEditing={create} />
            </BottomSheet>
        );
    }

    return (
        <BottomSheet
            visible={visible}
            onClose={close}
            title={t("switchTitle")}
            subtitle={t("switchSubtitle")}>
            <View className="gap-3">
                {businesses.map((b) => (
                    <BusinessRow key={b.id} business={b} selected={b.id === activeId} onPress={select} />
                ))}

                {atLimit ? (
                    <View
                        accessibilityRole="text"
                        className="h-[68px] items-center justify-center rounded-brand-24 border-[1.5px] border-dashed border-[#DCD6D4] bg-[#F7F5F4] px-4">
                        <Text className="font-jakarta-semibold text-para-base text-[#5F5A5C]">
                            {t("limitReached", { max: MAX_BUSINESSES })}
                        </Text>
                        <Text className="mt-0.5 font-jakarta text-para-tiny text-[#8A8285]">
                            {t("maxBusinesses", { count: MAX_BUSINESSES })}
                        </Text>
                    </View>
                ) : (
                    <Pressable
                        onPress={() => onModeChange("add")}
                        accessibilityRole="button"
                        accessibilityLabel={t("addA11y", { used: businesses.length, max: MAX_BUSINESSES })}
                        className="h-[68px] flex-row items-center justify-center gap-3 rounded-brand-24 border-[1.5px] border-dashed border-[#E8A0AE] bg-[#FFF6F7] active:opacity-80">
                        <View
                            className="h-9 w-9 rounded-brand-12 bg-primary"
                            style={{
                                shadowColor: colors.primary,
                                shadowOpacity: 0.3,
                                shadowRadius: 6,
                                shadowOffset: { width: 0, height: 3 },
                                elevation: 3,
                            }}>
                            <View className="flex-1 items-center justify-center overflow-hidden rounded-brand-12">
                                <GradientFill colors={PRIMARY_GRADIENT} />
                                <Plus size={20} color="#fff" strokeWidth={3} />
                            </View>
                        </View>
                        <Text className="font-jakarta-extrabold text-primary" style={{ fontSize: 17 }}>
                            {t("addBusiness")}
                        </Text>
                        <Text className="font-jakarta-medium text-para-small text-[#C77A88]">
                            {businesses.length}/{MAX_BUSINESSES}
                        </Text>
                    </Pressable>
                )}
            </View>
        </BottomSheet>
    );
}
