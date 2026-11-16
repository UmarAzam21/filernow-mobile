// nativeApp\src\app\(auth)\login-pin.tsx

import { router, useLocalSearchParams } from "expo-router";

import LoginPinScreen from "@/features/auth/components/login-pin-screen";
import { offerBiometricLogin } from "@/features/biometric/lib/offer-biometric-login";
import { useAppStore } from "@/stores/app-store";

export default function LoginPinRoute() {
  const { phone = "" } = useLocalSearchParams<{ phone: string }>();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <LoginPinScreen
      phone={phone}
      onBack={() => router.back()}
      onChangeNumber={() => router.back()}
      onSuccess={() => {
        // the session (token, businesses) is already stored by the login call
        completeOnboarding();
        // let the "Logged in successfully." line show for a moment
        setTimeout(async () => {
          await offerBiometricLogin(phone);
          router.replace("/home");
        }, 500);
      }}
      // TODO: forgot-PIN flow (OTP verification, then setup-pin)
      onForgotPin={() => { }}
    />
  );
}