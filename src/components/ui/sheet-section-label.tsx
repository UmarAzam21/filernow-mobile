// nativeApp\src\components\ui\sheet-section-label.tsx

import { Text } from "react-native";

import { cn } from "@/lib/cn";

/** Small grey caps heading inside sheets, e.g. "QUICK ACTIONS", "TODAY". */
export function SheetSectionLabel({ children, className }: { children: string; className?: string }) {
    return (
        <Text
            accessibilityRole="header"
            className={cn("mb-2.5 ml-1 font-jakarta-extrabold text-[13px] uppercase tracking-widest text-[#9A9496]", className)}>
            {children}
        </Text>
    );
}
