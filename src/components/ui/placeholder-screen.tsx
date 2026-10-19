// nativeApp\src\components\ui\placeholder-screen.tsx

import { Stack } from "expo-router";
import { Text, View } from "react-native";

type Props = { title: string; note?: string; headerTitle?: string };

export function PlaceholderScreen({ title, note = "Coming in the next slice.", headerTitle }: Props) {
    return (
        <View className="flex-1 items-center justify-center bg-page-bg px-8">
            {headerTitle ? <Stack.Screen options={{ title: headerTitle }} /> : null}
            <Text className="font-jakarta-bold text-lg text-text-dark">{title}</Text>
            <Text className="mt-2 text-center font-jakarta text-sm text-text-secondary">{note}</Text>
        </View>
    );
}