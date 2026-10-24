// nativeApp\src\app\(tabs)\khata\party\[slug]\index.tsx

import { useLocalSearchParams } from "expo-router";

import { PlaceholderScreen } from "@/components/ui/placeholder-screen";
import { useKhataStore } from "@/features/khata/store/khata-store";

export default function PartyDetail() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const name = useKhataStore((s) => s.parties.find((p) => p.slug === slug || p.id === slug)?.name);
    return (
        <PlaceholderScreen
            title={name ?? "Party"}
            headerTitle={name ?? "Party"}
            note="Ledger and entries arriving soon..."
        />
    );
}