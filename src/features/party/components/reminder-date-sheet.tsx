// nativeApp\src\features\party\components\reminder-date-sheet.tsx

import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { DateTimeField } from "@/components/ui/date-time-field";
import { Field, FormButton } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { formatDateTime, localDate } from "@/lib/date-format";

const addDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return localDate(d);
};

type Props = {
    visible: boolean;
    name: string;
    current?: string;
    onSave: (date: string) => void;
    onClear?: () => void;
    onClose: () => void;
};

export function ReminderDateSheet({ visible, name, current, onSave, onClear, onClose }: Props) {
    const [sel, setSel] = useState("");

    useEffect(() => {
        if (visible) setSel(current ?? "");
    }, [visible, current]);

    const options = [
        { label: "Agle hafte", date: addDays(7) },
        { label: "Agle mahine", date: addDays(30) },
    ];

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="Reminder Date"
            subtitle={`${name} se wapsi ki tareekh yaad rakhein`}
            footer={
                <FormButton
                    label="Date Save Karein"
                    disabled={!sel}
                    onPress={() => {
                        onSave(sel);
                        onClose();
                    }}
                />
            }>
            <View className="mb-4 gap-2">
                {options.map((o) => {
                    const active = sel === o.date;
                    return (
                        <Pressable
                            key={o.label}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: active }}
                            onPress={() => setSel(o.date)}
                            className={cn(
                                "min-h-12 flex-row items-center justify-between rounded-brand-8 border px-3",
                                active ? "border-primary bg-primary-tint" : "border-border-clr bg-page-bg",
                            )}>
                            <Text className="font-jakarta-medium text-sm text-text-dark">{o.label}</Text>
                            <Text className="font-jakarta text-xs text-text-secondary-muted">{formatDateTime(o.date)}</Text>
                        </Pressable>
                    );
                })}
            </View>

            <Field label="Ya apni tareekh chunein">
                <DateTimeField mode="date" value={sel} min={localDate()} onChange={setSel} />
            </Field>

            {current && onClear ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                        onClear();
                        onClose();
                    }}
                    className="mb-2 min-h-11 items-center justify-center">
                    <Text className="font-jakarta-semibold text-xs text-text-secondary-muted">Date hatayein</Text>
                </Pressable>
            ) : null}
        </BottomSheet>
    );
}