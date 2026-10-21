// nativeApp\src\features\auth\hooks\use-pin-entry.ts

import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export const PIN_LENGTH = 4;

type Helpers = { fail: (message: string) => void; reset: () => void };

type Options = {
  onComplete: (pin: string, helpers: Helpers) => void;
  disabled?: boolean;
  length?: number;
};

/** PIN input state for the keypad: digits, error message and the shake animation. */
export function usePinEntry({ onComplete, disabled = false, length = PIN_LENGTH }: Options) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake] = useState(() => new Animated.Value(0));
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  });

  const reset = () => {
    setPin("");
    setError(null);
  };

  const fail = (message: string) => {
    setError(message);
    Animated.sequence([
      Animated.timing(shake, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start(() => setPin(""));
  };

  useEffect(() => {
    if (pin.length !== length) return;
    // short pause so the last dot fills before moving on
    const timeout = setTimeout(() => completeRef.current(pin, { fail, reset }), 160);
    return () => clearTimeout(timeout);
    // fail/reset only use stable setters and the shake value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, length]);

  const press = (key: string) => {
    if (disabled) return;
    setError(null);
    if (key === "back") setPin((current) => current.slice(0, -1));
    else setPin((current) => (current.length < length ? current + key : current));
  };

  const clear = () => {
    if (!disabled) setPin("");
  };

  return { pin, error, shake, length, press, clear, reset, fail };
}
