// nativeApp\src\features\quick-menu\components\quick-menu-sheet.tsx

import type { Href } from "expo-router";
import { View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SheetSectionLabel } from "@/components/ui/sheet-section-label";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useOpenService } from "@/features/home/hooks/use-open-service";
import { QUICK_ACTIONS, type QuickAction } from "@/features/quick-menu/data/quick-menu";
import { useAppStore } from "@/stores/app-store";

import { QuickActionTile } from "./quick-action-tile";
import { SettingsRow } from "./settings-row";

type Props = { visible: boolean; onClose: () => void };

/** Apps-button sheet: 4-column quick action grid plus app settings shortcuts. */
export function QuickMenuSheet({ visible, onClose }: Props) {
    const openService = useOpenService();
    const appLock = useAppStore((s) => s.appLock);
    const setAppLock = useAppStore((s) => s.setAppLock);

    // Close first so the sheet isn't left open over the next screen.
    const open = (name: string, href?: Href) => {
        onClose();
        openService(name, href);
    };

    const openAction = (item: QuickAction) => open(item.label, item.href);

    return (
        <BottomSheet visible={visible} onClose={onClose} title="Quick Menu" subtitle="Everything in one place">
            <SheetSectionLabel>Quick Actions</SheetSectionLabel>
            <View className="-m-[5px] flex-row flex-wrap">
                {QUICK_ACTIONS.map((item) => (
                    <View key={item.id} className="w-1/4 p-[5px]">
                        <QuickActionTile item={item} onPress={openAction} />
                    </View>
                ))}
            </View>

            <SheetSectionLabel className="mt-5">Settings</SheetSectionLabel>
            <View className="gap-3">
                <SettingsRow icon="backup" label="Backup & Sync" onPress={() => open("Backup & Sync")} />
                <SettingsRow
                    icon="lock"
                    label="App Lock"
                    right={<ToggleSwitch value={appLock} onValueChange={setAppLock} accessibilityLabel="App Lock" />}
                />
                <SettingsRow icon="settings" label="Settings" onPress={() => open("Settings", "/settings")} />
                <SettingsRow icon="help" label="Help & Support" onPress={() => open("Help & Support")} />
            </View>
        </BottomSheet>
    );
}
