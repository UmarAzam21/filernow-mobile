import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { useFonts } from "expo-font";
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

cssInterop(Image, { className: "style" });

// Poster palette
const ACCENT = "#D3222C";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) return null;

  // the top of the phone sits about 34.5% down the poster
  const chipsTop = insets.top + (height - insets.top) * 0.345;

  return (
    // same near-white as the top of the poster, so the status bar area blends in
    <View className="flex-1 bg-[#FBFCF9]">
      {/* dark time/battery icons: the top of the poster is light */}
      <StatusBar style="dark" />

      <Image
        source={require("../../assets/images/Poster_v4_animated.gif")}
        contentFit="cover"
        contentPosition="top"
        accessibilityLabel="Welcome animation"
        style={{ position: "absolute", top: insets.top, left: 0, right: 0, bottom: 0 }}
      />

      {/* floating chips, top right of the phone */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: chipsTop, right: 16 }}
        className="items-end gap-2">
        <View className="flex-row items-center rounded-full bg-white/85 px-3 py-1.5 shadow-md shadow-black/10">
          <View className="mr-2 h-1.5 w-1.5 rounded-full bg-[#D3222C]" />
          <Text className="font-jakarta-semibold text-xs text-[#161315]">Hisaab</Text>
        </View>

        <View className="mr-4 flex-row items-center rounded-full bg-white/85 px-3 py-1.5 shadow-md shadow-black/10">
          <View className="mr-2 h-1.5 w-1.5 rounded-full bg-[#D3222C]" />
          <Text className="font-jakarta-semibold text-xs text-[#161315]">Bachat</Text>
        </View>

        <View className="mr-1 flex-row items-center rounded-full bg-[#D3222C] px-3 py-1.5 shadow-md shadow-black/20">
          <Text className="mr-1.5 font-jakarta-bold text-xs text-white">Taraqqi</Text>
          <SymbolView
            name={{ ios: "arrow.up.right", android: "north_east", web: "north_east" }}
            tintColor="#FFFFFF"
            size={12}
          />
        </View>
      </View>

      <SafeAreaView edges={["bottom"]} className="absolute inset-0 justify-end">
        <View className="px-6 pb-3 pt-5">
          {/* primary button */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/language")}
            className="min-h-14 flex-row items-center rounded-full bg-[#D3222C] pl-6 pr-2 active:opacity-80">
            <Text className="flex-1 text-center font-jakarta-bold text-base text-white">Get Started</Text>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
              <SymbolView
                name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }}
                tintColor={ACCENT}
                size={18}
              />
            </View>
          </Pressable>

          {/* secondary button */}
          <Pressable
            accessibilityRole="button"
            // TODO: router.push("/login")
            className="mt-3 min-h-12 items-center justify-center">
            <Text className="font-jakarta-semibold text-sm text-[#161315]">
              Already have an account? <Text className="font-jakarta-bold underline text-[#D3222C]">Log in</Text>
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}