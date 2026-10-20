import { router, useLocalSearchParams } from "expo-router";
import SetupPinScreen from "@/features/auth/components/setup-pin-screen";

export default function SetupPinRoute() {
  const { phone = "" } = useLocalSearchParams<{ phone: string }>();

  return (
    <SetupPinScreen
      phone={phone}
      onBack={() => router.back()}
      // TODO: router.replace to the home tabs once they exist
      onComplete={() => {}}
    />
  );
}
