// nativeApp\src\features\quick-menu\components\quick-action-tile.tsx

import { Image } from "expo-image";
import { Crown, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { GradientFill, PRIMARY_GRADIENT } from "@/components/ui/gradient-fill";
import { serviceIcons } from "@/constants/service-icons";
import type { QuickAction } from "@/features/quick-menu/data/quick-menu";
import { colors } from "@/theme/tokens";

const ICON = 44;

function AddIcon() {
    return (
        <View
            className="rounded-brand-12 bg-primary"
            style={{
                width: ICON - 4,
                height: ICON - 4,
                shadowColor: colors.primary,
                shadowOpacity: 0.3,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
            }}>
            <View className="flex-1 items-center justify-center overflow-hidden rounded-brand-12">
                <GradientFill colors={PRIMARY_GRADIENT} />
                <Plus size={26} color="#fff" strokeWidth={3.2} />
            </View>
        </View>
    );
}

/** Square grey tile with an illustrated icon and a two-line label. */
export function QuickActionTile({ item, onPress }: { item: QuickAction; onPress: (item: QuickAction) => void }) {
    return (
        <Pressable
            onPress={() => onPress(item)}
            accessibilityRole="button"
            accessibilityLabel={item.premium ? `${item.label}, premium` : item.label}
            className="h-[104px] items-center justify-center gap-1.5 rounded-brand-24 border border-[#ECE7E5] bg-[#F7F5F4] px-1 active:opacity-80">
            <View className="items-center justify-center" style={{ width: ICON, height: ICON }}>
                {item.icon === "add" ? (
                    <AddIcon />
                ) : (
                    <Image source={serviceIcons[item.icon]} contentFit="contain" style={{ width: ICON, height: ICON }} />
                )}
            </View>
            <Text
                numberOfLines={2}
                className="text-center font-jakarta text-[#2B2B2B]"
                style={{ fontSize: 13, lineHeight: 16 }}>
                {item.label}
            </Text>

            {item.premium ? (
                <View className="absolute right-2.5 top-2.5">
                    <Crown size={13} color={colors["accent-gold"]} fill="#F7B733" strokeWidth={2} />
                </View>
            ) : null}
        </Pressable>
    );
}
