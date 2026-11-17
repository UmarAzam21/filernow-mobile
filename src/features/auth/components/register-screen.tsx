// nativeApp\src\features\auth\components\register-screen.tsx

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { Lock } from "lucide-react-native";
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
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../../theme/tokens";
import { apiErrorMessage } from "@/lib/api/errors";

import { formatPhone, isValidPhone } from "../lib/phone";
import { nextStepFor } from "../lib/session";

import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

const EXTRUDE = 3; // px depth of the rotating word
const SHADOW_GAP = 4; // extra px below the extrusion for the soft contact shadow
const DISPLAY_LH = 44; // = text-display line-height
const WORD_H = DISPLAY_LH + EXTRUDE + SHADOW_GAP + 1; // mask height: extrusion + shadow always fit
const WORD_GRADIENT = [colors["primary-glow"], colors.primary, colors["primary-dark"]] as const;


const HERO_PX = 24; // = px-6 on the hero; ribbons use it to bleed to the screen edge
const RIBBON_RATIO = 344 / 654; // width / height of both ribbon PNGs
const FONT_CAP = 1.1; // system font scaling cap for the hero (fixed-height masks can't grow)

/** Fade + slide-up entrance. Runs once when the screen appears. */
function Reveal({
  children,
  delay = 0,
  distance = 18,
  duration = 650,
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

/** Slow idle bob that makes 3D objects feel like they float. Skipped when "reduce motion" is on. */
function Float({ children, amplitude = 6, duration = 2600 }: { children: ReactNode; amplitude?: number; duration?: number }) {
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let cancelled = false;
    let loop: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled || amplitude === 0) return;
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

/** Glossy 3D ribbon PNG (cut off at its left edge). Size comes from the parent, never hardcoded. */
function Ribbon({
  source,
  height,
  opacity = 1,
  mirror = false,
  amplitude,
  duration,
  position,
}: {
  source: number;
  height: number;
  opacity?: number;
  mirror?: boolean;
  amplitude: number;
  duration: number;
  position: { top?: number; bottom?: number; left?: number; right?: number };
}) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", ...position }}>
      <Reveal distance={24} duration={900}>
        <Float amplitude={amplitude} duration={duration}>
          <Image
            source={source}
            contentFit="contain"
            style={{
              width: Math.round(height * RIBBON_RATIO),
              height,
              opacity,
              transform: [{ scaleX: mirror ? -1 : 1 }],
            }}
          />
        </Float>
      </Reveal>
    </View>
  );
}

/**
 * Extruded 3D text: stacked copies in the side colour sit under the face, the deepest one casts
 * the soft shadow. Only the face is exposed to screen readers.
 * Works on iOS + Android (RN allows a single textShadow per Text, so depth uses layers).
 */
const FIT = {
  numberOfLines: 1,
  adjustsFontSizeToFit: true,
  minimumFontScale: 0.8,
  maxFontSizeMultiplier: FONT_CAP,
} as const;

/** Stacked copies under the face create the extrusion; an optional offset copy is a crisp contact shadow (no blur, so nothing gets clipped). */
function ExtrudeLayers({ text, className, side, depth, shadow }: { text: string; className: string; side: string; depth: number; shadow: boolean }) {
  const hidden = { accessible: false, importantForAccessibility: "no-hide-descendants" } as const;
  return (
    <>
      {shadow && (
        <Text {...FIT} {...hidden} className={className}
          style={{ position: "absolute", top: depth + SHADOW_GAP, left: 0, right: 0, color: colors["shadow-soft"] }}>
          {text}
        </Text>
      )}
      {Array.from({ length: depth }, (_, i) => depth - i).map((d) => (
        <Text key={d} {...FIT} {...hidden} className={className}
          style={{ position: "absolute", top: d, left: 0, right: 0, color: side }}>
          {text}
        </Text>
      ))}
    </>
  );
}

