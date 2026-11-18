// nativeApp\src\features\language\components\language-picker.tsx

import { Check, Search } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { APP_LANGUAGES, type AppLanguage, UPCOMING_LANGUAGES } from "@/i18n/languages";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

import { LanguageFlag } from "./language-flag";

const FLAG = 34;
const RADIO = 22;

type Props = { selectedCode: AppLanguage; onSelect: (code: AppLanguage) => void };

/** White card: search field, the app languages as a radio list, then regional languages marked "Coming soon". */
export function LanguagePicker({ selectedCode, onSelect }: Props) {
    const { t } = useTranslation("language");
    const [query, setQuery] = useState("");

    const needle = query.trim().toLowerCase();
    const matches = (l: LanguageInfo) =>
        !needle || l.name.toLowerCase().includes(needle) || l.nativeName.toLowerCase().includes(needle);
    const results = APP_LANGUAGES.filter(matches);
    const upcoming = UPCOMING_LANGUAGES.filter(matches);

    return (
        <View className="flex-shrink overflow-hidden rounded-[24px] border border-border-clr/60 bg-white p-2.5 shadow-lg shadow-primary-deep/5">
            {/* search: soft grey "inset key" field */}
            <View
                className="h-11 flex-row items-center rounded-[14px] border border-border-clr bg-[#F8F6F5] px-3.5"
                style={{ borderBottomWidth: 3, borderBottomColor: "#E6DFDC" }}>
                <Search size={18} color={colors["text-secondary-muter"]} strokeWidth={2} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t("picker.search")}
                    placeholderTextColor={colors["text-secondary-muter"]}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    accessibilityLabel={t("picker.search")}
                    className="ms-2.5 h-full flex-1 py-0 font-jakarta text-[16px] text-text-dark"
                />
            </View>

            <ScrollView
                className="mt-2"
                accessibilityRole="radiogroup"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="gap-1 pb-1">
                {results.map((language) => {
                    const selected = language.code === selectedCode;
                    return (
                        <Pressable
                            key={language.code}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: selected }}
                            accessibilityLabel={`${language.nativeName}, ${language.name}`}
                            onPress={() => onSelect(language.code)}
                            className={cn(
                                "h-[50px] flex-row items-center rounded-[14px] border-[1.5px] px-2.5 active:opacity-80",
                                selected ? "border-[#F2B8C3] bg-[#FDEEF1]" : "border-transparent bg-transparent",
                            )}>
                            <LanguageLabel language={language} />
                            <Radio selected={selected} />
                        </Pressable>
                    );
                })}

                {/* regional languages without translations yet: listed, greyed, not selectable */}
                {upcoming.map((language) => (
                    <View
                        key={language.code}
                        accessible
                        accessibilityState={{ disabled: true }}
                        accessibilityLabel={`${language.nativeName}, ${language.name}, ${t("picker.soon")}`}
                        className="h-[50px] flex-row items-center border-[1.5px] border-transparent px-2.5">
                        <LanguageLabel language={language} muted />
                        <View className="rounded-full bg-[#F3EFEE] px-3 py-1.5">
                            <Text className="font-jakarta-semibold text-[12px] text-text-secondary-muter">
                                {t("picker.soon")}
                            </Text>
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
    );
}

type LanguageInfo = { code: string; name: string; nativeName: string };

/** Flag in a white ring, English name, and the native name beside it when it differs (اردو). */
function LanguageLabel({ language, muted = false }: { language: LanguageInfo; muted?: boolean }) {
    return (
        <View className="flex-1 flex-row items-center">
            <View
                style={{
                    width: FLAG + 4,
                    height: FLAG + 4,
                    borderRadius: (FLAG + 4) / 2,
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 2,
                }}>
                <LanguageFlag code={language.code} size={FLAG} muted={muted} />
            </View>
            <Text
                numberOfLines={1}
                className={cn(
                    "ms-3 font-jakarta-medium text-[17px]",
                    muted ? "text-text-secondary-muter" : "text-text-dark",
                )}>
                {language.name}
            </Text>
            {language.nativeName !== language.name ? (
                <Text className={cn("ms-2 text-[16px]", muted ? "text-text-secondary-muter" : "text-text-secondary-muted")}>
                    {language.nativeName}
                </Text>
            ) : null}
        </View>
    );
}

/** Empty grey ring, or a red disc with a white check (shadow inline so it never toggles a NativeWind shadow class). */
function Radio({ selected }: { selected: boolean }) {
    return selected ? (
        <View
            style={{
                width: RADIO,
                height: RADIO,
                borderRadius: RADIO / 2,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: colors.primary,
                shadowOpacity: 0.35,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
            }}>
            <Check size={13} color="#fff" strokeWidth={3.2} />
        </View>
    ) : (
        <View style={{ width: RADIO, height: RADIO, borderRadius: RADIO / 2, borderWidth: 1.5, borderColor: "#D9D3D3" }} />
    );
}
