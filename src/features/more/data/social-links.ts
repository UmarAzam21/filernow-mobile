// nativeApp\src\features\more\data\social-links.ts

import type { EmIconName } from "@/constants/expense-manager-icons";

export type SocialLink = { id: string; label: string; icon: EmIconName; url?: string };

// TODO: add the real page URLs; without one, tapping shows "coming soon".
export const SOCIAL_LINKS: SocialLink[] = [
    { id: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
    { id: "facebook", label: "Facebook", icon: "facebook" },
    { id: "youtube", label: "YouTube", icon: "youtube" },
];
