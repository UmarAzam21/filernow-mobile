// nativeApp\src\features\more\components\app-lock-sheet.tsx

import { Image } from "expo-image";
import { Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { emIcons } from "@/constants/expense-manager-icons";
import { useAppStore } from "@/stores/app-store";

type Props = { visible: boolean; onClose: () => void };

/** App Lock on/off. */
export function AppLockSheet({ visible, onClose }: Props) {
    const appLock = useAppStore((s) => s.appLock);
    const setAppLock = useAppStore((s) => s.setAppLock);

    return (
        <BottomSheet visible={visible} onClose={onClose} title="App Lock" subtitle="Keep your expenses private">
            <View className="flex-row items-center gap-4 rounded-brand-24 border border-[#ECE7E5] bg-[#F7F5F4] p-4">
                <View className="h-12 w-12 items-center justify-center rounded-brand-16 bg-[#FFF4DC]">
                    <Image source={emIcons.appLock} contentFit="contain" style={{ width: 28, height: 28 }} />
                </View>
                <View className="flex-1">
                    <Text className="font-jakarta-semibold text-text-dark" style={{ fontSize: 16 }}>
                        Lock with PIN
                    </Text>
                    <Text className="mt-0.5 font-jakarta text-para-small text-[#8A8285]">
                        Ask for your PIN every time the app opens
                    </Text>
                </View>
                <ToggleSwitch value={appLock} onValueChange={setAppLock} accessibilityLabel="App Lock" />
            </View>
        </BottomSheet>
    );
}
