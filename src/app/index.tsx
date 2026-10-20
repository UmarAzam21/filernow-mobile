// nativeApp\src\app\index.tsx

// TODO: send to the tabs once onboarding is completed (persisted flag)
import { Redirect } from "expo-router";

import { useAppStore } from "@/stores/app-store";

export default function Index() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  return <Redirect href={hasOnboarded ? "/home" : "/welcome"} />;
}