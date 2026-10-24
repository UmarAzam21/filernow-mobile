// nativeApp\src\features\party\components\party-filter-sheet.tsx

import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

export type BalanceFilter = "all" | "get" | "give" | "settled";
export type SortBy = "recent" | "name" | "balance";

const BALANCE_FILTERS: { value: BalanceFilter; label: string }[] = [
    { value: "all", label: "Sab parties" },
    { value: "get", label: "You will get (aap ko milenge)" },
    { value: "give", label: "You will give (aap ko dene hain)" },
    { value: "settled", label: "Settled (hisaab barabar)" },
];
const SORTS: { value: SortBy; label: string }[] = [
    { value: "recent", label: "Recent activity" },
    { value: "name", label: "Naam (A-Z)" },
    { value: "balance", label: "Sab se bara balance" },
];

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={onPress}
            className="min-h-12 flex-row items-center justify-between border-b border-border-clr active:bg-page-bg">
            <Text className={cn("font-jakarta-medium text-sm", selected ? "text-primary" : "text-text-dark")}>{label}</Text>
            {selected ? (
                <SymbolView name={{ ios: "checkmark", android: "check", web: "check" }} size={16} tintColor={colors.primary} />
            ) : null}
        </Pressable>
    );
}

type Props = {
    visible: boolean;
    balanceFilter: BalanceFilter;
    sortBy: SortBy;
    onBalanceChange: (v: BalanceFilter) => void;
    onSortChange: (v: SortBy) => void;
    onReset: () => void;
    onClose: () => void;
};

export function PartyFilterSheet({ visible, balanceFilter, sortBy, onBalanceChange, onSortChange, onReset, onClose }: Props) {
    const active = balanceFilter !== "all" || sortBy !== "recent";
    return (
        <BottomSheet visible={visible} onClose={onClose} title="Filters">
            <Text className="mb-1 font-jakarta-semibold text-xs text-text-secondary-muted">Balance ke mutabiq</Text>
            {BALANCE_FILTERS.map((f) => (
                <Option key={f.value} label={f.label} selected={balanceFilter === f.value} onPress={() => onBalanceChange(f.value)} />
            ))}
            <Text className="mb-1 mt-4 font-jakarta-semibold text-xs text-text-secondary-muted">Tarteeb</Text>
            {SORTS.map((s) => (
                <Option key={s.value} label={s.label} selected={sortBy === s.value} onPress={() => onSortChange(s.value)} />
            ))}
            {active ? (
                <View className="mt-3 items-center">
                    <Pressable accessibilityRole="button" onPress={onReset} className="min-h-11 justify-center px-4">
                        <Text className="font-jakarta-bold text-sm text-primary">Filters reset karein</Text>
                    </Pressable>
                </View>
            ) : null}
        </BottomSheet>
    );
}