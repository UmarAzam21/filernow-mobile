// nativeApp\src\app\index.tsx

import { Redirect } from "expo-router";

// TODO: send to the tabs once onboarding is completed (persisted flag)
export default function Index() {
  return <Redirect href="/welcome" />;
}