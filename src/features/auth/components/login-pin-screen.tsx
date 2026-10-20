import { LockKeyhole, Smartphone } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { usePinEntry } from "../hooks/use-pin-entry";
import { verifyPin } from "../lib/mock-auth";
import { maskPhone } from "../lib/phone";
import { PinDots } from "./pin-dots";
import { PinKeypad } from "./pin-keypad";
import { PinScreenLayout } from "./pin-screen-layout";

const MAX_ATTEMPTS = 5;

type Props = {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
  onForgotPin?: () => void;
};

/** Login for a registered number: enter the existing PIN. */
export default function LoginPinScreen({ phone, onBack, onSuccess, onForgotPin }: Props) {
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
        if (await verifyPin(phone, pin)) {
          setDone(true);
          onSuccess();
          return;
        }
        const left = attemptsLeft - 1;
        setAttemptsLeft(left);
        fail(
          left === 0
            ? "Too many attempts. Reset your PIN to continue."
            : `Incorrect PIN. ${left} ${left === 1 ? "attempt" : "attempts"} left.`,
        );
      } catch {
        fail("Couldn't verify your PIN. Check your connection.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <PinScreenLayout
      icon={LockKeyhole}
      title="Welcome back"
      subtitle="Enter your PIN to log in."
      onBack={onBack}
      keypad={<PinKeypad onKey={entry.press} onClear={entry.clear} disabled={disabled} />}
    >
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Change mobile number"
        className="mt-4 flex-row items-center gap-2 rounded-full border border-[#F3D3D6] bg-white/85 py-2 pl-3 pr-3.5 active:opacity-80"
      >
        <Smartphone size={14} color="#D3222C" strokeWidth={2.2} />
        <Text className="font-jakarta-bold text-[13px] text-[#151A23]">{maskPhone(phone)}</Text>
        <Text className="font-jakarta-bold text-[13px] text-[#D3222C]">Change</Text>
      </Pressable>

      <PinDots
        length={entry.length}
        filled={entry.pin.length}
        error={entry.error}
        shake={entry.shake}
        loading={loading}
        success={done ? "Logged in successfully." : null}
      />

      <Pressable onPress={onForgotPin} accessibilityRole="button" hitSlop={10} className="mt-1 active:opacity-70">
        <Text className="font-jakarta-bold text-sm text-[#D3222C]">Forgot PIN?</Text>
      </Pressable>
    </PinScreenLayout>
  );
}
