// nativeApp\src\features\khata\store\khata-store.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { DEFAULT_BUSINESS_ID } from "@/features/business/data/business-options";
import { useBusinessStore } from "@/features/business/store/business-store";
import { expensesApi } from "@/features/khata/api/expenses-api";
import { dummyCards } from "@/features/khata/data/dummy-cards";
import { defaultCategories } from "@/features/khata/data/default-categories";
import { dummyExpenseEntries, dummyParties } from "@/features/khata/data/dummy-entries";
import {
    CARD_COLOR,
    type CardMeta,
    SERVER_ENTRY_PREFIX,
    apiTypeOf,
    cardTxnSum,
    categoryHex,
    linkCategories,
    toCard,
    toCategory,
    toEntry,
} from "@/features/khata/lib/server-mapping";
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
import i18n from "@/i18n";
import { apiErrorMessage } from "@/lib/api/errors";
import { newId } from "@/lib/id";
import { toast } from "@/lib/toast";

/**
 * Where Khata data lives:
 * - income/expense entries, cards, income/expense categories → the server (per business),
 *   cached here so the screens work offline and open instantly;
 * - Udhaar (debt) entries and parties → this phone only (the API has no parties yet).
 */

/** Phone-only data of ONE business. */
export type LocalData = { entries: IExpenseEntry[]; parties: IParty[] };
/** Server data of ONE business (last successful sync). */
export type RemoteData = { entries: IExpenseEntry[]; cards: ICard[]; categories: ICategory[]; syncedAt: string | null };
export type DataMode = "demo" | "blank";
export type DemoBusinessData = { entries: IExpenseEntry[]; parties: IParty[]; cards: ICard[]; categories: ICategory[] };

export const EMPTY_LOCAL: LocalData = { entries: [], parties: [] };
export const EMPTY_REMOTE: RemoteData = { entries: [], cards: [], categories: [], syncedAt: null };
export const EMPTY_DEMO_DATA: DemoBusinessData = { entries: [], parties: [], cards: [], categories: [] };

const DEBT_CATEGORIES = defaultCategories.filter((c) => c.kind === "debt");
const cardDelta = (entry: Pick<IExpenseEntry, "kind" | "amount">) =>
    entry.kind === "income" ? entry.amount : entry.kind === "expense" ? -entry.amount : 0;
const createDemoData = (): DemoBusinessData => ({
    entries: dummyExpenseEntries.map((entry) => ({ ...entry })),
    parties: dummyParties.map((party) => ({ ...party })),
    cards: dummyCards.map((card) => ({ ...card })),
    categories: defaultCategories.map((category) => ({ ...category })),
});

type NewEntry = Omit<IExpenseEntry, "id">;

type KhataState = {
    /** Categories of the ACTIVE business: server income/expense ones + the app's Udhaar types. */
    categories: ICategory[];
    /** Phone-only data per business id. */
    data: Record<string, LocalData>;
    /** Server data per business id. */
    remote: Record<string, RemoteData>;
    /** Card expiry/colour the server doesn't store, kept for cards added on this phone. */
    cardMeta: Record<string, CardMeta>;
    /** Editable, per-business local demo copy; never sent to the live account API. */
    demoData: Record<string, DemoBusinessData>;
    dataMode: Record<string, DataMode>;
    syncing: boolean;
    syncError: string | null;

    /** Reloads the active business's entries, cards and categories from the server. */
    sync: () => Promise<void>;
    loadDemoData: () => void;
    resetToBlank: () => void;
    /** Moves a business's phone-only data to a new id (pre-backend "my-expenses" → server id). */
    adoptBusinessData: (fromId: string, toId: string) => void;

    // All actions below work on the ACTIVE business. Server-backed ones resolve true on success.
    addEntry: (entry: NewEntry) => Promise<boolean>;
    updateEntry: (id: string, patch: Partial<IExpenseEntry>) => boolean;
    deleteEntry: (id: string) => boolean;

    addParty: (p: NewParty) => IParty;
    addParties: (list: NewParty[]) => number;
    updateParty: (id: string, patch: Partial<IParty>) => void;
    deleteParty: (id: string, withEntries?: boolean) => boolean;

    addCategory: (label: string, color: ICategory["color"], kind: EntryKind) => Promise<boolean>;
    deleteCategory: (id: string) => Promise<boolean>;

    addCard: (card: Omit<ICard, "id">) => Promise<boolean>;
    updateCard: (id: string, patch: Partial<ICard>) => Promise<boolean>;
    transferBetweenCards: (fromId: string, toId: string, amount: number) => Promise<boolean>;
};

