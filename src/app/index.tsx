import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SymbolView } from "expo-symbols";
import { cssInterop } from "nativewind";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

cssInterop(Image, { className: "style" });

const ACCENT = "#D3222C";
const AUTO_MS = 3800;

type Slide = { image: number; icon: "chart" | "people" | "laptop"; title: string; text: string };

const SLIDE_ICONS = {
  chart: { ios: "chart.bar.fill", android: "bar_chart", web: "bar_chart" },
  people: { ios: "person.2.fill", android: "groups", web: "groups" },
  laptop: { ios: "laptopcomputer", android: "laptop", web: "laptop" },
} as const;

const SLIDES: Slide[] = [
  {
    image: require("../../assets/images/slide_1.jpg"),
    icon: "chart",
    title: "Apne paison par apna control",
    text: "Kharche track karein, aamdani sambhalein — sab kuch ek hi jagah.",
  },
  {
    image: require("../../assets/images/slide_2.jpg"),
    icon: "people",
    title: "Poora karobar, ek hi app mein",
    text: "Grahak, bank, bikri, amla aur kharche — sab kuch Digital Khata mein.",
  },
  {
    image: require("../../assets/images/slide_3.jpg"),
    icon: "laptop",
    title: "Har device par aapka hisaab",
    text: "Mobile aur laptop, dono par Digital Khata — data hamesha sync.",
  },
];

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const index = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, force] = useState(0);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    timer.current = setInterval(() => {
      const next = (index.current + 1) % SLIDES.length; // wraps 3 -> 1
      index.current = next;
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    }, AUTO_MS);
  }, [stop, width]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  if (!fontsLoaded) return null;

  const textOpacity = (i: number) =>
    scrollX.interpolate({
      inputRange: [(i - 0.6) * width, i * width, (i + 0.6) * width],
      outputRange: [0, 1, 0],
      extrapolate: "clamp",
    });
  const textShift = (i: number) =>
    scrollX.interpolate({
      inputRange: [(i - 1) * width, i * width, (i + 1) * width],
      outputRange: [24, 0, -24],
      extrapolate: "clamp",
    });

  return (
    <View className="flex-1 bg-[#EBA3A7]">
      <StatusBar style="light" />

      {/* Auto-scrolling full-screen banners */}
      <View className="absolute bottom-0 left-0 right-0 top-0">
        <Animated.FlatList
          ref={listRef as any}
          data={SLIDES}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          onScrollBeginDrag={stop}
          onMomentumScrollEnd={(e) => {
            index.current = Math.round(e.nativeEvent.contentOffset.x / width);
            force((n) => n + 1);
            start(); // resume auto-scroll after the user lets go
          }}
          style={{ flex: 1 }}
          renderItem={({ item }) => (
            <Image
              source={item.image}
              contentFit="cover"
              contentPosition="top"
              className="h-full"
              style={{ width }}
            />
          )}
        />
      </View>

      {/* Bottom sheet */}
      <View
        className="absolute bottom-0 left-0 right-0 rounded-t-[32px] bg-white px-6 pt-[22px] shadow-2xl shadow-[#64163C]"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 12 }}
      >
        {/* Text swaps with the banner (cross-fade) */}
        <View className="h-32">
          {SLIDES.map((s, i) => (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                opacity: textOpacity(i),
                transform: [{ translateX: textShift(i) }],
              }}
            >
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-[14px] bg-[#FBE9EA]">
                  <SymbolView name={SLIDE_ICONS[s.icon]} size={24} tintColor={ACCENT} />
                </View>
                <Text className="flex-1 font-jakarta-xbold text-[20px] leading-[26px] tracking-[-0.3px] text-[#161315]">
                  {s.title}
                </Text>
              </View>
              <Text className="mt-3 font-jakarta-medium text-[14px] leading-[21px] text-[#463C40]">{s.text}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Dots */}
        <View className="mb-[18px] flex-row justify-center gap-1.5">
          {SLIDES.map((_, i) => {
            const w = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 22, 8],
              extrapolate: "clamp",
            });
            const o = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.25, 1, 0.25],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={{ width: w, height: 8, borderRadius: 4, backgroundColor: ACCENT, opacity: o }}
              />
            );
          })}
        </View>

        {/* Get Started */}
        <Pressable
          onPress={() => router.push("/language")}
          className="h-14 flex-row items-center justify-between rounded-full bg-[#D3222C] pl-6 pr-2 active:opacity-90"
        >
          <Text className="font-jakarta-bold text-base text-white">Let's get started!</Text>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <SymbolView
              name={{ ios: "arrow.right", android: "arrow_forward", web: "arrow_forward" }}
              size={20}
              tintColor={ACCENT}
            />
          </View>
        </Pressable>

        {/* Log in */}
        <Pressable
          onPress={() => {
            /* TODO: router.push("/login") */
          }}
          className="items-center pt-3.5"
        >
          <Text className="font-jakarta-medium text-sm text-[#463C40]">
            Pehle se account hai? <Text className="font-jakarta-bold text-[#D3222C]">Log in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}