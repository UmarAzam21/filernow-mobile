// nativeApp\src\app\(tabs)\settings.tsx

import { Alert, Pressable, Text, View } from "react-native";

import { maskPhone } from "@/features/auth/lib/phone";
import { useAuthStore } from "@/features/auth/store/auth-store";

export default function Settings() {
    const phone = useAuthStore((s) => s.phone);
    const signOut = useAuthStore((s) => s.signOut);

    const confirmLogout = () =>
        Alert.alert("Log out?", "Aap ko dobara PIN se login karna hoga.", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: signOut },
        ]);

    return (
        <View className="flex-1 bg-page-bg">
            <View className="p-4">
                <Text className="font-jakarta-extrabold text-xl text-text-dark">Settings</Text>
                {phone ? (
                    <Text className="mt-1 font-jakarta text-sm text-text-secondary">{maskPhone(phone)}</Text>
                ) : null}

                <Pressable
                    accessibilityRole="button"
                    onPress={confirmLogout}
                    className="mt-6 min-h-12 items-center justify-center rounded-brand-8 border border-red-600 bg-red-50 active:opacity-80">
                    <Text className="font-jakarta-bold text-sm text-red-600">Log out</Text>
                </Pressable>
            </View>
        </View>
    );
}