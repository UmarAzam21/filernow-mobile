// nativeApp\src\features\notifications\components\notification-card.tsx

import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import type { INotification } from "@/features/notifications/data/notifications";
import { NOTIFICATION_LOOK } from "@/features/notifications/lib/notification-look";
import { timeAgo } from "@/features/notifications/lib/time-ago";
import { cn } from "@/lib/cn";

type Props = { item: INotification; onPress: (id: string) => void; onLongPress?: (id: string) => void };

/**
 * One compact notification row: a coloured icon for what happened, the title with its time on the
 * right, and up to two lines of detail. Unread rows are white with a bold title and a red dot;
 * read ones sink back into a muted grey.
 */
export function NotificationCard({ item, onPress, onLongPress }: Props) {
    const { t } = useTranslation("notifications");
    const unread = !item.read;
    // the server sends title/body already in the user's language
    const { title, body } = item;
    const { image, tint } = NOTIFICATION_LOOK[item.look] ?? NOTIFICATION_LOOK.system;

    return (
        <Pressable
            onPress={() => onPress(item.id)}
            onLongPress={onLongPress ? () => onLongPress(item.id) : undefined}
            accessibilityHint={onLongPress ? t("deleteHint") : undefined}
            accessibilityRole="button"
            accessibilityLabel={t(unread ? "unreadA11y" : "readA11y", { title, body })}
            className={cn(
                "flex-row items-start gap-3 rounded-[18px] border px-3 py-3 active:opacity-80",
                unread ? "border-[#F3D3D9] bg-white" : "border-transparent bg-[#F7F5F4]",
            )}>
            <View
                className="h-10 w-10 items-center justify-center rounded-[12px]"
                style={{ backgroundColor: tint, opacity: unread ? 1 : 0.75 }}>
                <Image source={image} contentFit="contain" style={{ width: 26, height: 26 }} />
            </View>

            <View className="flex-1">
                <View className="flex-row items-center gap-2">
                    <Text
                        numberOfLines={1}
                        className={cn(
                            "flex-1",
                            unread ? "font-jakarta-bold text-text-dark" : "font-jakarta-semibold text-[#4A4447]",
                        )}
                        style={{ fontSize: 14.5, lineHeight: 20 }}>
                        {title}
                    </Text>
                    <Text className="font-jakarta-medium text-[#A39B9E]" style={{ fontSize: 11.5, lineHeight: 16 }}>
                        {timeAgo(item.createdAt)}
                    </Text>
                    {unread ? <View className="h-2 w-2 rounded-full bg-primary" /> : null}
                </View>
                <Text
                    numberOfLines={2}
                    className={cn("mt-0.5 font-jakarta", unread ? "text-[#5E575A]" : "text-[#8A8285]")}
                    style={{ fontSize: 13, lineHeight: 18 }}>
                    {body}
                </Text>
            </View>
        </Pressable>
    );
}
