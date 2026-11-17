// nativeApp\src\features\assistant\components\chat-data-card.tsx

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
    type DataBlock,
    FIELD_ALIASES,
    humanize,
    KNOWN_FIELDS,
    KNOWN_KINDS,
    type KnownField,
    type KnownKind,
    type Labeler,
    type Table,
    toDataBlocks,
} from "../lib/chat-data";

type Props = { data: unknown[] | null | undefined };

/** The numbers and lists behind a reply (spending by category, card balances, entries) as tidy tables. */
export function ChatDataCards({ data }: Props) {
    const { t } = useTranslation();

    const blocks = useMemo(() => {
        const label: Labeler = {
            field: (key) => {
                const known = FIELD_ALIASES[key] ?? key;
                return (KNOWN_FIELDS as readonly string[]).includes(known)
                    ? t(`assistant.data.fields.${known as KnownField}`)
                    : humanize(key);
            },
            kind: (kind) =>
                (KNOWN_KINDS as readonly string[]).includes(kind)
                    ? t(`assistant.data.kinds.${kind as KnownKind}`)
                    : t("assistant.data.kinds.details"),
        };
        return toDataBlocks(data, label);
    }, [data, t]);

    if (!blocks.length) return null;
    return (
        <>
            {blocks.map((block, i) => (
                <BlockCard key={i} block={block} />
            ))}
        </>
    );
}

function BlockCard({ block }: { block: DataBlock }) {
    const { t } = useTranslation();
    return (
        <Animated.View entering={FadeInDown.delay(120).duration(320)} style={styles.card}>
            <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>{block.title}</Text>
                {block.period ? <Text style={styles.period}>{block.period}</Text> : null}
            </View>

            {block.sections.map((section, si) => (
                <View key={si} style={si > 0 && styles.sectionGap}>
                    {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}

                    {section.figures.length ? (
                        <View style={styles.figures}>
                            {section.figures.map((f, fi) => (
                                <View key={fi} style={styles.figure}>
                                    <Text style={styles.figureLabel} numberOfLines={1}>
                                        {f.label}
                                    </Text>
                                    <Text style={[styles.figureValue, f.money && styles.money]} numberOfLines={1}>
                                        {f.money ? `${t("assistant.data.currency")} ${f.value}` : f.value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : null}

                    {section.tables.map((tb, ti) => (
                        <View key={ti} style={styles.tableWrap}>
                            {tb.title ? <Text style={styles.tableTitle}>{tb.title}</Text> : null}
                            <DataTable table={tb.table} />
                        </View>
                    ))}
                </View>
            ))}
        </Animated.View>
    );
}

function DataTable({ table }: { table: Table }) {
    const { t } = useTranslation();
    // text columns share the width; number columns size to their content at the end
    const cell = (numeric: boolean, first: boolean) => [
        styles.cell,
        numeric ? styles.cellNumber : first ? styles.cellMain : styles.cellText,
    ];

    return (
        <View style={styles.table}>
            <View style={[styles.row, styles.headRow]}>
                {table.columns.map((c, i) => (
                    <Text key={i} style={[cell(c.numeric, i === 0), styles.head]} numberOfLines={1}>
                        {c.label}
                    </Text>
                ))}
            </View>
            {table.rows.map((r, ri) => (
                <View key={ri} style={[styles.row, ri % 2 === 1 && styles.rowAlt]}>
                    {r.map((v, i) => (
                        <Text
                            key={i}
                            style={[cell(table.columns[i].numeric, i === 0), table.columns[i].numeric && styles.num]}
                            numberOfLines={2}>
                            {v}
                        </Text>
                    ))}
                </View>
            ))}
            {table.more > 0 ? <Text style={styles.more}>{t("assistant.data.more", { count: table.more })}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginTop: 12,
        padding: 14,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    cardHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
    cardTitle: { color: "#fff", fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" },
    period: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "PlusJakartaSans_500Medium" },
    sectionGap: { marginTop: 14 },
    sectionTitle: {
        marginTop: 10,
        color: "rgba(255,255,255,0.65)",
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        fontFamily: "PlusJakartaSans_700Bold",
    },
    figures: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    figure: {
        flexGrow: 1,
        minWidth: "30%",
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    figureLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "PlusJakartaSans_600SemiBold" },
    figureValue: { marginTop: 2, color: "#fff", fontSize: 16, fontFamily: "PlusJakartaSans_700Bold" },
    money: { fontVariant: ["tabular-nums"] },
    tableWrap: { marginTop: 10 },
    tableTitle: {
        marginBottom: 6,
        color: "rgba(255,255,255,0.75)",
        fontSize: 12,
        fontFamily: "PlusJakartaSans_700Bold",
    },
    table: { borderRadius: 12, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.05)" },
    row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
    rowAlt: { backgroundColor: "rgba(255,255,255,0.05)" },
    headRow: { backgroundColor: "rgba(255,255,255,0.1)", paddingVertical: 7 },
    head: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "PlusJakartaSans_700Bold" },
    cell: { color: "#fff", fontSize: 13, lineHeight: 18, fontFamily: "PlusJakartaSans_500Medium" },
    cellMain: { flex: 1.4 },
    cellText: { flex: 1 },
    cellNumber: { minWidth: 56, textAlign: "right" },
    num: { fontFamily: "PlusJakartaSans_700Bold", fontVariant: ["tabular-nums"] },
    more: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        fontFamily: "PlusJakartaSans_500Medium",
    },
});
