// nativeApp\src\features\party\lib\party-contact.ts

import { Linking, Platform } from "react-native";

import type { IParty } from "@/features/khata/types";

/** "03001234567" or "+923001234567" -> "923001234567" (wa.me format). */
export const waDigits = (phone?: string) => phone?.replace(/\D/g, "").replace(/^0/, "92");

export function contactBlockReason(party: IParty, balance: number) {
    if (!waDigits(party.phone)) return "Is party ka phone number save nahi hai";
    if (balance === 0) return "Hisaab barabar hai, reminder ki zaroorat nahi";
    return null;
}

export function reminderText(party: IParty, balance: number) {
    const amount = Math.abs(balance).toLocaleString("en-PK");
    return balance > 0
        ? `Assalam o Alaikum ${party.name}, hamare khate ke mutabiq aap ki taraf Rs ${amount} baqaya hain. Meherbani karke ada kar dein.`
        : `Assalam o Alaikum ${party.name}, hamare khate ke mutabiq mujh par aap ke Rs ${amount} baqaya hain.`;
}

export const openWhatsApp = (digits: string, text: string) =>
    Linking.openURL(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`);

export const openSms = (phone: string, text: string) =>
    Linking.openURL(`sms:${phone}${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(text)}`);