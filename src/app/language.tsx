import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  type LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import ISO6391, { type LanguageCode } from "iso-639-1";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Poster palette
const INK = "#161315";
const ACCENT = "#D3222C";
const BODY = "#463C40";

type Language = { code: LanguageCode; name: string; nativeName: string };

const featuredLanguageCodes: LanguageCode[] = ["en", "ur", "ar", "hi", "bn"];

const languages: Language[] = ISO6391.getLanguages(ISO6391.getAllCodes()).sort((a, b) => {
  const aRank = featuredLanguageCodes.indexOf(a.code);
  const bRank = featuredLanguageCodes.indexOf(b.code);
  if (aRank !== -1 || bRank !== -1) {
    return (
      (aRank === -1 ? featuredLanguageCodes.length : aRank) -
      (bRank === -1 ? featuredLanguageCodes.length : bRank)
    );
  }
  return a.name.localeCompare(b.name);
});

const POPULAR = languages.filter((l) => featuredLanguageCodes.includes(l.code));
const OTHERS = languages.filter((l) => !featuredLanguageCodes.includes(l.code));
const DASHES = Array.from({ length: 26 });

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const [selectedLanguageCode, setSelectedLanguageCode] = useState<LanguageCode>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  // space actually available to the sheet (shrinks when the keyboard opens)
  const [areaH, setAreaH] = useState(0);
  const [kb, setKb] = useState(0);
  const baseH = useRef(0); // tallest area seen while the keyboard was closed

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvt, (e) => setKb(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvt, () => setKb(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onAreaLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    baseH.current = Math.max(baseH.current, h);
    setAreaH(h);
  };

  // part of the keyboard still covering the area (0 if Android already resized the window)
  const area = areaH || height;
  const overlap = kb > 0 ? Math.max(0, kb - (baseH.current - area)) : 0;
  const maxSheet = Math.max(240, area - overlap - insets.top - 12);

  const selected = languages.find((l) => l.code === selectedLanguageCode) ?? languages[0];

  const sections = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) {
      return [
        { title: "Popular", data: POPULAR },
        { title: "All languages", data: OTHERS },
      ];
    }
    const hits = languages.filter(({ code, name, nativeName }) =>
      [code, name, nativeName].some((value) => value.toLocaleLowerCase().includes(query)),
    );
    return hits.length
      ? [{ title: `${hits.length} result${hits.length === 1 ? "" : "s"}`, data: hits }]
      : [];
  }, [searchQuery]);

  const closeSheet = () => {
    setSheetOpen(false);
    setSearchQuery("");
    baseH.current = 0;
  };

  const selectLanguage = (code: LanguageCode) => {
    setSelectedLanguageCode(code);
    closeSheet();
  };

  if (!fontsLoaded) return null;

  return (
    // top only: the white card runs to the bottom edge and handles the bottom inset itself
    <SafeAreaView edges={["top"]} className="flex-1">
      <StatusBar style="light" />
      <Image
        source={require("../../assets/images/Welcome-Frame-V2.png")}
        contentFit="cover"
        accessibilityLabel="Welcome background"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="flex-row items-center justify-between px-6 pb-5 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-start justify-center">
          <SymbolView
            name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
            tintColor={INK}
            size={22}
          />
        </Pressable>
        <Text className="font-jakarta-bold text-xl text-[#D3222C]">Filernow</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8">
          <Image
            source={require("../../assets/images/Global Language Globe Smartphone.png")}
            contentFit="contain"
            accessibilityLabel="Multilingual globe illustration"
            style={{ width: "100%", height: "100%" }}
          />
      </View>

      <View className="mt-auto">
        {/* floating globe badge, half on the card */}
        <View className="z-10 -mb-8 ml-6 h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#D3222C]">
          <SymbolView
            name={{ ios: "globe", android: "language", web: "language" }}
            tintColor="#FFFFFF"
            size={28}
          />
        </View>

        <View
          style={{ paddingBottom: insets.bottom + 16 }}
          className="rounded-t-[32px] bg-white px-6 pt-12">
          <Text className="font-jakarta-extrabold text-[25px] text-[#161315]">
            Choose Your <Text className="text-[#D3222C]">Language</Text>
          </Text>
          <Text className="mt-2 font-jakarta-medium text-sm leading-[22px] text-[#463C40]">
            Select the language you want to use in the app. You can change it anytime in Settings.
          </Text>
          <Text className="mt-3 font-jakarta-medium text-xs text-[#463C40]">
            Hello · السلام علیکم · नमस्ते · হ্যালো · مرحبا
          </Text>

          {/* language ticket */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Language, ${selected.name}. Tap to change`}
            onPress={() => setSheetOpen(true)}
            className="mt-6 rounded-2xl border border-[#D3222C] bg-[#fff6f6] active:opacity-80">
            <View className="flex-row items-center justify-between px-5 pb-4 pt-4">
              <View className="mr-3 flex-1">
                <Text className="font-jakarta-bold text-[10px] uppercase tracking-widest text-[#463C40]">
                  App language
                </Text>
                <Text className="mt-1 font-jakarta-extrabold text-[26px] text-[#161315]" numberOfLines={1}>
                  {selected.nativeName || selected.name}
                </Text>
                <Text className="font-jakarta text-xs text-[#463C40]">{selected.name}</Text>
              </View>
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#D3222C]">
                <Text className="font-jakarta-bold text-sm text-white">{selected.code.toUpperCase()}</Text>
              </View>
            </View>

            {/* dashed tear line with notches */}
            <View className="h-5 justify-center">
              <View className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-white" />
              <View className="absolute -right-[11px] top-0 h-5 w-5 rounded-full bg-white" />
              <View className="flex-row items-center justify-between px-5">
                {DASHES.map((_, i) => (
                  <View key={i} className="h-px w-2 bg-[#E8A5A9]" />
                ))}
              </View>
            </View>

            <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
              <Text className="font-jakarta-semibold text-xs text-[#463C40]">Tap to change language</Text>
              <SymbolView
                name={{ ios: "chevron.down", android: "keyboard_arrow_down", web: "keyboard_arrow_down" }}
                tintColor={ACCENT}
                size={18}
              />
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            // TODO: save selectedLanguageCode, then router.push(...)
            className="mt-5 min-h-14 flex-row items-center justify-center rounded-full bg-[#D3222C] pl-6 pr-2 active:opacity-80">
            <Text className="flex-1 text-center font-jakarta-bold text-base text-white">Continue</Text>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <SymbolView
                name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }}
                tintColor={ACCENT}
                size={18}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* language list */}
      <Modal visible={sheetOpen} transparent animationType="none" statusBarTranslucent onRequestClose={closeSheet}>
        <View style={{ flex: 1, justifyContent: "flex-end" }} onLayout={onAreaLayout}>
          <Pressable
            accessibilityLabel="Close language list"
            onPress={closeSheet}
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(22,19,21,0.5)" }]}
          />

          <View
            style={{
              maxHeight: maxSheet,
              marginBottom: overlap,
              paddingBottom: kb > 0 ? 12 : insets.bottom + 12,
            }}
            className="rounded-t-[32px] bg-white px-6 pt-3">
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-[#ece5e7]" />

            <View className="mb-3 flex-row items-end justify-between">
              <Text className="font-jakarta-extrabold text-lg text-[#161315]">Select language</Text>
              <Text className="font-jakarta-medium text-xs text-[#463C40]">{languages.length} languages</Text>
            </View>

            <View className="mb-1 h-[48px] flex-row items-center rounded-full bg-[#f6f1f2] px-4">
              <SymbolView
                name={{ ios: "magnifyingglass", android: "search", web: "search" }}
                tintColor={BODY}
                size={18}
              />
              <TextInput
                accessibilityLabel="Search languages"
                autoCapitalize="none"
                onChangeText={setSearchQuery}
                placeholder="Search language"
                placeholderTextColor={BODY}
                value={searchQuery}
                className="ml-3 flex-1 font-jakarta text-base text-[#161315]"
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
              ItemSeparatorComponent={() => <View className="h-2" />}
              ListEmptyComponent={
                <Text className="py-8 text-center font-jakarta text-sm text-[#463C40]">
                  No languages found.
                </Text>
              }
              renderSectionHeader={({ section }) => (
                <Text className="pb-2 pt-4 font-jakarta-bold text-[11px] uppercase tracking-widest text-[#D3222C]">
                  {section.title}
                </Text>
              )}
              renderItem={({ item: language }) => {
                const isSelected = language.code === selectedLanguageCode;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => selectLanguage(language.code)}
                    className={`min-h-[58px] flex-row items-center rounded-2xl border px-4 ${
                      isSelected ? "border-[#D3222C] bg-[#fff6f6]" : "border-[#ece5e7] bg-white"
                    }`}>
                    <View
                      className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${
                        isSelected ? "bg-[#D3222C]" : "bg-[#f6f1f2]"
                      }`}>
                      <Text
                        className={`font-jakarta-bold text-xs ${
                          isSelected ? "text-white" : "text-[#463C40]"
                        }`}>
                        {language.code.toUpperCase()}
                      </Text>
                    </View>

                    <View className="mr-3 flex-1">
                      <Text className="font-jakarta-semibold text-[15px] text-[#161315]">
                        {language.nativeName || language.name}
                      </Text>
                      <Text className="font-jakarta text-xs text-[#463C40]">{language.name}</Text>
                    </View>

                    <SymbolView
                      name={
                        isSelected
                          ? { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }
                          : { ios: "circle", android: "radio_button_unchecked", web: "radio_button_unchecked" }
                      }
                      tintColor={isSelected ? ACCENT : "#ded2d6"}
                      size={22}
                    />
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}