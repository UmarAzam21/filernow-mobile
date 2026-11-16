// nativeApp\src\app\index.tsx

import { Redirect } from "expo-router";

import { useIsSignedIn } from "@/features/auth/store/auth-store";
import { useAppStore } from "@/stores/app-store";

export default function Index() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const isSignedIn = useIsSignedIn();

  if (isSignedIn) return <Redirect href="/home" />;
  // return <Redirect href={hasOnboarded ? "/register" : "/welcome"} />;
  return <Redirect href="/welcome" />;
}