/** Solid-colour 3D text (used for the main headline). */
function Text3D({ text, className, face, side, depth = 2, shadow = false }: { text: string; className: string; face: string; side: string; depth?: number; shadow?: boolean }) {
  return (
    <View>
      <ExtrudeLayers text={text} className={className} side={side} depth={depth} shadow={shadow} />
      <Text {...FIT} className={className} style={{ color: face }}>{text}</Text>
    </View>
  );
}

/** Metallic gradient face + extrusion + contact shadow (used for the rotating word). */
function GradientText3D({ text, className, gradient, side, depth = EXTRUDE }: { text: string; className: string; gradient: readonly [string, string, ...string[]]; side: string; depth?: number }) {
  return (
    <View accessible accessibilityLabel={text} style={{ height: DISPLAY_LH + depth + SHADOW_GAP }}>
      <ExtrudeLayers text={text} className={className} side={side} depth={depth} shadow />
      <MaskedView
        style={{ height: DISPLAY_LH }}
        maskElement={
          <Text {...FIT} className={className} style={{ color: colors["text-dark"], backgroundColor: "transparent" }}>
            {text}
          </Text>
        }
      >
        <LinearGradient colors={gradient} locations={[0, 0.55, 1]} style={{ flex: 1 }} />
      </MaskedView>
    </View>
  );
}

