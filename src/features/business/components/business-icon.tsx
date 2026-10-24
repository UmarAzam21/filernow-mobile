// nativeApp\src\features\business\components\business-icon.tsx

import { Image } from "expo-image";
import { Text } from "react-native";

import { serviceIcons } from "@/constants/service-icons";
import { BUSINESS_TYPES, type BusinessType } from "@/features/business/data/business-options";

type Props = { type: BusinessType; size?: number };

/** Glyph for a business type: wallet illustration for Personal, emoji for the rest. */
export function BusinessIcon({ type, size = 24 }: Props) {
    const emoji = BUSINESS_TYPES[type].emoji;

    if (!emoji) {
        return <Image source={serviceIcons.expenses} contentFit="contain" style={{ width: size, height: size }} />;
    }

    return (
        <Text
            allowFontScaling={false}
            style={{ fontSize: size * 0.82, lineHeight: size, width: size, textAlign: "center", includeFontPadding: false }}>
            {emoji}
        </Text>
    );
}
