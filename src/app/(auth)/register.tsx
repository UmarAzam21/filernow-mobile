// nativeApp\src\app\(auth)\register.tsx

import { router } from "expo-router";
import RegisterScreen from "@/features/auth/components/register-screen";

export default function RegisterRoute() {
  return (
    <RegisterScreen
      onContinue={(phone, exists) =>
        router.push({ pathname: exists ? "/(auth)/login-pin" : "/(auth)/setup-pin", params: { phone } })
      }
    />
  );
}
