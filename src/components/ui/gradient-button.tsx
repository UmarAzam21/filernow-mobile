// nativeApp\src\components\ui\gradient-button.tsx

import type { LucideIcon } from "lucide-react-native";
import { Pressable, type PressableProps, Text, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

import { GradientFill, PRIMARY_GRADIENT } from "./gradient-fill";

type Props = Omit<PressableProps, "children"> & {
    label: string;
    icon?: LucideIcon;
    className?: string;
};

/** Full-width red gradient CTA with a soft glow, e.g. "Create Business" in sheets. */
export function GradientButton({ label, icon: Icon, className, disabled, ...rest }: Props) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!disabled }}
            disabled={disabled}
            className={cn("active:opacity-80", disabled && "opacity-50", className)}
            style={{
                shadowColor: colors.primary,
                shadowOpacity: disabled ? 0 : 0.3,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                elevation: disabled ? 0 : 6,
            }}
            {...rest}>
            <View className="h-[58px] flex-row items-center justify-center gap-2 overflow-hidden rounded-[26px]">
                <GradientFill colors={PRIMARY_GRADIENT} direction="horizontal" />
                {Icon ? <Icon size={22} color="#fff" strokeWidth={2.6} /> : null}
                <Text className="font-jakarta-extrabold text-white" style={{ fontSize: 18 }}>
                    {label}
                </Text>
            </View>
        </Pressable>
    );
}
