// nativeApp\src\features\party\components\party-balance-card.tsx

import { Text, View } from "react-native";

import { pkr } from "@/features/khata/lib/debt";
import { cn } from "@/lib/cn";

type Props = { balance: number; gave: number; got: number; count: number };

export function PartyBalanceCard({ balance, gave, got, count }: Props) {
    const t =
        balance > 0
            ? { box: "border-danger/25 bg-danger-bg", val: "text-danger", label: "You will get", sub: "Is party se aap ko paise milenge" }
            : balance < 0
                ? { box: "border-success/25 bg-success-bg", val: "text-success", label: "You will give", sub: "Aap ko is party ko paise dene hain" }
                : { box: "border-border-clr bg-white", val: "text-text-secondary", label: "Settled up", sub: "Hisaab barabar hai" };

    return (
        <View className={cn("overflow-hidden rounded-brand-12 border", t.box)}>
            <View className="p-3">
                <Text className="font-jakarta-semibold text-[11px] uppercase tracking-wide text-text-secondary-muted">{t.label}</Text>
                <Text className={cn("font-jakarta-extrabold text-xl", t.val)}>{pkr(Math.abs(balance))}</Text>
                <Text className="font-jakarta text-xs text-text-secondary-muter">{t.sub}</Text>
            </View>
            <View className="flex-row border-t border-border-clr bg-white/70">
                <Stat label="Total You Gave" value={pkr(gave)} tone="text-danger" />
                <Stat label="Total You Got" value={pkr(got)} tone="text-success" />
                <Stat label="Entries" value={String(count)} tone="text-text-dark" last />
            </View>
        </View>
    );
}

function Stat({ label, value, tone, last }: { label: string; value: string; tone: string; last?: boolean }) {
    return (
        <View className={cn("flex-1 items-center py-2", !last && "border-r border-border-clr")}>
            <Text className="font-jakarta text-[11px] text-text-secondary-muted">{label}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit className={cn("px-1 font-jakarta-bold text-xs", tone)}>
                {value}
            </Text>
        </View>
    );
}