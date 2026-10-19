// nativeApp\src\features\language\components\language-sheet.tsx

import type { LanguageCode } from "iso-639-1";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Modal, Pressable, SectionList, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageRow } from "@/features/language/components/language-row";
import {
    OTHERS,
    languages,
    searchLanguages,
} from "@/features/language/data/languages";
import { useSheetKeyboardLayout } from "@/features/language/hooks/use-sheet-keyboard-layout";
import { colors } from "@/theme/tokens";

const ItemSeparator = () => <View className="h-2" />;

type Props = {
    visible: boolean;
    selectedCode: LanguageCode;
    onSelect: (code: LanguageCode) => void;
    onClose: () => void;
};

export function LanguageSheet({ visible, selectedCode, onSelect, onClose }: Props) {
    const insets = useSafeAreaInsets();
    const { onAreaLayout, resetBase, keyboardOpen, overlap, maxSheet } = useSheetKeyboardLayout();
    const [query, setQuery] = useState("");

    const sections = useMemo(() => {
        if (!query.trim()) {
            return [{ title: "Other languages", data: OTHERS }];
        }
        const hits = searchLanguages(query);
        return hits.length
            ? [{ title: `${hits.length} result${hits.length === 1 ? "" : "s"}`, data: hits }]
            : [];
    }, [query]);

    const close = () => {
        setQuery("");
        resetBase();
        onClose();
    };

    const select = (code: LanguageCode) => {
        onSelect(code);
        close();
    };

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
            <View style={{ flex: 1, justifyContent: "flex-end" }} onLayout={onAreaLayout}>
                <Pressable
                    accessibilityLabel="Close language list"
                    onPress={close}
                    className="absolute inset-0 bg-text-dark/50"
                />

                <View
                    style={{
                        maxHeight: maxSheet,
                        marginBottom: overlap,
                        paddingBottom: keyboardOpen ? 12 : insets.bottom + 12,
                    }}
                    className="rounded-t-brand-32 bg-white px-6 pt-3">
                    <View className="mb-4 h-1 w-10 self-center rounded-full bg-border-clr" />

                    <View className="mb-3 flex-row items-end justify-between">
                        <Text className="font-jakarta-extrabold text-lg text-text-dark">Select language</Text>
                        <Text className="font-jakarta-medium text-xs text-text-secondary">
                            {languages.length} languages
                        </Text>
                    </View>

                    <View className="mb-1 h-[48px] flex-row items-center rounded-full bg-surface-muted px-4">
                        <SymbolView
                            name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                            tintColor={colors["text-secondary"]}
                            size={18}
                        />
                        <TextInput
                            accessibilityLabel="Search languages"
                            autoCapitalize="none"
                            onChangeText={setQuery}
                            placeholder="Search language"
                            placeholderTextColor={colors["text-secondary"]}
                            value={query}
                            className="ml-3 flex-1 font-jakarta text-base text-text-dark"
                        />
                    </View>

                    <SectionList
                        style={{ flexShrink: 1 }}
                        sections={sections}
                        stickySectionHeadersEnabled={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        keyExtractor={(language) => language.code}
                        contentContainerStyle={{ paddingBottom: 8 }}
                        ItemSeparatorComponent={ItemSeparator}
                        ListEmptyComponent={
                            <Text className="py-8 text-center font-jakarta text-sm text-text-secondary">
                                No languages found.
                            </Text>
                        }
                        renderSectionHeader={({ section }) => (
                            <Text className="pb-2 pt-4 font-jakarta-bold text-[11px] uppercase tracking-widest text-primary">
                                {section.title}
                            </Text>
                        )}
                        renderItem={({ item }) => (
                            <LanguageRow language={item} selected={item.code === selectedCode} onPress={select} />
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}