import { router, useLocalSearchParams } from "expo-router";
import LoginPinScreen from "@/features/auth/components/login-pin-screen";

export default function LoginPinRoute() {
  const { phone = "" } = useLocalSearchParams<{ phone: string }>();

  return (
    <LoginPinScreen
      phone={phone}
      onBack={() => router.back()}
      // TODO: router.replace to the home tabs once they exist
      onSuccess={() => {}}
      // TODO: forgot-PIN flow (OTP verification, then setup-pin)
      onForgotPin={() => {}}
    />
  );
}
