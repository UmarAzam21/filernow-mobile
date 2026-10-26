// nativeApp\src\components\ui\date-time-field.tsx

import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { cn } from "@/lib/cn";
import { localDate, localTime } from "@/lib/date-format";
import { colors } from "@/theme/tokens";

type Props = {
    mode: "date" | "time";
    /** "YYYY-MM-DD" in date mode, "HH:mm" in time mode. Empty string = nothing chosen. */
    value: string;
    onChange: (value: string) => void;
    /** Earliest selectable day ("YYYY-MM-DD"), date mode only. */
    min?: string;
    placeholder?: string;
};

const CAL: SymbolViewProps["name"] = { ios: "calendar", android: "calendar_today", web: "calendar_today" };
const CLOCK: SymbolViewProps["name"] = { ios: "clock", android: "schedule", web: "schedule" };
const p2 = (n: number) => String(n).padStart(2, "0");

function toDate(mode: Props["mode"], value: string) {
    const d = new Date();
    if (mode === "date") {
        const [y, m, day] = value.split("-").map(Number);
        if (y && m && day) d.setFullYear(y, m - 1, day);
        d.setHours(0, 0, 0, 0);
    } else {
        const [h, min] = value.split(":").map(Number);
        if (!Number.isNaN(h) && !Number.isNaN(min)) d.setHours(h, min, 0, 0);
    }
    return d;
}

function label(mode: Props["mode"], value: string) {
    if (mode === "date") {
        return toDate("date", value).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
    }
    const [h, m] = value.split(":").map(Number);
    return `${p2(h % 12 || 12)}:${p2(m)} ${h >= 12 ? "PM" : "AM"}`;
}

export function DateTimeField({ mode, value, onChange, min, placeholder = "Chunein" }: Props) {
    const [iosOpen, setIosOpen] = useState(false);
    const date = toDate(mode, value);
    const minimumDate = min ? toDate("date", min) : undefined;

    const handle = (e: DateTimePickerEvent, picked?: Date) => {
        if (e.type !== "set" || !picked) return;
        onChange(mode === "date" ? localDate(picked) : localTime(picked));
    };

    const press = () => {
        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({ value: date, mode, is24Hour: false, minimumDate, onChange: handle });
        } else {
            setIosOpen((o) => !o);
        }
    };

    return (
        <View>
            <Pressable
                accessibilityRole="button"
                onPress={press}
                className="h-12 flex-row items-center gap-2 rounded-brand-8 border border-border-clr bg-page-bg px-3 active:opacity-80">
                <SymbolView name={mode === "date" ? CAL : CLOCK} size={16} tintColor={colors["text-secondary-muted"]} />
                <Text className={cn("flex-1 font-jakarta text-sm", value ? "text-text-dark" : "text-text-secondary-muter")}>
                    {value ? label(mode, value) : placeholder}
                </Text>
            </Pressable>
            {Platform.OS === "ios" && iosOpen ? (
                <DateTimePicker
                    value={date}
                    mode={mode}
                    display={mode === "date" ? "inline" : "spinner"}
                    minimumDate={minimumDate}
                    accentColor={colors.primary}
                    onChange={handle}
                />
            ) : null}
        </View>
    );
}