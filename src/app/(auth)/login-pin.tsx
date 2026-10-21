// nativeApp\src\app\(auth)\login-pin.tsx

import { router, useLocalSearchParams } from "expo-router";

import LoginPinScreen from "@/features/auth/components/login-pin-screen";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useAppStore } from "@/stores/app-store";

export default function LoginPinRoute() {
  const { phone = "" } = useLocalSearchParams<{ phone: string }>();
  const signIn = useAuthStore((s) => s.signIn);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <LoginPinScreen
      phone={phone}
      onBack={() => router.back()}
      onSuccess={() => {
        signIn(phone);
        completeOnboarding();
        // let the "Logged in successfully." line show for a moment
        setTimeout(() => router.replace("/home"), 500);
      }}
      // TODO: forgot-PIN flow (OTP verification, then setup-pin)
      onForgotPin={() => { }}
    />
  );
}