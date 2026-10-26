// nativeApp\src\features\more\components\more-tile.tsx

import { Image } from "expo-image";
import { Pressable, Text } from "react-native";

import { type EmIconName, emIcons } from "@/constants/expense-manager-icons";

import { cardShadow } from "./more-card";

type Props = { icon: EmIconName; label: string; onPress: () => void };

/** White square shortcut tile (Expense Card / Recycle Bin / Calculator). */
export function MoreTile({ icon, label, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            className="flex-1 items-center justify-center gap-2 rounded-[20px] bg-white px-2 active:opacity-80"
            style={[cardShadow, { height: 100 }]}>
            <Image source={emIcons[icon]} contentFit="contain" style={{ width: 42, height: 42 }} />
            <Text
                numberOfLines={2}
                className="text-center font-jakarta-medium  tracking-wide text-text-dark"
                style={{ fontSize: 13, lineHeight: 16 }}>
                {label}
            </Text>
        </Pressable>
    );
}
