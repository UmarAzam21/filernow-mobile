// nativeApp\src\app\(auth)\setup-pin.tsx

import { router, useLocalSearchParams } from "expo-router";

import SetupPinScreen from "@/features/auth/components/setup-pin-screen";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useAppStore } from "@/stores/app-store";

export default function SetupPinRoute() {
  const { phone = "" } = useLocalSearchParams<{ phone: string }>();
  const signIn = useAuthStore((s) => s.signIn);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <SetupPinScreen
      phone={phone}
      onBack={() => router.back()}
      onComplete={() => {
        signIn(phone);
        completeOnboarding();
        setTimeout(() => router.replace("/home"), 500);
      }}
    />
  );
}