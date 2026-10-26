// nativeApp\src\features\khata\store\khata-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { defaultCategories } from "@/features/khata/data/defaultCategoriesData";
import { dummyCards } from "@/features/khata/data/dummyCards";
import { dummyExpenseEntries, dummyParties } from "@/features/khata/data/dummyExpenseEntries";
import { cardDelta } from "@/features/khata/lib/cardDelta";
import {
    type EntryKind,
    type ICard,
    type ICategory,
    type IExpenseEntry,
    type IParty,
    type NewParty,
    MAX_CARDS,
} from "@/features/khata/types";
import { makeSlug } from "@/features/party/lib/party";
import { newId } from "@/lib/id";
import { toast } from "@/lib/toast";

type DataMode = "demo" | "blank";

type KhataState = {
    entries: IExpenseEntry[];
    categories: ICategory[];
    cards: ICard[];
    parties: IParty[];
    dataMode: DataMode;

    loadDemoData: () => void;
    resetToBlank: () => void;

    addEntry: (entry: Omit<IExpenseEntry, "id">) => void;
    updateEntry: (id: string, patch: Partial<IExpenseEntry>) => void;
    deleteEntry: (id: string) => void;

    addParty: (p: NewParty) => IParty;
    addParties: (list: NewParty[]) => number;
    updateParty: (id: string, patch: Partial<IParty>) => void;
    deleteParty: (id: string, withEntries?: boolean) => boolean;

    addCategory: (label: string, color: ICategory["color"], kind: EntryKind) => void;
    updateCategory: (id: string, patch: Partial<ICategory>) => void;
    deleteCategory: (id: string) => void;

    addCard: (card: Omit<ICard, "id">) => void;
    updateCard: (id: string, patch: Partial<ICard>) => void;
    deleteCard: (id: string) => void;
    adjustCardBalance: (id: string, delta: number) => void;
    transferBetweenCards: (fromId: string, toId: string, amount: number) => void;
};

const money = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

