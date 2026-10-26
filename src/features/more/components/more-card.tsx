// nativeApp\src\features\more\components\more-card.tsx

import type { ReactNode } from "react";
import { View } from "react-native";

import { cn } from "@/lib/cn";

export const cardShadow = {
    shadowColor: "#7A5C66",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
} as const;

/** White rounded card used for each group on the More screen. */
export function MoreCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <View className={cn("rounded-[20px] bg-white", className)} style={cardShadow}>
            <View className="overflow-hidden rounded-[28px]">{children}</View>
        </View>
    );
}

/** Hairline between rows inside a MoreCard. */
export function MoreDivider() {
    return <View className="h-px bg-[#EFEAEA]" />;
}
