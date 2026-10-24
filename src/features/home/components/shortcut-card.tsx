import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { cardShadow } from "@/features/home/components/section-card";
import type { ShortcutItem } from "@/features/home/data/services";
import { colors } from "@/theme/tokens";

type Props = { item: ShortcutItem; onPress: () => void };

/** Half-width card (2 per row): icon + chevron on top, then title and description. */
export function ShortcutCard({ item, onPress }: Props) {
    const Icon = item.icon;

    return (
      <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={item.title}
    accessibilityHint={item.description}
    style={[cardShadow, { width: "48%" }]}
    className="gap-brand-12 rounded-brand-16 border border-border-clr bg-white p-brand-12 active:opacity-80"
>
            <View className="flex-row items-center justify-between">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-tint">
                    <Icon size={20} color={colors.primary} strokeWidth={2} />
                </View>

                <View className="h-7 w-7 items-center justify-center rounded-full border border-border-clr bg-white">
                    <ChevronRight size={16} color={colors["text-dark"]} strokeWidth={2.2} />
                </View>
            </View>

            <View>
                <Text numberOfLines={1} className="font-jakarta-semibold text-heading-h6 text-text-dark">
                    {item.title}
                </Text>
                <Text numberOfLines={2} className="mt-0.5 font-jakarta text-para-tiny text-text-secondary">
                    {item.description}
                </Text>
            </View>
        </Pressable>
    );
}