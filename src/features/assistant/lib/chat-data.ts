// nativeApp\src\features\assistant\lib\chat-data.ts

// Turns the `data` items of a /api/voice/chat reply ("numbers and lists looked up this turn": summaries,
// card balances, entry lists) into something the panel can lay out as figures and tables. The server
// doesn't fix their shape, so this reads them generically: plain values become figures, nested objects
// become sections, and lists of objects become tables.

/** Field names we have a translated label for (assistant.data.fields.*). Others are humanised. */
export const KNOWN_FIELDS = [
    "amount",
    "balance",
    "by_card",
    "by_category",
    "card",
    "cards",
    "category",
    "count",
    "date",
    "description",
    "entries",
    "expense",
    "income",
    "items",
    "name",
    "net",
    "party",
    "subject",
    "title",
    "total",
    "type",
] as const;
export type KnownField = (typeof KNOWN_FIELDS)[number];

/** Server field names that share a label with a known field. */
export const FIELD_ALIASES: Record<string, KnownField> = {
    entry_date: "date",
    expense_type: "type",
    card_name: "card",
    card_number: "card",
    bank_name: "card",
    total_amount: "total",
    entries_count: "count",
};

/** Kinds of data we have a translated title for (assistant.data.kinds.*). */
export const KNOWN_KINDS = ["summary", "balance", "entries", "transactions"] as const;
export type KnownKind = (typeof KNOWN_KINDS)[number];

export type Labeler = { field: (key: string) => string; kind: (kind: string) => string };

export type Figure = { label: string; value: string; money: boolean };
export type Column = { label: string; numeric: boolean };
export type Table = { columns: Column[]; rows: string[][]; more: number };
export type Section = { title?: string; figures: Figure[]; tables: { title?: string; table: Table }[] };
export type DataBlock = { title: string; period?: string; sections: Section[] };

const MAX_ROWS = 10;
const MAX_COLUMNS = 4;

const HIDDEN = new Set(["kind", "id", "created_at", "updated_at", "start_date", "end_date", "currency", "color"]);
const MONEY = /amount|total|balance|net|spent|sum|income|expense|opening/;
const COUNT = /count|entries_count|number/;
const DATE = /^\d{4}-\d{2}-\d{2}/;

/** Columns that read best first; anything else follows, money/count columns go last. */
const COLUMN_ORDER = ["date", "entry_date", "subject", "title", "name", "category", "card", "card_name", "type"];

const isHidden = (key: string) => HIDDEN.has(key) || key.endsWith("_id");
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isNumeric = (v: unknown) =>
    typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)));

export const humanize = (key: string) => {
    const s = key.replace(/[_-]+/g, " ").trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const money = (n: number) => n.toLocaleString("en-PK", { maximumFractionDigits: 2 });

const shortDate = (s: string) => {
    const d = new Date(`${s.slice(0, 10)}T00:00:00`);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

function formatValue(key: string, v: unknown): string {
    if (v === null || v === undefined || v === "") return "–";
    if (typeof v === "boolean") return v ? "✓" : "–";
    // counts and card numbers stay plain ("1234", not "1,234"); everything else numeric is an amount
    if (isNumeric(v)) return COUNT.test(key) && !MONEY.test(key) ? String(v) : money(Number(v));
    if (typeof v === "string" && DATE.test(v)) return shortDate(v);
    if (Array.isArray(v)) return v.map((x) => formatValue(key, x)).join(", ");
    if (isObject(v)) return String(v.name ?? v.title ?? v.category ?? JSON.stringify(v));
    return String(v);
}

function toTable(list: Record<string, unknown>[], label: Labeler): Table {
    const keys: string[] = [];
    for (const row of list)
        for (const [k, v] of Object.entries(row))
            if (!isHidden(k) && !keys.includes(k) && !Array.isArray(v) && !isObject(v)) keys.push(k);

    const numericKey = (k: string) => list.every((r) => r[k] == null || isNumeric(r[k]));
    const rank = (k: string) => {
        const i = COLUMN_ORDER.indexOf(k);
        if (i >= 0) return i;
        if (numericKey(k)) return COUNT.test(k) ? 100 : 200; // count, then the amount at the far end
        return 50;
    };
    // keep the most useful columns: text first, then the money column(s)
    let columns = [...keys].sort((a, b) => rank(a) - rank(b));
    if (columns.length > MAX_COLUMNS) {
        const numbers = columns.filter((k) => rank(k) >= 100).slice(-2);
        columns = [...columns.filter((k) => rank(k) < 100).slice(0, MAX_COLUMNS - numbers.length), ...numbers];
    }

    return {
        columns: columns.map((k) => ({ label: label.field(k), numeric: numericKey(k) })),
        rows: list.slice(0, MAX_ROWS).map((r) => columns.map((k) => formatValue(k, r[k]))),
        more: Math.max(0, list.length - MAX_ROWS),
    };
}

function toSection(obj: Record<string, unknown>, label: Labeler, title?: string): Section[] {
    const section: Section = { title, figures: [], tables: [] };
    const nested: Section[] = [];

    for (const [k, v] of Object.entries(obj)) {
        if (isHidden(k)) continue;
        if (Array.isArray(v)) {
            const rows = v.filter(isObject);
            if (rows.length) section.tables.push({ title: label.field(k), table: toTable(rows, label) });
            else if (v.length) section.figures.push({ label: label.field(k), value: formatValue(k, v), money: false });
        } else if (isObject(v)) {
            nested.push(...toSection(v, label, label.field(k)));
        } else {
            section.figures.push({
                label: label.field(k),
                value: formatValue(k, v),
                money: isNumeric(v) && MONEY.test(k),
            });
        }
    }
    // a lone table under a section needs no second heading
    if (section.tables.length === 1 && !section.figures.length && title) section.tables[0].title = undefined;
    const own = section.figures.length || section.tables.length ? [section] : [];
    return [...own, ...nested];
}

function periodOf(o: Record<string, unknown>): string | undefined {
    const start = typeof o.start_date === "string" ? o.start_date : undefined;
    const end = typeof o.end_date === "string" ? o.end_date : undefined;
    if (start && end) return start === end ? shortDate(start) : `${shortDate(start)} – ${shortDate(end)}`;
    return start ? shortDate(start) : end ? shortDate(end) : undefined;
}

/** Builds the blocks to show for one reply. Unreadable items are skipped. */
export function toDataBlocks(data: unknown[] | null | undefined, label: Labeler): DataBlock[] {
    if (!Array.isArray(data)) return [];
    return data.filter(isObject).flatMap((item) => {
        const kind = typeof item.kind === "string" ? item.kind : "";
        const sections = toSection(item, label);
        if (!sections.length) return [];
        return [{ title: label.kind(kind), period: periodOf(item), sections }];
    });
}
