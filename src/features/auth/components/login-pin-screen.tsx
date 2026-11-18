// nativeApp\src\features\auth\components\login-pin-screen.tsx

import { FingerprintPattern, ScanFace, Smartphone } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";

import { useBiometric } from "@/features/biometric/hooks/use-biometric";
import { apiErrorMessage } from "@/lib/api/errors";
import { colors } from "@/theme/tokens";

import { usePinEntry } from "../hooks/use-pin-entry";
import { maskPhone } from "../lib/phone";
import { loginWithPin, restoreBiometricSession } from "../lib/session";
import { PinDots } from "./pin-dots";
import { PinKeypad } from "./pin-keypad";
import { PinScreenLayout } from "./pin-screen-layout";

const MAX_ATTEMPTS = 5;

type Props = {
  phone: string;
  /** Top-left back button; omitted on the App Lock screen. */
  onBack?: () => void;
  /** The "Change" link next to the number. */
  onChangeNumber: () => void;
  onSuccess: () => void;
  onForgotPin?: () => void;
};

/** Login (and the App Lock screen): enter the PIN or use biometrics. Opens a server session. */
export default function LoginPinScreen({
  phone,
  onBack,
  onChangeNumber,
  onSuccess,
  onForgotPin,
}: Props) {
  const { t } = useTranslation("auth");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const locked = attemptsLeft === 0;
  const disabled = loading || done || locked;

  const entry = usePinEntry({
    disabled,
    onComplete: async (pin, { fail }) => {
      setLoading(true);
      try {
        if (await loginWithPin(phone, pin)) {
          setDone(true);
          onSuccess();
          return;
        }
        const left = attemptsLeft - 1;
        setAttemptsLeft(left);
        // Get Started already confirmed the number is registered, so a 401 means a wrong PIN
        fail(left === 0 ? t("pin.tooManyAttempts") : t("pin.incorrect", { count: left }));
      } catch (e) {
        fail(apiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
  });

  const biometric = useBiometric(phone);
  const autoPrompted = useRef(false);

  const loginWithBiometric = async () => {
    if (disabled) return;
    const result = await biometric.authenticate(t("biometric.loginPrompt"));
    if (!result.success) {
      if (!result.cancelled) entry.fail(result.message);
      return;
    }
    setLoading(true);
    try {
      // resume the server session kept for biometrics; if it expired, the PIN is needed once
      if (await restoreBiometricSession(phone)) {
        setDone(true);
        onSuccess();
      } else {
        entry.fail(t("biometric.sessionExpired"));
      }
    } catch (e) {
      entry.fail(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  // open the biometric prompt once on arrival; cancelling it leaves the PIN pad
  useEffect(() => {
    if (!biometric.enabled || autoPrompted.current) return;
    autoPrompted.current = true;
    loginWithBiometric();
    // loginWithBiometric only reads state that is fixed before the first prompt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometric.enabled]);

  return (
    <PinScreenLayout
      title={t("pin.loginTitle")}
      subtitle={
        biometric.enabled
          ? t("pin.loginSubtitleBiometric", { method: biometric.label })
          : t("pin.loginSubtitle")
      }
      onBack={onBack}
      keypad={
        <PinKeypad
          onKey={entry.press}
          onClear={entry.clear}
          disabled={disabled}
          biometric={
            biometric.enabled
              ? {
                  icon: biometric.kind === "face" ? ScanFace : FingerprintPattern,
                  label: t("biometric.loginButton", { method: biometric.label }),
                  onPress: loginWithBiometric,
                }
              : undefined
          }
        />
      }
    >
      {/* White pill: phone icon, masked number and a pink "Change" label */}
      <Pressable
        onPress={onChangeNumber}
        accessibilityRole="button"
        accessibilityLabel={t("pin.changeNumberA11y")}
        className="mt-5 flex-row items-center rounded-full border border-border-clr/70 bg-white py-1 pl-4 pr-1 shadow-md shadow-black/10 active:opacity-80"
      >
        <Smartphone size={14} color={colors.primary} strokeWidth={2.2} />
        <Text
          className="ml-2 mr-2.5 font-jakarta-semibold text-[14px] text-text-dark"
          style={{ writingDirection: "ltr" }}
        >
          {maskPhone(phone)}
        </Text>
        <View className="px-3 py-1.5">
          <Text className="font-jakarta-bold text-[13px] text-primary">{t("pin.changeNumber")}</Text>
        </View>
      </Pressable>

      <PinDots
        length={entry.length}
        filled={entry.pin.length}
        error={entry.error}
        shake={entry.shake}
        loading={loading}
        success={done ? t("pin.loggedIn") : null}
      />

      <Pressable onPress={onForgotPin} accessibilityRole="button" hitSlop={10} className="mt-2 active:opacity-70">
        <Text className="font-jakarta-bold text-[14px] text-primary">{t("pin.forgot")}</Text>
      </Pressable>
    </PinScreenLayout>
  );
}
