// nativeApp\src\features\quick-menu\components\settings-row.tsx

import { ArrowUp, ChevronRight, Cloud, Settings } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export type SettingsIconName = "backup" | "lock" | "settings" | "help";

/** Small solid-colour glyphs matching the Quick Menu design. */
function SettingsIcon({ name }: { name: SettingsIconName }) {
    switch (name) {
        case "backup":
            return (
                <View className="items-center justify-center">
                    <Cloud size={30} color="#3B8DF0" fill="#3B8DF0" strokeWidth={1.5} />
                    <View className="absolute" style={{ top: 10 }}>
                        <ArrowUp size={12} color="#fff" strokeWidth={3.4} />
                    </View>
                </View>
            );
        case "lock":
            return (
                <Text allowFontScaling={false} style={{ fontSize: 24, lineHeight: 30, includeFontPadding: false }}>
                    🔒
                </Text>
            );
        case "settings":
            return (
                <View className="items-center justify-center">
                    <Settings size={28} color="#7C4DEB" fill="#7C4DEB" strokeWidth={2} />
                    <View className="absolute h-2.5 w-2.5 rounded-full bg-[#F7F5F4]" />
                </View>
            );
        case "help":
            return (
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#14B88A]">
                    <Text allowFontScaling={false} className="font-jakarta-extrabold text-white" style={{ fontSize: 16, lineHeight: 20 }}>
                        ?
                    </Text>
                </View>
            );
    }
}

type Props = {
    icon: SettingsIconName;
    label: string;
    onPress?: () => void;
    /** Replaces the chevron, e.g. a toggle switch. */
    right?: ReactNode;
};

/** Full-width settings card: icon, label, chevron (or a custom control). */
export function SettingsRow({ icon, label, onPress, right }: Props) {
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={right ? undefined : "button"}
            accessibilityLabel={label}
            className="h-[66px] flex-row items-center gap-4 rounded-brand-24 border border-[#ECE7E5] bg-[#F7F5F4] px-5 active:opacity-80">
            <View className="w-8 items-center">
                <SettingsIcon name={icon} />
            </View>
            <Text className="flex-1 font-jakarta text-text-dark" style={{ fontSize: 17 }}>
                {label}
            </Text>
            {right ?? <ChevronRight size={20} color="#8A8285" strokeWidth={2.2} />}
        </Pressable>
    );
}
