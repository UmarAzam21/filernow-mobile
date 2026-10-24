// nativeApp\src\features\home\components\khata-shortcuts.tsx

import type { Href } from "expo-router";
import { Image, type ImageSource } from "expo-image";
import { Pressable, View } from "react-native";

import { images } from "@/constants/images";
import { cardShadow } from "@/features/home/components/section-card";
import { useOpenService } from "@/features/home/hooks/use-open-service";

type FeatureCard = { id: string; title: string; image: ImageSource; href?: Href };

const FEATURE_CARDS: FeatureCard[] = [
    { id: "expense-manager", title: "Expense Manager", image: images.cardExpenseManager, href: "/khata/daily" },
    { id: "under-18", title: "Under 18", image: images.cardUnder18, href: "/khata" },
];

const CARD_ASPECT = 905 / 775; // assets/images/banners/card-* artwork size

/** Two illustrated feature cards side by side; each opens its feature on tap. */
export function KhataShortcuts() {
    const openService = useOpenService();

    return (
        <View className="flex-row justify-between">
            {FEATURE_CARDS.map((card) => (
                <Pressable
                    key={card.id}
                    onPress={() => openService(card.title, card.href)}
                    accessibilityRole="button"
                    accessibilityLabel={card.title}
                    style={[cardShadow, { width: "48.5%" }]}
                    className="overflow-hidden rounded-brand-16 active:opacity-80"
                >
                    <Image source={card.image} contentFit="cover" style={{ width: "100%", aspectRatio: CARD_ASPECT }} />
                </Pressable>
            ))}
        </View>
    );
}
