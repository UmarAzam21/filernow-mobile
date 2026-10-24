// nativeApp\src\components\ui\bottom-sheet.tsx

import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSheetKeyboardLayout } from "@/hooks/use-sheet-keyboard-layout";
import { colors } from "@/theme/tokens";

type Props = { visible: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode };

export function BottomSheet({ visible, title, subtitle, onClose, children }: Props) {
    const insets = useSafeAreaInsets();
    const { onAreaLayout, resetBase, keyboardOpen, overlap, maxSheet } = useSheetKeyboardLayout();

    const close = () => {
        resetBase();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
            <View style={{ flex: 1, justifyContent: "flex-end" }} onLayout={onAreaLayout}>
                <Pressable accessibilityLabel="Close" onPress={close} className="absolute inset-0 bg-text-dark/50" />

                <View
                    style={{
                        maxHeight: maxSheet,
                        marginBottom: overlap,
                        paddingBottom: keyboardOpen ? 12 : insets.bottom + 12,
                    }}
                    className="rounded-t-brand-24 bg-white pt-3">
                    <View className="mb-3 h-1 w-10 self-center rounded-full bg-border-clr" />

                    <View className="flex-row items-start justify-between px-5 pb-3">
                        <View className="mr-3 flex-1">
                            <Text className="font-jakarta-bold text-base text-text-dark">{title}</Text>
                            {subtitle ? (
                                <Text className="mt-0.5 font-jakarta text-xs text-text-secondary">{subtitle}</Text>
                            ) : null}
                        </View>
                        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={12}>
                            <SymbolView
                                name={{ ios: "xmark", android: "close", web: "close" }}
                                size={18}
                                tintColor={colors["text-secondary"]}
                            />
                        </Pressable>
                    </View>

                    <ScrollView
                        style={{ flexShrink: 1 }}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}>
                        {children}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}