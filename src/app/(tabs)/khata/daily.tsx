// nativeApp\src\app\(tabs)\khata\daily.tsx

import { useTranslation } from "react-i18next";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";

export default function Daily() {
    const { t } = useTranslation("khata");
    const title = t("sections.daily.title");
    return <PlaceholderScreen title={title} headerTitle={title} />;
}
