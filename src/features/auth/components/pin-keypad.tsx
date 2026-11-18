// nativeApp\src\features\auth\components\pin-keypad.tsx

import { LinearGradient } from "expo-linear-gradient";
import { Delete, type LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { colors } from "@/theme/tokens";

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "back"],
];

type Props = {
  onKey: (key: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  /** Fills the empty bottom-left key, e.g. a fingerprint button. */
  biometric?: { icon: LucideIcon; label: string; onPress: () => void };
};

/** Round number keys on a soft grey disc; the pressed key turns into a glossy red 3D button. */
export function PinKeypad({ onKey, onClear, disabled, biometric }: Props) {
  const { t } = useTranslation("auth");
  const compact = useWindowDimensions().height < 700;
  const key = compact ? 56 : 62; // key diameter
  const row = compact ? 66 : 74; // row pitch

  return (
    // dialer order (1 2 3 left to right) in Urdu too, like the phone's own number pad
    <View className="w-full self-center" style={{ maxWidth: 320, opacity: disabled ? 0.55 : 1, direction: "ltr" }}>
      {ROWS.map((cells, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {cells.map((cell, index) => {
            if (cell === "") {
              if (!biometric) return <View key={index} className="flex-1" style={{ height: row }} />;
              const Icon = biometric.icon;
              return (
                <Pressable
                  key={index}
                  onPress={biometric.onPress}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={biometric.label}
                  className="flex-1 items-center justify-center"
                  style={{ height: row }}
                >
                  {({ pressed }) => (
                    <View
                      className={`items-center justify-center rounded-full ${pressed ? "bg-primary/10" : ""}`}
                      style={{ width: key, height: key }}
                    >
                      <Icon size={30} color={colors.primary} strokeWidth={1.8} />
                    </View>
                  )}
                </Pressable>
              );
            }

            const isBack = cell === "back";
            return (
              <Pressable
                key={index}
                onPress={() => onKey(cell)}
                onLongPress={isBack ? onClear : undefined}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={isBack ? t("pin.delete") : cell}
                className="flex-1 items-center justify-center"
                style={{ height: row }}
              >
                {({ pressed }) =>
                  isBack ? (
                    <View
                      className={`items-center justify-center rounded-full ${pressed ? "bg-surface-muted" : ""}`}
                      style={{ width: key, height: key }}
                    >
                      <Delete size={26} color={colors["text-dark"]} strokeWidth={1.9} />
                    </View>
                  ) : pressed ? (
                    // pressed: glossy red disc, slightly larger, with a soft red glow
                    // Shadow is inline on purpose: toggling a shadow-* class on press makes NativeWind
                    // "upgrade" (remount) the view mid-render, which crashes on native.
                    <View
                      style={{
                        width: key + 4,
                        height: key + 4,
                        margin: -2,
                        borderRadius: (key + 4) / 2,
                        backgroundColor: colors.primary, // solid fill so the Android elevation shadow renders
                        shadowColor: colors.primary,
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 8,
                      }}
                    >
                      <LinearGradient
                        colors={["#F2506F", colors.primary]}
                        start={{ x: 0.3, y: 0 }}
                        end={{ x: 0.7, y: 1 }}
                        style={{ flex: 1, borderRadius: (key + 4) / 2, alignItems: "center", justifyContent: "center" }}
                      >
                        <Text className="font-jakarta-semibold text-[27px] leading-[34px] text-white">{cell}</Text>
                      </LinearGradient>
                    </View>
                  ) : (
                    <View
                      className="items-center justify-center rounded-full bg-surface-muted"
                      style={{ width: key, height: key }}
                    >
                      <Text className="font-jakarta-semibold text-[27px] leading-[34px] text-text-dark">{cell}</Text>
                    </View>
                  )
                }
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
