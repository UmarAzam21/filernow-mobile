import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui/primary-button";
import { images } from "@/constants/images";
import { FloatingChip } from "@/features/welcome/components/floating-chip";

// the phone in the poster sits ~34.5% down; chips float beside it
const CHIPS_TOP_RATIO = 0.345;

const CHIPS = [
    { label: "Hisaab", variant: "light", className: "" },
    { label: "Bachat", variant: "light", className: "mr-4" },
    { label: "Taraqqi", variant: "accent", className: "mr-1" },
] as const;

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const chipsTop = insets.top + (height - insets.top) * CHIPS_TOP_RATIO;

    return (
        <View className="flex-1 bg-page-bg">
            <StatusBar style="dark" />

            <Image
                source={images.welcomePoster}
                contentFit="cover"
                contentPosition="top"
                accessibilityLabel="Welcome animation"
                style={{ position: "absolute", top: insets.top, left: 0, right: 0, bottom: 0 }}
            />

            <View
                pointerEvents="none"
                style={{ position: "absolute", top: chipsTop, right: 16 }}
                className="items-end gap-2">
                {CHIPS.map((chip) => (
                    <FloatingChip key={chip.label} {...chip} />
                ))}
            </View>

            <SafeAreaView edges={["bottom"]} className="absolute inset-0 justify-end">
                <View className="px-6 pb-3 pt-5">
                    <PrimaryButton label="Get Started" onPress={() => router.push("/language")} />

                    <Pressable
                        accessibilityRole="button"
                        // TODO: router.push("/login")
                        className="mt-3 min-h-12 items-center justify-center">
                        <Text className="font-jakarta-semibold text-sm text-text-dark">
                            Already have an account?{" "}
                            <Text className="font-jakarta-bold text-primary underline">Log in</Text>
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}