// Select primitives or stable references only: useKhataStore((s) => s.parties).
// Selectors that build new objects/arrays need useShallow, or React 19 will loop.
export const useKhataStore = create<KhataState>()(
    persist(
        (set, get) => {
            // ONE place that changes card balances + shows the balance toast.
            const applyCardDeltas = (deltas: Record<string, number>) => {
                const touched = Object.entries(deltas).filter(([, d]) => d !== 0);
                if (touched.length === 0) return;

                const before = get().cards;
                set({
                    cards: before.map((c) => (deltas[c.id] ? { ...c, balance: c.balance + deltas[c.id] } : c)),
                });

                touched.forEach(([id, d]) => {
                    const card = before.find((c) => c.id === id);
                    if (card) {
                        toast.success(
                            `${card.label}: ${d > 0 ? "+" : "-"}${money(Math.abs(d))} (naya balance ${money(card.balance + d)})`,
                        );
                    }
                });
            };

            return {
                entries: [],
                categories: defaultCategories,
                cards: [],
                parties: [],
                dataMode: "blank",

                loadDemoData: () => {
                    set({ entries: dummyExpenseEntries, cards: dummyCards, parties: dummyParties, dataMode: "demo" });
                    toast.success("Demo data load ho gaya");
                },

                resetToBlank: () => {
                    set({ entries: [], cards: [], parties: [], dataMode: "blank" });
                    toast.success("Khata saaf ho gaya. Naye sire se shuru karein");
                },

                addEntry: (entry) => {
                    const clean = entry.kind === "debt" ? { ...entry, cardId: undefined } : entry;
                    set((s) => ({
                        entries: [{ ...clean, id: newId(), createdAt: new Date().toISOString() }, ...s.entries],
                    }));
                    toast.success(`${entry.subject} save ho gaya`);
                    if (clean.cardId) applyCardDeltas({ [clean.cardId]: cardDelta(clean) });
                },

                updateEntry: (id, patch) => {
                    const old = get().entries.find((e) => e.id === id);
                    if (!old) return;

                    const updated = { ...old, ...patch };
                    set((s) => ({ entries: s.entries.map((e) => (e.id === id ? updated : e)) }));
                    toast.success(`${updated.subject} update ho gaya`);

                    // Debt card effects are ledger-style (never recomputed on edit).
                    if (updated.kind !== "debt") {
                        const deltas: Record<string, number> = {};
                        if (old.cardId) deltas[old.cardId] = (deltas[old.cardId] ?? 0) - cardDelta(old);
                        if (updated.cardId) deltas[updated.cardId] = (deltas[updated.cardId] ?? 0) + cardDelta(updated);
                        applyCardDeltas(deltas);
                    }
                },

                deleteEntry: (id) => {
                    const target = get().entries.find((e) => e.id === id);
                    if (!target) return;

                    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
                    toast.success(`${target.subject} delete ho gaya`);

                    if (target.cardId && target.kind !== "debt") {
                        applyCardDeltas({ [target.cardId]: -cardDelta(target) });
                    }
                },

                addParty: (p) => {
                    const party: IParty = { ...p, id: newId(), slug: makeSlug(p.name), createdAt: new Date().toISOString() };
                    set((s) => ({ parties: [party, ...s.parties] }));
                    toast.success(`${party.name} add ho gaya`);
                    return party;
                },

                addParties: (list) => {
                    const now = new Date().toISOString();
                    const created: IParty[] = list.map((p) => ({ ...p, id: newId(), slug: makeSlug(p.name), createdAt: now }));
                    set((s) => ({ parties: [...created, ...s.parties] }));
                    toast.success(`${created.length} parties add ho gayin`);
                    return created.length;
                },

                updateParty: (id, patch) =>
                    set((s) => ({ parties: s.parties.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

                deleteParty: (id, withEntries = false) => {
                    const linked = get().entries.filter((e) => e.partyId === id);
                    if (linked.length && !withEntries) {
                        toast.error("Is party ki entries maujood hain, pehle woh delete karein");
                        return false;
                    }
                    if (linked.length) {
                        // undo card effects of linked income/expense entries (debt never touches cards)
                        const deltas: Record<string, number> = {};
                        linked.forEach((e) => {
                            if (e.kind !== "debt" && e.cardId) deltas[e.cardId] = (deltas[e.cardId] ?? 0) - cardDelta(e);
                        });
                        applyCardDeltas(deltas);
                        set((s) => ({ entries: s.entries.filter((e) => e.partyId !== id) }));
                    }
                    set((s) => ({ parties: s.parties.filter((p) => p.id !== id) }));
                    toast.success(linked.length ? `Party aur ${linked.length} entries delete ho gayin` : "Party delete ho gayi");
                    return true;
                },

                addCategory: (label, color, kind) => {
                    const clean = label.trim();
                    if (get().categories.some((c) => c.kind === kind && c.label.toLowerCase() === clean.toLowerCase())) {
                        toast.error(`"${clean}" pehle se maujood hai`);
                        return;
                    }
                    set((s) => ({ categories: [...s.categories, { id: newId(), label: clean, color, kind }] }));
                    toast.success(`${clean} category add ho gayi`);
                },

                updateCategory: (id, patch) =>
                    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

                deleteCategory: (id) => {
                    const { categories } = get();
                    const target = categories.find((c) => c.id === id);
                    if (!target) return;

                    if (target.kind === "debt") {
                        toast.error("Udhaar categories delete nahi ho sakti");
                        return;
                    }
                    const fallback = categories.find((c) => c.kind === target.kind && c.label === "Other" && c.id !== id);
                    if (!fallback) {
                        toast.error(`"Other" category delete nahi ho sakti`);
                        return;
                    }
                    set((s) => ({
                        entries: s.entries.map((e) => (e.categoryId === id ? { ...e, categoryId: fallback.id } : e)),
                        categories: s.categories.filter((c) => c.id !== id),
                    }));
                    toast.success(`${target.label} delete ho gayi (entries "Other" me chali gayin)`);
                },

                addCard: (card) => {
                    if (get().cards.length >= MAX_CARDS) {
                        toast.error(`Sirf ${MAX_CARDS} cards add ho sakte hain`);
                        return;
                    }
                    set((s) => ({ cards: [...s.cards, { ...card, id: newId() }] }));
                    toast.success(`${card.label} add ho gaya`);
                },

                updateCard: (id, patch) => {
                    set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
                    toast.success("Card update ho gaya");
                },

                deleteCard: (id) => {
                    const target = get().cards.find((c) => c.id === id);
                    set((s) => ({
                        cards: s.cards.filter((c) => c.id !== id),
                        entries: s.entries.map((e) => (e.cardId === id ? { ...e, cardId: undefined } : e)),
                    }));
                    if (target) toast.success(`${target.label} delete ho gaya`);
                },

                adjustCardBalance: (id, delta) =>
                    set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, balance: c.balance + delta } : c)) })),

                transferBetweenCards: (fromId, toId, amount) => {
                    const { cards } = get();
                    const from = cards.find((c) => c.id === fromId);
                    const to = cards.find((c) => c.id === toId);

                    if (!from || !to || fromId === toId || amount <= 0) {
                        toast.error("Alag alag cards chunein");
                        return;
                    }
                    if (from.balance < amount) {
                        toast.error(`${from.label} me itna balance nahi hai`);
                        return;
                    }
                    set({
                        cards: cards.map((c) =>
                            c.id === fromId ? { ...c, balance: c.balance - amount }
                                : c.id === toId ? { ...c, balance: c.balance + amount }
                                    : c,
                        ),
                    });
                    toast.success(`${money(amount)} ${from.label} se ${to.label} me transfer hue`);
                },
            };
        },
        {
            name: "filernow-khata",
            version: 1, // bump + add `migrate` when stored shapes are renamed/removed
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s) => ({
                entries: s.entries,
                categories: s.categories,
                cards: s.cards,
                parties: s.parties,
                dataMode: s.dataMode,
            }),
        },
    ),
);