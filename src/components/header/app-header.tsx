// nativeApp\src\components\header\app-header.tsx

import { Bell, Crown, LayoutGrid } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BusinessSwitcher } from "@/features/business/components/business-switcher";
import { NotificationsSheet } from "@/features/notifications/components/notifications-sheet";
import { useUnreadCount } from "@/features/notifications/store/notifications-store";
import { QuickMenuSheet } from "@/features/quick-menu/components/quick-menu-sheet";
import { colors } from "@/theme/tokens";

import { HeaderIconButton } from "./header-icon-button";

type Props = {
    onPremiumPress?: () => void;
};

type Sheet = "notifications" | "apps" | null;

/** Top bar shared by the tab screens: active business switcher, premium, notifications sheet, quick menu sheet. */
export function AppHeader({ onPremiumPress }: Props) {
    const insets = useSafeAreaInsets();
    const unread = useUnreadCount();
    const [sheet, setSheet] = useState<Sheet>(null);
    const closeSheet = () => setSheet(null);

    return (
        <View className="border-b border-border-clr bg-page-bg" style={{ paddingTop: insets.top }}>
            <View className="h-14 flex-row items-center px-brand">
                {/* Left: active business */}
                <View className="flex-1 items-start">
                    <BusinessSwitcher />
                </View>

                {/* Center: wordmark */}
                {/* <Text
                    accessibilityRole="header"
                    className="font-wordmark text-text-dark"
                    style={{ fontSize: 26, lineHeight: 32, letterSpacing: -0.5 }}>
                    Filernow
                </Text> */}

                {/* Right: premium / notifications / apps */}
                <View className="flex-1 flex-row items-center justify-end gap-1">
                    <HeaderIconButton
                        icon={Crown}
                        label="Premium"
                        color={colors["accent-gold"]}
                        filled
                        size={34}
                        onPress={onPremiumPress}
                    />
                    <HeaderIconButton
                        icon={Bell}
                        label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
                        filled
                        size={34}
                        badge={unread > 0}
                        onPress={() => setSheet("notifications")}
                    />
                    <HeaderIconButton icon={LayoutGrid} label="Quick menu" filled size={34} onPress={() => setSheet("apps")} />
                </View>
            </View>

            <NotificationsSheet visible={sheet === "notifications"} onClose={closeSheet} />
            <QuickMenuSheet visible={sheet === "apps"} onClose={closeSheet} />
        </View>
    );
}
