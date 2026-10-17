// nativeApp\src\features\welcome\components\floating-chip.tsx

import { SymbolView } from "expo-symbols";
import { Text, View } from "react-native";

import { cn } from "@/lib/cn";

type Props = { label: string; variant: "light" | "accent"; className?: string };

export function FloatingChip({ label, variant, className }: Props) {
    const accent = variant === "accent";
    return (
        <View
            className={cn(
                "flex-row items-center rounded-full px-3 py-1.5 shadow-md",
                accent ? "bg-primary shadow-black/20" : "bg-white/85 shadow-black/10",
                className,
            )}>
            {accent ? null : <View className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />}
            <Text
                className={cn(
                    "text-xs",
                    accent ? "mr-1.5 font-jakarta-bold text-white" : "font-jakarta-semibold text-text-dark",
                )}>
                {label}
            </Text>
            {accent ? (
                <SymbolView
                    name={{ ios: "arrow.up.right", android: "north_east", web: "north_east" }}
                    tintColor="#FFFFFF"
                    size={12}
                />
            ) : null}
        </View>
    );
}