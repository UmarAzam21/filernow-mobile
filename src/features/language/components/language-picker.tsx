// nativeApp\src\features\language\components\language-picker.tsx

import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { APP_LANGUAGES, type AppLanguage, getAppLanguage, UPCOMING_LANGUAGES } from "@/i18n/languages";

import { LanguageFlag } from "./language-flag";

/** Sky-blue palette from the onboarding gradient (#7CC6FE → white). */
export const PICKER_BLUE = {
    sky: "#7CC6FE",
    accent: "#1E90E8",
    tint: "#EAF6FF",
} as const;

const CHECK = { ios: "checkmark", android: "check", web: "check" } as const;

type Props = { selectedCode: AppLanguage; onSelect: (code: AppLanguage) => void };

/** "You Selected" card + searchable "All Languages" list, as on the onboarding language screen. */
export function LanguagePicker({ selectedCode, onSelect }: Props) {
    const { t } = useTranslation("language");
    const [query, setQuery] = useState("");

    const needle = query.trim().toLowerCase();
    const matches = (l: LanguageInfo) =>
        !needle || l.name.toLowerCase().includes(needle) || l.nativeName.toLowerCase().includes(needle);
    const results = APP_LANGUAGES.filter(matches);
    const upcoming = UPCOMING_LANGUAGES.filter(matches);

    return (
        <View className="flex-1">
            <Text className="font-jakarta-semibold text-[17px] leading-6 text-[#1F2937]">{t("picker.selected")}</Text>
            <View
                style={{ borderColor: PICKER_BLUE.sky }}
                className="mt-2.5 h-14 flex-row items-center rounded-[18px] border-[1.5px] bg-white px-3.5">
                <LanguageLabel language={getAppLanguage(selectedCode)} />
                <Radio selected />
            </View>

            <Text className="mt-7 font-jakarta-semibold text-[17px] leading-6 text-[#1F2937]">{t("picker.all")}</Text>
            <View className="mt-2.5 flex-shrink overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-white">
                {/* inset search field: padded away from the card edges, soft grey fill */}
                <View className="border-b border-[#EEF0F3] p-2.5">
                    <View className="h-11 flex-row items-center rounded-xl border border-[#EEF0F3] bg-[#F8F9FA] px-3">
                        <SymbolView
                            name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                            tintColor="#6B7280"
                            size={18}
                        />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={t("picker.search")}
                            placeholderTextColor="#9CA3AF"
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                            accessibilityLabel={t("picker.search")}
                            className="ms-2 h-full flex-1 py-0 font-jakarta text-para-base text-[#2B2B2B]"
                        />
                    </View>
                </View>

                <ScrollView
                    accessibilityRole="radiogroup"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    {results.map((language) => {
                        const selected = language.code === selectedCode;
                        return (
                            <Pressable
                                key={language.code}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: selected }}
                                accessibilityLabel={`${language.nativeName}, ${language.name}`}
                                onPress={() => onSelect(language.code)}
                                style={selected ? { backgroundColor: PICKER_BLUE.tint } : undefined}
                                className="h-14 flex-row items-center px-3.5 active:opacity-70">
                                <LanguageLabel language={language} />
                                <Radio selected={selected} />
                            </Pressable>
                        );
                    })}
                    {/* regional languages without translations yet: listed, dimmed, not selectable */}
                    {upcoming.map((language) => (
                        <View
                            key={language.code}
                            accessible
                            accessibilityState={{ disabled: true }}
                            accessibilityLabel={`${language.nativeName}, ${language.name}, ${t("picker.soon")}`}
                            className="h-14 flex-row items-center px-3.5">
                            <View className="flex-1 opacity-55">
                                <LanguageLabel language={language} />
                            </View>
                            <View className="rounded-full bg-[#F3F4F6] px-2.5 py-1">
                                <Text className="font-jakarta-medium text-para-tiny text-[#6B7280]">{t("picker.soon")}</Text>
                            </View>
                        </View>
                    ))}
                    {results.length + upcoming.length === 0 ? (
                        <Text className="py-6 text-center font-jakarta text-para-small text-text-secondary-muted">
                            {t("picker.empty")}
                        </Text>
                    ) : null}
                </ScrollView>
            </View>
        </View>
    );
}

type LanguageInfo = { code: string; name: string; nativeName: string };

/** Flag, English name, and the native name beside it when it differs (اردو). */
function LanguageLabel({ language }: { language: LanguageInfo }) {
    return (
        <View className="flex-1 flex-row items-center">
            <LanguageFlag code={language.code} size={32} />
            <Text numberOfLines={1} className="ms-3 font-jakarta text-para-18 text-[#1F2937]">
                {language.name}
            </Text>
            {language.nativeName !== language.name ? (
                <Text className="ms-2 text-[15px] text-text-secondary-muted">{language.nativeName}</Text>
            ) : null}
        </View>
    );
}

/** Empty grey ring, or a filled blue circle with a check. */
function Radio({ selected }: { selected: boolean }) {
    return selected ? (
        <View
            style={{ backgroundColor: PICKER_BLUE.accent }}
            className="h-5 w-5 items-center justify-center rounded-full">
            <SymbolView name={CHECK} tintColor="#FFFFFF" size={12} />
        </View>
    ) : (
        <View className="h-5 w-5 rounded-full border-[1.5px] border-[#D1D5DB]" />
    );
}