export default function RegisterScreen({
  onContinue,
}: {
  onContinue: (phone: string, next: "login" | "set_pin") => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Loads translations from 'auth' and 'common' namespaces
  const { t } = useTranslation(["auth", "common"]);
  const words = t("register.rotatingWords", { returnObjects: true });
  const chips = t("register.chips", { returnObjects: true });
  const [phone, setPhone] = useState(""); // digits only, without 0 / +92
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [zoneH, setZoneH] = useState(0); // measured height of the flexible hero zone

  // Responsive sizing: everything derives from the real window width / measured zone
  // const logoSize = Math.min(96, Math.round(width * 0.25));
  // const logoSize = Math.min(70, Math.round(width * 0.25));
  const logoSize = Math.min(100, Math.round(width * 0.19)); // Use 0.15 so it scales cleanly down to 40px
  // const redH = Math.round(Math.max(150, Math.min(zoneH + logoSize * 0.8 - 10, (width * 0.46) / RIBBON_RATIO)));
  // const pinkH = Math.round(Math.max(160, Math.min(zoneH + logoSize, (width * 0.56) / RIBBON_RATIO)));

  // Adjust multipliers (0.38 and 0.45) to make ribbons taller or shorter
  const redH = Math.round(Math.max(130, Math.min(zoneH + logoSize * 0.6, (width * 0.42) / RIBBON_RATIO)));
  const pinkH = Math.round(Math.max(120, Math.min(zoneH * 0.95, (width * 0.38) / RIBBON_RATIO)));

  // Animation state for the vertical word switcher
  // Rotating word: slides up out of a masked line, the next one slides up in
  const [wordIdx, setWordIdx] = useState(0);
  const [wordOpacity] = useState(() => new Animated.Value(1));
  const [wordY] = useState(() => new Animated.Value(0));
  const wordCount = words.length; // derived, so adding a 4th word in i18n can't desync

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const cycle = () => {
      // 1. Slide current word up out of the masked box and fade it out
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 0, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(wordY, { toValue: -WORD_H, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(({ finished }) => {
        // 2. Advance to next word index and snap position below the visible mask
        if (!finished || cancelled) return;
        setWordIdx((i) => (i + 1) % wordCount);
        wordY.setValue(WORD_H);
        // 3. Slide new word up into place and fade it in
        Animated.parallel([
          Animated.timing(wordOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(wordY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      });
    };

    // Start 3.2-second rotation interval if motion is allowed and multiple words exist
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled || wordCount < 2) return;
      timer = setInterval(cycle, 3200);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [wordOpacity, wordY, wordCount]);

  // Sanitizes phone input: strips non-digits, removes leading zeros, limits to 10 digits
  const onChange = (text: string) => {
    // keep digits only, drop a leading 0 (0300... -> 300...), max 10 digits
    setPhone(text.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10));
    setRequestError(null);
  };

  // Validates 10-digit Pakistani mobile format and checks when to show error text
  const valid = isValidPhone(phone);
  const showError = touched && phone.length > 0 && !valid;

  // Submits phone number to check whether user needs login or registration PIN flow
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

  // every branch carries a shadow-* class (see the NativeWind remount note on the button)
  // Dynamic input border/shadow styles (every branch keeps shadow-* to prevent NativeWind remounts)
  const fieldClass =
    showError || requestError
      ? "border-danger bg-danger-bg/40 shadow-sm shadow-danger/10"
      : focused
        ? "border-primary bg-surface shadow-sm shadow-primary/20"
        : "border-border-clr bg-card-bg-clr shadow-sm shadow-primary-deep/10";

  return (
    <View className="flex-1 bg-primary-tint">

      {/* Dark status bar icons against the light tinted background */}
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Shifts content upward when iOS software keyboard opens */}
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            // Allows tapping Continue immediately without dismissing the keyboard first
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Top Hero Container */}
            {/* Hero = logo / flexible ribbon zone / text. The zone absorbs all height differences between devices. */}
            <View className="flex-1 overflow-hidden px-6 pb-12 pt-4">
              {/* Logo (above the ribbons) */}
              <View style={{ zIndex: 2, alignSelf: "flex-start" }}>
                <Reveal delay={0} distance={10}>
                  <Float>
                    <View
                      className="items-center justify-center rounded-full bg-surface shadow-md shadow-primary/30"
                      style={{ width: logoSize * 0.85, height: logoSize * 0.85 }}
                    >
                      <Image
                        source={require("../../../../assets/images/khataPilot.png")}
                        contentFit="contain"
                        accessibilityLabel="Filernow Khata"
                        style={{ width: logoSize * 0.85, height: logoSize * 0.85 }}
                      />
                    </View>
                  </Float>
                </Reveal>
              </View>

              {/* Flexible zone: ribbons are sized from its measured height, so they can never reach the text */}
              <View className="flex-1" style={{ minHeight: 90 }} onLayout={(e) => setZoneH(e.nativeEvent.layout.height)}>
                {zoneH > 0 && (
                  <>
                    {/* Pink Ribbon pinned to Bottom Left */}
                    <Ribbon
                      source={require("../../../../assets/images/ribbon-soft.png")}
                      height={pinkH}
                      opacity={0.3}
                      amplitude={5}
                      duration={4200}
                      // position={{ top: -(logoSize + 12), left: -HERO_PX }}
                      position={{ bottom: -160, left: -HERO_PX }}
                    />
                    {/* Red Ribbon pinned to Top Right */}
                    <Ribbon
                      source={require("../../../../assets/images/ribbon-red.png")}
                      height={redH}
                      mirror
                      amplitude={8}
                      duration={3400}
                      // position={{ top: -Math.round(logoSize * 0.8), right: -HERO_PX }}
                      position={{ top: -Math.round(logoSize * 0.5), right: -HERO_PX }}
                    />
                  </>
                )}
              </View>

              {/* Headline + chips (above the ribbons) */}
              <View style={{ zIndex: 1 }}>
                <Reveal delay={100}>
                  <Text3D
                    text={t("register.headline")}
                    className="font-jakarta-bold text-display tracking-[-1px]"
                    face={colors["text-dark"]}
                    side={colors["text-secondary"]}
                    depth={2}
                  />
                </Reveal>

                {/* Masked container that clips the sliding 3D rotating words */}
                <Reveal delay={260}>
                  <View style={{ height: WORD_H, overflow: "hidden" }}>
                    <Animated.View style={{ opacity: wordOpacity, transform: [{ translateY: wordY }] }}>
                      <GradientText3D
                        text={String(words[wordIdx])}
                        className="font-jakarta-bold text-display tracking-[-1px]"
                        gradient={WORD_GRADIENT}
                        side={colors["primary-dark"]}
                      />
                    </Animated.View>
                  </View>
                </Reveal>

                {/* Staggered 3D pill badges */}
                {/* 3D chips: raised pill with a darker bottom edge and a soft shadow */}
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {chips.map((c, i) => (
                    <Reveal key={c} delay={620 + i * 120} distance={12} duration={500}>
                      <View className="rounded-full border border-b-[3px] border-primary-lighter border-b-primary-light/55 bg-surface px-3.5 py-[7px] shadow-md shadow-primary-deep/10">
                        <Text
                          maxFontSizeMultiplier={FONT_CAP}
                          className="font-jakarta-bold text-para-tiny text-text-secondary"
                        >
                          {c}
                        </Text>
                      </View>
                    </Reveal>
                  ))}
                </View>
              </View>
            </View>

            {/* Bottom Form Sheet (-mt-6 overlaps the hero section for depth by 24px) */}
            <View
              className="-mt-6 rounded-t-brand-32 bg-surface px-6 pt-7 shadow-2xl shadow-primary-deep/20"
              style={{ paddingBottom: Math.max(insets.bottom, 12) + 16 }}
            >
              <Text className="font-jakarta-bold text-heading-h3 tracking-[-0.5px] text-text-dark">
                {t("register.title")}
              </Text>
              <Text className="mt-1.5 font-jakarta-medium text-para-base text-text-secondary-muted">
                {t("register.subtitle")}
              </Text>

              {/* Phone field */}
              <Text className="mb-2 mt-6 font-jakarta-bold text-para-small text-text-dark">
                {t("register.phoneLabel")}
              </Text>
              {/* Forces LTR layout so +92 stays on the left even when app language is Urdu */}
              <View
                className={`h-14 flex-row items-center rounded-brand-16 border-[1.5px] px-4 ${fieldClass}`}
                style={{ direction: "ltr" }}
              >
                <Text className="font-jakarta-bold text-heading-h5 text-text-dark">+92</Text>
                <View className="mx-3 h-6 w-px bg-border-clr" />
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
              </View>

              {/* Conditional Validation Error, Network Error, or Privacy Note */}
              {showError ? (
                <Text className="mt-3 font-jakarta-medium text-para-small text-danger">
                  {t("register.invalidPhone")}
                </Text>
              ) : requestError ? (
                <Text className="mt-3 font-jakarta-medium text-para-small text-danger">{requestError}</Text>
              ) : (
                <View className="mt-3 flex-row items-center gap-1.5">
                  <Lock size={13} color={colors["text-secondary-muter"]} strokeWidth={2} />
                  <Text className="font-jakarta-medium text-para-small text-text-secondary-muted">
                    {t("register.privacyNote")}
                  </Text>
                </View>
              )}

              {/* Continue: 3D "key" button (darker bottom edge, sinks 2px when pressed) */}
              <Pressable
                onPress={handleContinue}
                disabled={!valid || loading}
                accessibilityRole="button"
                accessibilityState={{ busy: loading, disabled: !valid || loading }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.95 : 1,
                  transform: [{ translateY: pressed ? 2 : 0 }],
                })}
                // shadow-* sets CSS variables: keep it on both states so NativeWind doesn't
                // "upgrade" (remount) the Pressable after the first render, which crashes on native
                className={`mt-5 h-14 items-center justify-center overflow-hidden rounded-full border-b-4 shadow-lg ${valid
                  ? "border-primary-dark bg-primary shadow-primary/30"
                  : "border-primary/40 bg-primary/40 shadow-transparent"
                  }`}
              >
                {/* Top specular highlight line when button is enabled */}
                {valid && <View pointerEvents="none" className="absolute inset-x-5 top-[3px] h-px bg-surface/40" />}
                {loading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text className="font-jakarta-bold text-heading-h5 text-surface">{t("common:actions.continue")}</Text>
                )}
              </Pressable>

              {/* Terms & Privacy Footer with bolded highlights via <Trans> */}
              <Text className="mt-4 text-center font-jakarta-medium text-para-micro text-text-secondary-muted">
                <Trans
                  t={t}
                  i18nKey="register.terms"
                  components={{ bold: <Text className="font-jakarta-bold text-text-dark" /> }}
                />
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View >
  );
}