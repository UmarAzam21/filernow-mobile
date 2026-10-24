// nativeApp\src\features\party\components\bulk-party-sheet.tsx

import * as DocumentPicker from "expo-document-picker";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Field, FormButton } from "@/components/ui/form";
import type { IParty, NewParty, PartyType } from "@/features/khata/expenseManagerTy";
import { PartyTypeToggle } from "@/features/party/components/party-type-toggle";
import { type BulkRow, parseBulkParties } from "@/features/party/lib/party-bulk";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/tokens";

const STATUS: Record<BulkRow["status"], { icon: SymbolViewProps["name"]; color: string }> = {
    ok: { icon: { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }, color: colors.success },
    duplicate: { icon: { ios: "exclamationmark.triangle.fill", android: "warning", web: "warning" }, color: colors.warning },
    error: { icon: { ios: "xmark.circle.fill", android: "cancel", web: "cancel" }, color: colors.danger },
};
const PREVIEW_LIMIT = 50;

type Props = {
    visible: boolean;
    existing: IParty[];
    defaultType?: PartyType;
    onClose: () => void;
    onImport: (rows: NewParty[]) => void;
};

export function BulkPartySheet({ visible, existing, defaultType = "customer", onClose, onImport }: Props) {
    const [text, setText] = useState("");
    const [type, setType] = useState<PartyType>(defaultType);

    useEffect(() => {
        if (visible) {
            setText("");
            setType(defaultType);
        }
    }, [visible, defaultType]);

    const rows = useMemo(() => parseBulkParties(text, existing), [text, existing]);
    const ok = rows.filter((r) => r.status === "ok");
    const dups = rows.filter((r) => r.status === "duplicate").length;
    const errs = rows.filter((r) => r.status === "error").length;

    const pickFile = async () => {
        const res = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
        if (res.canceled) return;
        const asset = res.assets[0];
        if (!/\.(csv|txt)$/i.test(asset.name)) {
            toast.error("Abhi sirf CSV ya TXT file chal sakti hai");
            return;
        }
        try {
            setText(await (await fetch(asset.uri)).text());
        } catch {
            toast.error("File parhi nahi ja saki");
        }
    };

    const run = () => {
        onImport(ok.map((r) => ({ name: r.name, phone: r.phone, type: r.type ?? type })));
        onClose();
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="Bulk Party Add"
            subtitle="Ek saath kai parties add karein"
            footer={
                <FormButton
                    label={ok.length ? `${ok.length} parties import karein` : "Pehle list likhein ya file upload karein"}
                    disabled={ok.length === 0}
                    onPress={run}
                />
            }>
            <Field label="Sab ki qism (jahan alag na likhi ho)">
                <PartyTypeToggle value={type} onChange={setType} />
            </Field>

            <Field label="Parties ki list" hint="Har line mein ek party: Naam, Phone, Qism. Phone aur qism optional hain.">
                <TextInput
                    value={text}
                    onChangeText={setText}
                    multiline
                    textAlignVertical="top"
                    autoCorrect={false}
                    autoCapitalize="none"
                    placeholder={"Ali Ashraf, 03001234567\nHassan Traders, 03211234567, supplier\nBilal Ahmed"}
                    placeholderTextColor={colors["text-secondary-muter"]}
                    className="min-h-[130px] rounded-brand-8 border border-border-clr bg-page-bg p-3 font-jakarta text-sm text-text-dark"
                />
            </Field>

            <Pressable
                accessibilityRole="button"
                onPress={pickFile}
                className="mb-4 min-h-11 flex-row items-center gap-2 self-start rounded-brand-8 border border-border-clr px-3 active:bg-page-bg">
                <SymbolView
                    name={{ ios: "square.and.arrow.up", android: "upload", web: "upload" }}
                    size={15}
                    tintColor={colors["text-secondary"]}
                />
                <Text className="font-jakarta-semibold text-xs text-text-secondary">CSV / TXT upload karein</Text>
            </Pressable>

            {rows.length > 0 ? (
                <View className="mb-4">
                    <Text className="mb-2 font-jakarta-semibold text-xs text-text-dark">
                        <Text className="text-success">{ok.length} tayyar</Text>
                        {dups > 0 ? <Text className="text-warning"> · {dups} duplicate (skip honge)</Text> : null}
                        {errs > 0 ? <Text className="text-danger"> · {errs} ghalat (skip honge)</Text> : null}
                    </Text>
                    <View className="rounded-brand-8 border border-border-clr">
                        {rows.slice(0, PREVIEW_LIMIT).map((r) => (
                            <View
                                key={r.line}
                                className="flex-row items-center gap-2 border-b border-border-clr px-3 py-2 last:border-b-0">
                                <SymbolView name={STATUS[r.status].icon} size={15} tintColor={STATUS[r.status].color} />
                                <View className="min-w-0 flex-1">
                                    <Text numberOfLines={1} className="font-jakarta-medium text-xs text-text-dark">
                                        {r.name || "(naam nahi)"} {r.phone ?? ""}
                                    </Text>
                                    {r.message ? (
                                        <Text numberOfLines={1} className="font-jakarta text-[11px] text-text-secondary-muted">
                                            {r.message}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        ))}
                        {rows.length > PREVIEW_LIMIT ? (
                            <Text className="p-2 text-center font-jakarta text-[11px] text-text-secondary-muted">
                                ...aur {rows.length - PREVIEW_LIMIT} lines
                            </Text>
                        ) : null}
                    </View>
                </View>
            ) : null}

            {/* <FormButton
                label={ok.length ? `${ok.length} parties import karein` : "Pehle list likhein ya file upload karein"}
                disabled={ok.length === 0}
                onPress={run}
            /> */}
        </BottomSheet>
    );
}