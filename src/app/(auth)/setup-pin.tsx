// nativeApp\src\app\(auth)\setup-pin.tsx

import { router, useLocalSearchParams } from "expo-router";

import SetupPinScreen from "@/features/auth/components/setup-pin-screen";
import { offerBiometricLogin } from "@/features/biometric/lib/offer-biometric-login";
import { useCelebrationStore } from "@/features/celebration/store/celebration-store";
import { useAppStore } from "@/stores/app-store";

export default function SetupPinRoute() {
  const { phone = "" } = useLocalSearchParams<{ phone: string }>();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const playCelebration = useCelebrationStore((s) => s.play);

  return (
    <SetupPinScreen
      phone={phone}
      onBack={() => router.back()}
      onComplete={() => {
        // the session (token, first business) is already stored by the register call
        completeOnboarding();
        setTimeout(async () => {
          await offerBiometricLogin(phone);
          router.replace("/home");
          playCelebration();
        }, 500);
      }}
    />
  );
}