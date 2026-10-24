// nativeApp\src\components\header\header-icon-button.tsx

import type { LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { colors } from "@/theme/tokens";

type Props = {
    icon: LucideIcon;
    label: string;
    onPress?: () => void;
    color?: string;
    /** Ring-style dot on the top-right corner, e.g. unread notifications. */
    badge?: boolean;
    /** Fill the icon instead of drawing only its outline. */
    filled?: boolean;
    /** Button edge length in px; the icon scales with it. */
    size?: number;
};

/** Soft rounded-square button used across the app header. */
export function HeaderIconButton({ icon: Icon, label, onPress, color = colors.primary, badge = false, filled = false, size = 48 }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={4}
            className="items-center justify-center rounded-brand-12 border border-primary-lighter bg-primary-tint active:opacity-70"
            style={{
                width: size,
                height: size,
                shadowColor: colors.primary,
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
            }}>
            <Icon size={Math.round(size * 0.46)} color={color} fill={filled ? color : "none"} strokeWidth={2.4} />
            {badge ? (
                <View className="absolute right-1 top-1 h-3 w-3 items-center justify-center rounded-full bg-primary">
                    <View className="h-1.5 w-1.5 rounded-full bg-white" />
                </View>
            ) : null}
        </Pressable>
    );
}
