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
import i18n from "@/i18n";
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
// store messages follow the app language
const t = i18n.getFixedT(null, "khata", "toast");

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
                            t("cardBalance", {
                                card: card.label,
                                change: `${d > 0 ? "+" : "-"}${money(Math.abs(d))}`,
                                balance: money(card.balance + d),
                            }),
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
                    toast.success(t("demoLoaded"));
                },

                resetToBlank: () => {
                    set({ entries: [], cards: [], parties: [], dataMode: "blank" });
                    toast.success(t("cleared"));
                },

                addEntry: (entry) => {
                    const clean = entry.kind === "debt" ? { ...entry, cardId: undefined } : entry;
                    set((s) => ({
                        entries: [{ ...clean, id: newId(), createdAt: new Date().toISOString() }, ...s.entries],
                    }));
                    toast.success(t("saved", { name: entry.subject }));
                    if (clean.cardId) applyCardDeltas({ [clean.cardId]: cardDelta(clean) });
                },

                updateEntry: (id, patch) => {
                    const old = get().entries.find((e) => e.id === id);
                    if (!old) return;

                    const updated = { ...old, ...patch };
                    set((s) => ({ entries: s.entries.map((e) => (e.id === id ? updated : e)) }));
                    toast.success(t("updated", { name: updated.subject }));

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
                    toast.success(t("deleted", { name: target.subject }));

                    if (target.cardId && target.kind !== "debt") {
                        applyCardDeltas({ [target.cardId]: -cardDelta(target) });
                    }
                },

                addParty: (p) => {
                    const party: IParty = { ...p, id: newId(), slug: makeSlug(p.name), createdAt: new Date().toISOString() };
                    set((s) => ({ parties: [party, ...s.parties] }));
                    toast.success(t("partyAdded", { name: party.name }));
                    return party;
                },

                addParties: (list) => {
                    const now = new Date().toISOString();
                    const created: IParty[] = list.map((p) => ({ ...p, id: newId(), slug: makeSlug(p.name), createdAt: now }));
                    set((s) => ({ parties: [...created, ...s.parties] }));
                    toast.success(t("partiesAdded", { count: created.length }));
                    return created.length;
                },

                updateParty: (id, patch) =>
                    set((s) => ({ parties: s.parties.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

                deleteParty: (id, withEntries = false) => {
                    const linked = get().entries.filter((e) => e.partyId === id);
                    if (linked.length && !withEntries) {
                        toast.error(t("partyHasEntries"));
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
                    toast.success(
                        linked.length ? t("partyDeletedWithEntries", { count: linked.length }) : t("partyDeleted"),
                    );
                    return true;
                },

                addCategory: (label, color, kind) => {
                    const clean = label.trim();
                    if (get().categories.some((c) => c.kind === kind && c.label.toLowerCase() === clean.toLowerCase())) {
                        toast.error(t("categoryExists", { name: clean }));
                        return;
                    }
                    set((s) => ({ categories: [...s.categories, { id: newId(), label: clean, color, kind }] }));
                    toast.success(t("categoryAdded", { name: clean }));
                },

                updateCategory: (id, patch) =>
                    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

                deleteCategory: (id) => {
                    const { categories } = get();
                    const target = categories.find((c) => c.id === id);
                    if (!target) return;

                    if (target.kind === "debt") {
                        toast.error(t("debtCategoryLocked"));
                        return;
                    }
                    const fallback = categories.find((c) => c.kind === target.kind && c.label === "Other" && c.id !== id);
                    if (!fallback) {
                        toast.error(t("otherCategoryLocked"));
                        return;
                    }
                    set((s) => ({
                        entries: s.entries.map((e) => (e.categoryId === id ? { ...e, categoryId: fallback.id } : e)),
                        categories: s.categories.filter((c) => c.id !== id),
                    }));
                    toast.success(t("categoryDeleted", { name: target.label }));
                },

                addCard: (card) => {
                    if (get().cards.length >= MAX_CARDS) {
                        toast.error(t("maxCards", { count: MAX_CARDS }));
                        return;
                    }
                    set((s) => ({ cards: [...s.cards, { ...card, id: newId() }] }));
                    toast.success(t("cardAdded", { name: card.label }));
                },

                updateCard: (id, patch) => {
                    set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
                    toast.success(t("cardUpdated"));
                },

                deleteCard: (id) => {
                    const target = get().cards.find((c) => c.id === id);
                    set((s) => ({
                        cards: s.cards.filter((c) => c.id !== id),
                        entries: s.entries.map((e) => (e.cardId === id ? { ...e, cardId: undefined } : e)),
                    }));
                    if (target) toast.success(t("deleted", { name: target.label }));
                },

                adjustCardBalance: (id, delta) =>
                    set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, balance: c.balance + delta } : c)) })),

                transferBetweenCards: (fromId, toId, amount) => {
                    const { cards } = get();
                    const from = cards.find((c) => c.id === fromId);
                    const to = cards.find((c) => c.id === toId);

                    if (!from || !to || fromId === toId || amount <= 0) {
                        toast.error(t("differentCards"));
                        return;
                    }
                    if (from.balance < amount) {
                        toast.error(t("notEnoughBalance", { name: from.label }));
                        return;
                    }
                    set({
                        cards: cards.map((c) =>
                            c.id === fromId ? { ...c, balance: c.balance - amount }
                                : c.id === toId ? { ...c, balance: c.balance + amount }
                                    : c,
                        ),
                    });
                    toast.success(t("transferred", { amount: money(amount), from: from.label, to: to.label }));
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