// nativeApp\src\app\(auth)\register.tsx

import { router } from "expo-router";
import RegisterScreen from "@/features/auth/components/register-screen";

export default function RegisterRoute() {
  return (
    <RegisterScreen
      // check-phone decided: registered numbers log in, new numbers create a PIN (then register)
      onContinue={(phone, next) =>
        router.push({ pathname: next === "login" ? "/(auth)/login-pin" : "/(auth)/setup-pin", params: { phone } })
      }
    />
  );
}
