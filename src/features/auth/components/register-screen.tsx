// nativeApp\src\features\auth\components\register-screen.tsx

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Check, CircleAlert, Lock } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { apiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { colors } from "@/theme/tokens";

import { formatPhone, isValidPhone } from "../lib/phone";
import { nextStepFor } from "../lib/session";

const WORD_LH = 56; // line-height of the big rotating word (48px extrabold)
const WORD_H = WORD_LH + 4; // mask height for the rotating word
const FONT_CAP = 1.1; // system font scaling cap for fixed-height lines

// Soft gradient icons without a background (the filernow-soft-tiles SVGs with the grey tile removed)
const tiles = {
  wallet: require("@/assets/images/filernow-soft-icons/wallet.svg"),
  coins: require("@/assets/images/filernow-soft-icons/savings.svg"),
  chart: require("@/assets/images/filernow-soft-icons/growth-teal.svg"),
  receipt: require("@/assets/images/filernow-soft-icons/accounts.svg"),
} as const;

// Pre-rendered 3D art (transparent PNGs) so the look is identical on every device:
// RN has no radial gradients / layered shadows, these carry them.
const art = {
  glowPink: require("@/assets/images/register/glow-pink.png"), // 360 x 360
  glowLilac: require("@/assets/images/register/glow-lilac-strong.png"), // 330 x 330
  tile: require("@/assets/images/register/tile-raised.png"), // 62 tile + 34 padding on every side (edge + shadow)
  badge: require("@/assets/images/register/logo-badge.png"), // 260 x 260: rings + raised white disc, no logo
} as const;
const TILE_PAD = 34; // padding baked into tile-raised.png, in px at TILE=62

// 3D icon tiles orbiting the logo (positions inside a 270 x 200 cluster box)
const CLUSTER_W = 270;
const CLUSTER_H = 200;
const BADGE = 252; // logo-badge.png drawn size (rings + white disc ~105pt wide)
const TILE = 54; // raised white tile
const ORBIT = [
  { icon: tiles.wallet, left: 28, top: 23, rotate: "-8deg", amp: 5, dur: 2600 },
  { icon: tiles.coins, left: 189, top: 19, rotate: "6deg", amp: 6, dur: 2900 },
  { icon: tiles.chart, left: 42, top: 114, rotate: "-6deg", amp: 6, dur: 3100 },
  { icon: tiles.receipt, left: 176, top: 112, rotate: "6deg", amp: 5, dur: 3400 },
] as const;

/** Slow idle bob that makes 3D objects feel like they float. Skipped when "reduce motion" is on. */
function Float({ children, amplitude = 6, duration = 2600 }: { children: ReactNode; amplitude?: number; duration?: number }) {
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let cancelled = false;
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(y, { toValue: -amplitude, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(y, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [y, amplitude, duration]);
  return <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

/** Fade + slide-up entrance. Runs once when the screen appears. */
function Reveal({
  children,
  delay = 0,
  distance = 14,
  duration = 550,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
}) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay, duration]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Raised "key" tile (white, thick darker edge, glossy top, soft shadow) drawn from tile-raised.png,
 * with the icon on top. The PNG has baked padding for the edge and shadow, so it bleeds outside the tile box.
 */
function RaisedTile({ children, size = TILE }: { children: ReactNode; size?: number }) {
  const pad = TILE_PAD * (size / 62);
  const full = size + pad * 2;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Image
        source={art.tile}
        contentFit="fill"
        style={{ position: "absolute", left: -pad, top: -pad, width: full, height: full }}
      />
      {children}
    </View>
  );
}

export default function RegisterScreen({
  onContinue,
}: {
  onContinue: (phone: string, next: "login" | "set_pin") => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["auth", "common"]);
  const words = t("register.rotatingWords", { returnObjects: true });
  const [phone, setPhone] = useState(""); // digits only, without 0 / +92
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Rotating word: slides up out of a masked line, the next one slides up in
  const [wordIdx, setWordIdx] = useState(0);
  const [wordOpacity] = useState(() => new Animated.Value(1));
  const [wordY] = useState(() => new Animated.Value(0));
  const wordCount = words.length; // derived, so adding a 4th word in i18n can't desync

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const cycle = () => {
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 0, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(wordY, { toValue: -WORD_H, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (!finished || cancelled) return;
        setWordIdx((i) => (i + 1) % wordCount);
        wordY.setValue(WORD_H);
        Animated.parallel([
          Animated.timing(wordOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(wordY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      });
    };

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled || wordCount < 2) return;
      timer = setInterval(cycle, 3200);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [wordOpacity, wordY, wordCount]);

  // keep digits only, drop a leading 0 (0300... -> 300...), max 10 digits
  const onChange = (text: string) => {
    setPhone(text.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10));
    setRequestError(null);
  };

  const valid = isValidPhone(phone);
  const showError = touched && phone.length > 0 && !valid;

  const handleContinue = async () => {
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    try {
      // the server says whether the number is registered: login, or create a PIN
      onContinue(phone, await nextStepFor(phone));
    } catch (e) {
      // e.g. offline, too many checks (429), or a number owned by another kind of account (409)
      setRequestError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // every branch carries a shadow-* class (see the NativeWind remount note on the button).
  // fieldEdge = the thicker bottom edge (small "inset key" depth); its colour follows the state.
  const hasError = !!(showError || requestError);
  const active = !hasError && (focused || valid); // red outline + pink halo (focused, or a valid number)
  const fieldClass = hasError
    ? "border-danger bg-danger-bg/40 shadow-sm shadow-danger/10"
    : active
      ? "border-primary bg-white shadow-md shadow-primary/20"
      : "border-border-clr bg-card-bg-clr shadow-sm shadow-transparent";
  const fieldEdge = hasError ? colors.danger : active ? colors.primary : "#e6dfdc";

  return (
    <View className="flex-1 bg-page-bg">
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* ── Brand area: centred logo, badge, tagline. Takes all spare height so the form stays at the bottom. */}
            <View className="flex-1 items-center justify-center overflow-hidden px-6 pb-12 pt-6">
              {/* Soft colour glows behind the artwork */}
              <View pointerEvents="none" style={{ position: "absolute", left: -60, top: -40, width: 360, height: 360 }}>
                <Image source={art.glowPink} contentFit="fill" style={{ width: 360, height: 360 }} />
              </View>
              <View pointerEvents="none" style={{ position: "absolute", right: -90, top: 100, width: 330, height: 330 }}>
                <Image source={art.glowLilac} contentFit="fill" style={{ width: 330, height: 330 }} />
              </View>

              {/* Logo with glow rings and floating 3D icon tiles around it */}
              <Reveal delay={0} distance={10}>
                <View style={{ width: CLUSTER_W, height: CLUSTER_H }} className="items-center justify-center">
                  {/* Raised logo badge: rings + white disc come from logo-badge.png, the real logo sits on top */}
                  <Float amplitude={4} duration={3000}>
                    <View
                      pointerEvents="none"
                      style={{ width: BADGE, height: BADGE, alignItems: "center", justifyContent: "center", transform: [{ translateY: 4 }] }}
                    >
                      <Image source={art.badge} contentFit="fill" style={{ position: "absolute", width: BADGE, height: BADGE }} />
                      <Image
                        source={require("@/assets/images/FILERNOW.COM LOGO-01.svg")}
                        contentFit="contain"
                        accessibilityLabel="Filernow"
                        style={{ width: 74, height: 74 }}
                      />
                    </View>
                  </Float>

                  {/* Floating 3D icon tiles (decorative) */}
                  {ORBIT.map((o, i) => (
                    <View
                      key={i}
                      pointerEvents="none"
                      accessible={false}
                      importantForAccessibility="no-hide-descendants"
                      style={{ position: "absolute", left: o.left, top: o.top, transform: [{ rotate: o.rotate }] }}
                    >
                      <Reveal delay={250 + i * 90} distance={10} duration={500}>
                        <Float amplitude={o.amp} duration={o.dur}>
                          <RaisedTile>
                            <Image source={o.icon} contentFit="contain" style={{ width: 44, height: 44 }} />
                          </RaisedTile>
                        </Float>
                      </Reveal>
                    </View>
                  ))}
                </View>
              </Reveal>

              {/* Tagline: "Your Khata, now digital." with the last words rotating */}
              <Reveal delay={180}>
                <View className="mt-[60px] items-center">
                  {/* Small grey lead-in line */}
                  <Text
                    maxFontSizeMultiplier={FONT_CAP}
                    accessibilityRole="header"
                    className="text-center font-jakarta-medium text-text-secondary"
                    style={{ fontSize: 28, lineHeight: 36, letterSpacing: -0.5 }}
                  >
                    {t("register.headline")}
                  </Text>
                  {/* Big black word, red full stop, pink highlighter stroke behind its lower half */}
                  <View style={{ height: WORD_H, overflow: "hidden", justifyContent: "center", paddingHorizontal: 10 }}>
                    <Animated.View style={{ opacity: wordOpacity, transform: [{ translateY: wordY }] }}>
                      <View style={{ alignSelf: "center" }}>
                        <View
                          pointerEvents="none"
                          className="absolute rounded-full bg-primary/20"
                          style={{ left: -8, right: -8, bottom: 6, height: 14 }}
                        />
                        <Text
                          maxFontSizeMultiplier={FONT_CAP}
                          numberOfLines={1}
                          className="text-center font-jakarta-extrabold text-text-dark"
                          style={{ fontSize: 48, lineHeight: WORD_LH, letterSpacing: -2 }}
                        >
                          {String(words[wordIdx]).replace(/[.۔]$/, "")}
                          <Text className="text-primary">{/[.۔]$/.exec(String(words[wordIdx]))?.[0] ?? ""}</Text>
                        </Text>
                      </View>
                    </Animated.View>
                  </View>
                </View>
              </Reveal>
            </View>

            {/* ── Form sheet: one clear task, enter your mobile number. */}
            <View
              className="rounded-t-brand-24 border border-b-0 border-border-clr/65 bg-white px-6 pt-7 shadow-xl shadow-primary-deep/10"
              style={{ paddingBottom: Math.max(insets.bottom, 12) + 12 }}
            >
              {/* grab handle */}
              <View pointerEvents="none" className="absolute inset-x-0 top-2.5 items-center">
                <View className="h-1 w-10 rounded-full bg-border-clr" />
              </View>

              <Text className="font-jakarta-bold text-heading-h3 text-text-dark">{t("register.title")}</Text>
              <Text className="mt-1 font-jakarta text-para-base text-text-secondary-muted">{t("register.subtitle")}</Text>

              <Text className="mb-2 mt-6 font-jakarta-medium text-para-small text-text-secondary">
                {t("register.phoneLabel")}
              </Text>

              {/* Pink halo ring around the active field (negative margin keeps the layout identical) */}
              <View
                className="rounded-[15px] p-[3px]"
                style={{ margin: -3, backgroundColor: active ? "rgba(200, 16, 46, 0.10)" : "transparent" }}
              >
              {/* Forces LTR layout so +92 stays on the left even when app language is Urdu */}
              <View
                className={`h-14 flex-row items-center rounded-brand-12 border px-4 ${fieldClass}`}
                style={{ direction: "ltr", borderBottomWidth: active ? 1.5 : 3, borderWidth: active ? 1.5 : 1, borderBottomColor: fieldEdge }}
              >
                <Text className="mr-1.5 text-heading-h5" accessible={false}>🇵🇰</Text>
                <Text className="font-jakarta-semibold text-heading-h5 text-text-dark">+92</Text>
                <View className="mx-3 h-6 w-px bg-border-strong" />
                <TextInput
                  className="h-full flex-1 py-0 font-jakarta-medium text-heading-h5 text-text-dark"
                  value={formatPhone(phone)}
                  onChangeText={onChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => {
                    setFocused(false);
                    setTouched(true);
                  }}
                  placeholder="300 1234567"
                  textAlign="left"
                  placeholderTextColor={colors["text-secondary-muter"]}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  selectionColor={colors.primary}
                  accessibilityLabel={t("register.phoneLabel")}
                />
                {valid && !requestError && (
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full shadow-sm shadow-success/40"
                    style={{ backgroundColor: colors.success }}
                  >
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                )}
              </View>
              </View>

              {/* Validation error, network error, or privacy note */}
              {showError || requestError ? (
                <View className="mt-2.5 flex-row items-start gap-1.5" accessibilityLiveRegion="polite">
                  <View className="mt-0.5">
                    <CircleAlert size={14} color={colors.danger} strokeWidth={2.25} />
                  </View>
                  <Text className="flex-1 font-jakarta-medium text-para-small text-danger">
                    {showError ? t("register.invalidPhone") : requestError}
                  </Text>
                </View>
              ) : (
                <View className="mt-2.5 flex-row items-center gap-1.5">
                  <Lock size={13} color={colors["text-secondary-muter"]} strokeWidth={2} />
                  <Text className="font-jakarta text-para-small text-text-secondary-muted">{t("register.privacyNote")}</Text>
                </View>
              )}

              <Pressable
                onPress={handleContinue}
                disabled={!valid || loading}
                accessibilityRole="button"
                accessibilityState={{ busy: loading, disabled: !valid || loading }}
                // 3D "key": darker bottom edge, sinks 2px when pressed
                style={({ pressed }) => ({ transform: [{ translateY: pressed && valid ? 2 : 0 }] })}
                // shadow-* sets CSS variables: keep it on both states so NativeWind doesn't
                // "upgrade" (remount) the Pressable after the first render, which crashes on native
                className={cn(
                  "mt-7 h-14 items-center justify-center overflow-hidden rounded-brand-12 border-b-4 shadow-lg",
                  valid ? "border-primary-dark bg-primary shadow-primary/30" : "border-border-clr bg-surface-muted shadow-transparent"
                )}
              >
                {/* Glossy top highlight when enabled */}
                {valid && <View pointerEvents="none" className="absolute inset-x-4 top-[3px] h-px bg-white/40" />}
                {loading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text className={cn("font-jakarta-semibold text-heading-h5", valid ? "text-surface" : "text-text-secondary-muter")}>
                    {t("common:actions.continue")}
                  </Text>
                )}
              </Pressable>

              <Text className="mt-4 px-2 text-center font-jakarta text-para-tiny text-text-secondary-muted">
                <Trans
                  t={t}
                  i18nKey="register.terms"
                  components={{ bold: <Text className="font-jakarta-semibold text-text-dark" /> }}
                />
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