type Persisted = Pick<KhataState, "categories" | "data" | "remote" | "cardMeta" | "demoData" | "dataMode">;

const money = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;
// store messages follow the app language
const t = i18n.getFixedT(null, "khata", "toast");

const activeId = () => useBusinessStore.getState().activeId;

// Select primitives or stable references only: useKhataStore((s) => s.categories).
export const useKhataStore = create<KhataState>()(
    persist(
        (set, get) => {
            const local = (): LocalData => get().data[activeId()] ?? EMPTY_LOCAL;
            const remote = (): RemoteData => get().remote[activeId()] ?? EMPTY_REMOTE;
            const demo = (): DemoBusinessData => get().demoData[activeId()] ?? EMPTY_DEMO_DATA;
            const isDemoMode = () => get().dataMode[activeId()] === "demo";
            const updateDemo = (patch: (d: DemoBusinessData) => Partial<DemoBusinessData>) => {
                const id = activeId();
                set((s) => {
                    const cur = s.demoData[id] ?? EMPTY_DEMO_DATA;
                    return { demoData: { ...s.demoData, [id]: { ...cur, ...patch(cur) } } };
                });
            };
            const updateLocal = (patch: (d: LocalData) => Partial<LocalData>) => {
                const id = activeId();
                set((s) => {
                    const cur = s.data[id] ?? EMPTY_LOCAL;
                    return { data: { ...s.data, [id]: { ...cur, ...patch(cur) } } };
                });
            };
            /** Runs a server write; on failure shows the API's message and resolves false. */
            const write = async (fn: () => Promise<unknown>, success: string) => {
                try {
                    await fn();
                } catch (e) {
                    toast.error(apiErrorMessage(e));
                    return false;
                }
                toast.success(success);
                await get().sync();
                return true;
            };

            return {
                categories: [...DEBT_CATEGORIES],
                data: {},
                remote: {},
                cardMeta: {},
                demoData: {},
                dataMode: {},
                syncing: false,
                syncError: null,

                sync: async () => {
                    if (!useAuthStore.getState().token) return;
                    const businessId = activeId();
                    set({ syncing: true, syncError: null });
                    try {
                        const [apiCategories, apiCards, apiEntries] = await Promise.all([
                            expensesApi.categories(),
                            expensesApi.cards(),
                            expensesApi.transactions(),
                        ]);
                        const cats = apiCategories.map(toCategory).filter((c): c is ICategory => c !== null);
                        const linked = linkCategories(cats, apiEntries);
                        const entries = apiEntries
                            .map((e) => toEntry(e, linked.idFor(e.expense_type === "Expense" ? "expense" : "income", e.category) ?? ""))
                            .filter((e): e is IExpenseEntry => e !== null);
                        const { cardMeta } = get();
                        const cards = apiCards.map((c, i) => toCard(c, i, entries, cardMeta[String(c.id)]));
                        const next: RemoteData = { entries, cards, categories: linked.all, syncedAt: new Date().toISOString() };
                        set((s) => ({
                            remote: { ...s.remote, [businessId]: next },
                            // only if the user didn't switch business while this was loading
                            ...(activeId() === businessId ? { categories: [...linked.all, ...DEBT_CATEGORIES] } : {}),
                        }));
                    } catch (e) {
                        // keep showing the cached data
                        set({ syncError: apiErrorMessage(e) });
                    } finally {
                        set({ syncing: false });
                    }
                },

                loadDemoData: () => {
                    const id = activeId();
                    set((s) => ({
                        demoData: { ...s.demoData, [id]: createDemoData() },
                        dataMode: { ...s.dataMode, [id]: "demo" },
                    }));
                    toast.success(t("demoLoaded"));
                },

                resetToBlank: () => {
                    set((s) => {
                        const id = activeId();
                        const demoData = { ...s.demoData };
                        delete demoData[id];
                        return {
                            dataMode: { ...s.dataMode, [id]: "blank" },
                            demoData,
                        };
                    });
                    toast.success(t("cleared"));
                },

                adoptBusinessData: (fromId, toId) =>
                    set((s) => {
                        const from = s.data[fromId];
                        if (!from || fromId === toId || s.data[toId]) return s;
                        const { [fromId]: _moved, ...rest } = s.data;
                        return { data: { ...rest, [toId]: from } };
                    }),

                addEntry: async (entry) => {
                    if (isDemoMode()) {
                        if (entry.kind === "expense" && !entry.cardId) {
                            toast.error(t("cardRequired"));
                            return false;
                        }
                        const clean = entry.kind === "debt" ? { ...entry, cardId: undefined } : entry;
                        const created = { ...clean, id: newId(), createdAt: new Date().toISOString() };
                        updateDemo((d) => ({
                            entries: [created, ...d.entries],
                            cards: d.cards.map((card) =>
                                card.id === clean.cardId ? { ...card, balance: card.balance + cardDelta(clean) } : card,
                            ),
                        }));
                        toast.success(t("saved", { name: entry.subject }));
                        return true;
                    }
                    if (entry.kind === "debt") {
                        // Udhaar lives in the party ledger on this phone
                        const clean = { ...entry, cardId: undefined };
                        updateLocal((d) => ({
                            entries: [{ ...clean, id: newId(), createdAt: new Date().toISOString() }, ...d.entries],
                        }));
                        toast.success(t("saved", { name: entry.subject }));
                        return true;
                    }
                    if (entry.kind === "expense" && !entry.cardId) {
                        toast.error(t("cardRequired"));
                        return false;
                    }
                    const category = get().categories.find((c) => c.id === entry.categoryId)?.label ?? "Other";
                    const form = {
                        subject: entry.subject,
                        category,
                        amount: entry.amount,
                        entry_date: entry.date.slice(0, 10),
                        description: entry.description ?? null,
                    };
                    return write(
                        () =>
                            entry.kind === "expense"
                                ? expensesApi.createExpense({ ...form, account_id: Number(entry.cardId) })
                                : expensesApi.createIncome({ ...form, account_id: entry.cardId ? Number(entry.cardId) : null }),
                        t("saved", { name: entry.subject }),
                    );
                },

                updateEntry: (id, patch) => {
                    if (isDemoMode()) {
                        const old = demo().entries.find((e) => e.id === id);
                        if (!old) return false;
                        const updated = { ...old, ...patch };
                        const deltas: Record<string, number> = {};
                        if (old.cardId && old.kind !== "debt") deltas[old.cardId] = (deltas[old.cardId] ?? 0) - cardDelta(old);
                        if (updated.cardId && updated.kind !== "debt") {
                            deltas[updated.cardId] = (deltas[updated.cardId] ?? 0) + cardDelta(updated);
                        }
                        updateDemo((d) => ({
                            entries: d.entries.map((e) => (e.id === id ? updated : e)),
                            cards: d.cards.map((card) =>
                                deltas[card.id] ? { ...card, balance: card.balance + deltas[card.id] } : card,
                            ),
                        }));
                        toast.success(t("updated", { name: updated.subject }));
                        return true;
                    }
                    if (id.startsWith(SERVER_ENTRY_PREFIX)) {
                        toast.error(t("notEditable"));
                        return false;
                    }
                    const old = local().entries.find((e) => e.id === id);
                    if (!old) return false;
                    const updated = { ...old, ...patch };
                    updateLocal((d) => ({ entries: d.entries.map((e) => (e.id === id ? updated : e)) }));
                    toast.success(t("updated", { name: updated.subject }));
                    return true;
                },

                deleteEntry: (id) => {
                    if (isDemoMode()) {
                        const target = demo().entries.find((e) => e.id === id);
                        if (!target) return false;
                        updateDemo((d) => ({
                            entries: d.entries.filter((e) => e.id !== id),
                            cards: d.cards.map((card) =>
                                target.cardId && target.kind !== "debt" && card.id === target.cardId
                                    ? { ...card, balance: card.balance - cardDelta(target) }
                                    : card,
                            ),
                        }));
                        toast.success(t("deleted", { name: target.subject }));
                        return true;
                    }
                    if (id.startsWith(SERVER_ENTRY_PREFIX)) {
                        toast.error(t("notDeletable"));
                        return false;
                    }
                    const target = local().entries.find((e) => e.id === id);
                    if (!target) return false;
                    updateLocal((d) => ({ entries: d.entries.filter((e) => e.id !== id) }));
                    toast.success(t("deleted", { name: target.subject }));
                    return true;
                },

                addParty: (p) => {
                    const party: IParty = { ...p, id: newId(), slug: makeSlug(p.name), createdAt: new Date().toISOString() };
                    if (isDemoMode()) updateDemo((d) => ({ parties: [party, ...d.parties] }));
                    else updateLocal((d) => ({ parties: [party, ...d.parties] }));
                    toast.success(t("partyAdded", { name: party.name }));
                    return party;
                },

                addParties: (list) => {
                    const now = new Date().toISOString();
                    const created: IParty[] = list.map((p) => ({ ...p, id: newId(), slug: makeSlug(p.name), createdAt: now }));
                    if (isDemoMode()) updateDemo((d) => ({ parties: [...created, ...d.parties] }));
                    else updateLocal((d) => ({ parties: [...created, ...d.parties] }));
                    toast.success(t("partiesAdded", { count: created.length }));
                    return created.length;
                },

                updateParty: (id, patch) => {
                    if (isDemoMode()) {
                        updateDemo((d) => ({ parties: d.parties.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
                    } else {
                        updateLocal((d) => ({ parties: d.parties.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
                    }
                },

                deleteParty: (id, withEntries = false) => {
                    const entries = isDemoMode() ? demo().entries : local().entries;
                    const linked = entries.filter((e) => e.partyId === id);
                    if (linked.length && !withEntries) {
                        toast.error(t("partyHasEntries"));
                        return false;
                    }
                    if (isDemoMode()) {
                        updateDemo((d) => ({
                            entries: d.entries.filter((e) => e.partyId !== id),
                            parties: d.parties.filter((p) => p.id !== id),
                        }));
                    } else {
                        updateLocal((d) => ({
                            entries: d.entries.filter((e) => e.partyId !== id),
                            parties: d.parties.filter((p) => p.id !== id),
                        }));
                    }
                    toast.success(
                        linked.length ? t("partyDeletedWithEntries", { count: linked.length }) : t("partyDeleted"),
                    );
                    return true;
                },

                addCategory: async (label, color, kind) => {
                    const clean = label.trim();
                    if (kind === "debt") {
                        toast.error(t("debtCategoryLocked"));
                        return false;
                    }
                    const categories = isDemoMode() ? demo().categories : get().categories;
                    if (categories.some((c) => c.kind === kind && c.label.toLowerCase() === clean.toLowerCase())) {
                        toast.error(t("categoryExists", { name: clean }));
                        return false;
                    }
                    if (isDemoMode()) {
                        updateDemo((d) => ({
                            categories: [...d.categories, { id: newId(), label: clean, color, kind }],
                        }));
                        toast.success(t("categoryAdded", { name: clean }));
                        return true;
                    }
                    return write(
                        () => expensesApi.createCategory({ name: clean, type: apiTypeOf(kind), color: categoryHex(color) }),
                        t("categoryAdded", { name: clean }),
                    );
                },

                deleteCategory: async (id) => {
                    const categories = isDemoMode() ? demo().categories : get().categories;
                    const target = categories.find((c) => c.id === id);
                    if (!target) return false;
                    if (target.kind === "debt") {
                        toast.error(t("debtCategoryLocked"));
                        return false;
                    }
                    if (target.label === "Other") {
                        toast.error(t("otherCategoryLocked"));
                        return false;
                    }
                    if (isDemoMode()) {
                        const fallback = categories.find((c) => c.kind === target.kind && c.label === "Other" && c.id !== id);
                        if (!fallback) {
                            toast.error(t("otherCategoryLocked"));
                            return false;
                        }
                        updateDemo((d) => ({
                            categories: d.categories.filter((c) => c.id !== id),
                            entries: d.entries.map((e) => (e.categoryId === id ? { ...e, categoryId: fallback.id } : e)),
                        }));
                        toast.success(t("categoryRemoved", { name: target.label }));
                        return true;
                    }
                    if (id.startsWith("name:")) {
                        // only a name on old entries; nothing to delete on the server
                        return false;
                    }
                    return write(() => expensesApi.deleteCategory(Number(id)), t("categoryRemoved", { name: target.label }));
                },

                addCard: async (card) => {
                    if ((isDemoMode() ? demo().cards : remote().cards).length >= MAX_CARDS) {
                        toast.error(t("maxCards", { count: MAX_CARDS }));
                        return false;
                    }
                    if (isDemoMode()) {
                        updateDemo((d) => ({ cards: [...d.cards, { ...card, id: newId() }] }));
                        toast.success(t("cardAdded", { name: card.label }));
                        return true;
                    }
                    let createdId: number | null = null;
                    const ok = await write(async () => {
                        const created = await expensesApi.createCard({
                            card_number: card.last4,
                            bank_name: card.label,
                            balance: card.balance,
                            card_color: CARD_COLOR[card.gradient],
                            expiry_month: card.expiryMonth ?? null,
                            // the form asks for YY
                            expiry_year: card.expiryYear != null ? 2000 + card.expiryYear : null,
                        });
                        createdId = created.id;
                        set((s) => ({
                            cardMeta: {
                                ...s.cardMeta,
                                [String(created.id)]: {
                                    expiryMonth: card.expiryMonth,
                                    expiryYear: card.expiryYear,
                                    gradient: card.gradient,
                                },
                            },
                        }));
                    }, t("cardAdded", { name: card.label }));
                    return ok && createdId !== null;
                },

                updateCard: async (id, patch) => {
                    if (isDemoMode()) {
                        const card = demo().cards.find((c) => c.id === id);
                        if (!card) return false;
                        updateDemo((d) => ({ cards: d.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
                        toast.success(t("cardUpdated"));
                        return true;
                    }
                    const card = remote().cards.find((c) => c.id === id);
                    if (!card) return false;
                    if ((patch.label !== undefined && patch.label !== card.label) || (patch.last4 !== undefined && patch.last4 !== card.last4)) {
                        toast.error(t("cardRenameUnsupported"));
                        return false;
                    }
                    // expiry/colour are kept on this phone
                    set((s) => ({
                        cardMeta: {
                            ...s.cardMeta,
                            [id]: {
                                ...s.cardMeta[id],
                                ...(patch.expiryMonth !== undefined ? { expiryMonth: patch.expiryMonth } : {}),
                                ...(patch.expiryYear !== undefined ? { expiryYear: patch.expiryYear } : {}),
                                ...(patch.gradient !== undefined ? { gradient: patch.gradient } : {}),
                            },
                        },
                    }));
                    if (patch.balance === undefined || patch.balance === card.balance) {
                        toast.success(t("cardUpdated"));
                        await get().sync();
                        return true;
                    }
                    // the server stores an opening balance (> 0); entries on the card are added on top
                    const txnSum = cardTxnSum(id, remote().entries);
                    const opening = patch.balance - txnSum;
                    if (!(opening > 0)) {
                        toast.error(t("balanceTooLow", { amount: money(txnSum) }));
                        return false;
                    }
                    return write(() => expensesApi.setCardBalance(Number(id), opening), t("cardUpdated"));
                },

                transferBetweenCards: async (fromId, toId, amount) => {
                    const cards = isDemoMode() ? demo().cards : remote().cards;
                    const from = cards.find((c) => c.id === fromId);
                    const to = cards.find((c) => c.id === toId);
                    if (!from || !to || fromId === toId || amount <= 0) {
                        toast.error(t("differentCards"));
                        return false;
                    }
                    if (from.balance < amount) {
                        toast.error(t("notEnoughBalance", { name: from.label }));
                        return false;
                    }
                    if (isDemoMode()) {
                        updateDemo((d) => ({
                            cards: d.cards.map((card) =>
                                card.id === fromId ? { ...card, balance: card.balance - amount }
                                    : card.id === toId ? { ...card, balance: card.balance + amount }
                                        : card,
                            ),
                        }));
                        toast.success(t("transferred", { amount: money(amount), from: from.label, to: to.label }));
                        return true;
                    }
                    return write(
                        () => expensesApi.transfer(Number(fromId), Number(toId), amount),
                        t("transferred", { amount: money(amount), from: from.label, to: to.label }),
                    );
                },
            };
        },
        {
            name: "filernow-khata",
            version: 4,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (s): Persisted => ({
                categories: s.categories,
                data: s.data,
                remote: s.remote,
                cardMeta: s.cardMeta,
                demoData: s.demoData,
                dataMode: s.dataMode,
            }),
            migrate: (persisted, version): Persisted => {
                let state = persisted as Record<string, unknown>;
                // v1 kept one global list; v2 moved it into the default business
                if (version < 2) {
                    const old = state as { entries?: IExpenseEntry[]; parties?: IParty[] };
                    state = { data: { [DEFAULT_BUSINESS_ID]: { entries: old.entries ?? [], parties: old.parties ?? [] } } };
                }
                // v3: income/expense, cards and their categories moved to the server. Keep only what
                // is still phone-only (Udhaar entries + parties); the demo/local copies are dropped.
                if (version < 3) {
                    const data = (state.data ?? {}) as Record<string, { entries?: IExpenseEntry[]; parties?: IParty[] }>;
                    state = {
                        data: Object.fromEntries(
                            Object.entries(data).map(([id, d]) => [
                                id,
                                {
                                    entries: (d.entries ?? []).filter((e) => e.kind === "debt").map((e) => ({ ...e, cardId: undefined })),
                                    parties: d.parties ?? [],
                                },
                            ]),
                        ),
                    };
                }
                const dataMode = (state.dataMode as Persisted["dataMode"]) ?? {};
                const demoData = { ...((state.demoData as Persisted["demoData"]) ?? {}) };
                if (version < 4) {
                    for (const [id, mode] of Object.entries(dataMode)) {
                        if (mode === "demo" && !demoData[id]) demoData[id] = createDemoData();
                    }
                }
                return {
                    categories: (state.categories as ICategory[]) ?? [...DEBT_CATEGORIES],
                    data: (state.data as Persisted["data"]) ?? {},
                    remote: (state.remote as Persisted["remote"]) ?? {},
                    cardMeta: (state.cardMeta as Persisted["cardMeta"]) ?? {},
                    demoData,
                    dataMode,
                };
            },
        },
    ),
);

// Signed out (logout or an expired session): drop the cached server data from this phone.
useAuthStore.subscribe((s, prev) => {
    if (prev.token && !s.token) {
        useKhataStore.setState({ remote: {}, cardMeta: {}, categories: [...DEBT_CATEGORIES], syncError: null });
    }
});

// Switching business changes the token's scope: show that business's cached data, then refresh it.
useBusinessStore.subscribe((s, prev) => {
    if (s.activeId === prev.activeId) return;
    const cached = useKhataStore.getState().remote[s.activeId];
    useKhataStore.setState({ categories: [...(cached?.categories ?? []), ...DEBT_CATEGORIES] });
    useKhataStore.getState().sync();
});
