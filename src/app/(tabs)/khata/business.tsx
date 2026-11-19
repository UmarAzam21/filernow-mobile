// nativeApp\src\app\(tabs)\khata\business.tsx

import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";
import { DataModeBar } from "@/features/khata/components/data-mode-bar";

export default function Business() {
    const { t } = useTranslation("khata");
    const title = t("sections.business.title");
    return (
        <View className="flex-1 bg-page-bg">
            <DataModeBar />
            <PlaceholderScreen title={title} headerTitle={title} />
        </View>
    );
}
