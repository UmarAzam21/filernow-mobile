// nativeApp\src\features\notifications\components\notification-card.tsx

import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { serviceIcons } from "@/constants/service-icons";
import type { INotification } from "@/features/notifications/data/notifications";
import { timeAgo } from "@/features/notifications/lib/time-ago";
import { cn } from "@/lib/cn";

type Props = { item: INotification; onPress: (id: string) => void };

/** One notification: icon tile, title, message, relative time; unread ones are pink with a red dot. */
export function NotificationCard({ item, onPress }: Props) {
    const unread = !item.read;

    return (
        <Pressable
            onPress={() => onPress(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`${unread ? "Unread. " : ""}${item.title}. ${item.body}`}
            className={cn(
                "flex-row gap-4 rounded-brand-24 border p-4 active:opacity-80",
                unread ? "border-[#F1B9C4] bg-[#FFF5F6]" : "border-[#ECE7E5] bg-[#F7F5F4]",
            )}>
            <View
                className="h-[60px] w-[60px] items-center justify-center rounded-[18px]"
                style={{ backgroundColor: item.tint }}>
                {"image" in item.icon ? (
                    <Image source={serviceIcons[item.icon.image]} contentFit="contain" style={{ width: 34, height: 34 }} />
                ) : (
                    <Text allowFontScaling={false} style={{ fontSize: 28, lineHeight: 34, includeFontPadding: false }}>
                        {item.icon.emoji}
                    </Text>
                )}
            </View>

            <View className="flex-1">
                <View className="flex-row items-start gap-2">
                    <Text className="flex-1 font-jakarta-semibold text-text-dark" style={{ fontSize: 16, lineHeight: 22 }}>
                        {item.title}
                    </Text>
                    {unread ? <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                </View>
                <Text className="mt-0.5 font-jakarta text-para-base text-[#6E6669]">{item.body}</Text>
                <Text className="mt-1.5 font-jakarta text-para-small text-[#A39B9E]">{timeAgo(item.createdAt)}</Text>
            </View>
        </Pressable>
    );
}
