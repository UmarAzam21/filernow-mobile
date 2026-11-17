// nativeApp\src\features\assistant\components\assistant-panel.tsx

import { ArrowUp, CircleAlert, Mic, Square, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, type SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSheetKeyboardLayout } from "@/hooks/use-sheet-keyboard-layout";

import { useVoiceAssistant } from "../hooks/use-voice-assistant";
import { type AssistantMode, useAssistantMotion } from "../lib/assistant-motion";
import { ChatDataCards } from "./chat-data-card";
import { EdgeGlow } from "./edge-glow";
import { PendingActionsCard } from "./pending-actions-card";
import { SiriOrb } from "./siri-orb";

const ORB = 84;
/** Room kept clear inside the glowing screen edge. */
const EDGE = 20;

const clock = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

type Props = { progress: SharedValue<number>; onClose: () => void };

/** Everything inside the assistant: glow, orb, conversation, pending-changes card, type-or-talk bar. */
export function AssistantPanel({ progress, onClose }: Props) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { onAreaLayout, keyboardOpen, overlap } = useSheetKeyboardLayout();
    const va = useVoiceAssistant();
    const [text, setText] = useState("");
    const scroll = useRef<ScrollView>(null);

    const busy = va.busy;
    const recording = va.phase === "recording";
    const mode: AssistantMode = recording
        ? "listening"
        : busy
          ? "thinking"
          : va.speaking
            ? "speaking"
            : va.phase === "idle"
              ? "idle"
              : "answered";
    const motion = useAssistantMotion(mode, true, va.level);

    const veil = useAnimatedStyle(() => ({ opacity: progress.get() }));
    const panel = useAnimatedStyle(() => ({
        opacity: progress.get(),
        transform: [{ translateY: (1 - progress.get()) * 60 }, { scale: 0.96 + progress.get() * 0.04 }],
    }));

    const send = () => {
        if (!text.trim() || busy) return;
        va.ask(text);
        setText("");
    };

    const fresh = va.turns.length === 0;
    // a status line under the conversation; the greeting only before anything was said
    const status = recording ? t("assistant.listening") : va.phase === "processing" ? t("assistant.thinking") : null;

    const showExamples = fresh && !recording && !busy;
    const examples = t("assistant.examples", { returnObjects: true });
    const micLabel = recording ? t("assistant.stopListening") : t("assistant.startListening");

    return (
        <View style={styles.fill} onLayout={onAreaLayout}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.veil, veil]}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel={t("actions.close")}
                />
            </Animated.View>

            <EdgeGlow motion={motion} progress={progress} />

            <View style={[styles.fill, { marginBottom: overlap }]} pointerEvents="box-none">
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.fill,
                        {
                            paddingTop: insets.top + EDGE,
                            // with the keyboard up the home-indicator inset is hidden behind it
                            paddingBottom: keyboardOpen ? 12 : Math.max(insets.bottom, 8) + EDGE,
                        },
                        panel,
                    ]}>
                    <View style={styles.topRow}>
                        <Pressable
                            onPress={onClose}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={t("actions.close")}
                            style={styles.closeBtn}>
                            <X size={20} color="#fff" />
                        </Pressable>
                    </View>

                    <View style={styles.fill} pointerEvents="box-none" />

                    {/* conversation */}
                    <ScrollView
                        ref={scroll}
                        style={styles.convo}
                        contentContainerStyle={styles.convoContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        // keep the newest reply / pending card in view
                        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
                        {fresh && !recording && !busy ? (
                            <>
                                <Animated.Text entering={FadeInDown.duration(320)} style={styles.headline}>
                                    {t("assistant.greeting")}
                                </Animated.Text>
                                <Animated.Text entering={FadeIn.delay(120).duration(320)} style={styles.subtitle}>
                                    {t("assistant.subtitle")}
                                </Animated.Text>
                            </>
                        ) : null}

                        {/* the conversation: what the user said, what the assistant answered */}
                        {va.turns.map((turn) => (
                            <Animated.View key={turn.id} entering={FadeInDown.duration(280)}>
                                {turn.user ? (
                                    <View style={styles.questionBubble}>
                                        <Text style={styles.questionText}>{turn.user}</Text>
                                    </View>
                                ) : null}
                                <Text style={[styles.answer, turn.error && styles.answerError]}>{turn.reply}</Text>
                                <ChatDataCards data={turn.data} />
                                {turn.done
                                    .filter((d) => !d.ok)
                                    .map((d, i) => (
                                        <View key={i} style={styles.failedRow}>
                                            <CircleAlert size={14} color="#FFB4BE" />
                                            <Text style={styles.failedText}>
                                                {d.description}
                                                {d.error ? `: ${d.error}` : ""}
                                            </Text>
                                        </View>
                                    ))}
                            </Animated.View>
                        ))}

                        {va.pending.length > 0 && !recording ? (
                            <PendingActionsCard pending={va.pending} busy={busy} onRespond={va.respond} />
                        ) : null}

                        {status ? (
                            <Animated.Text key={status} entering={FadeIn.duration(240)} style={styles.status}>
                                {status}
                                {recording ? `  ·  ${t("assistant.tapToSend")}  ·  ${clock(va.recordingMs)}` : ""}
                            </Animated.Text>
                        ) : null}

                        {showExamples ? (
                            <Animated.View entering={FadeInDown.delay(180).duration(360)} style={styles.chips}>
                                {examples.map((example) => (
                                    <Pressable
                                        key={example}
                                        onPress={() => va.ask(example)}
                                        accessibilityRole="button"
                                        style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}>
                                        <Text style={styles.chipText}>“{example}”</Text>
                                    </Pressable>
                                ))}
                            </Animated.View>
                        ) : null}
                    </ScrollView>

                    <View style={styles.orbWrap}>
                        <SiriOrb
                            size={ORB}
                            motion={motion}
                            onPress={va.toggleRecording}
                            accessibilityLabel={micLabel}
                        />
                    </View>

                    {/* type-or-talk bar: always there, the user can answer or correct by voice or text */}
                    <View style={[styles.inputBar, busy && styles.dimmed]}>
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            onSubmitEditing={send}
                            editable={!busy && !recording}
                            placeholder={t("assistant.placeholder")}
                            placeholderTextColor="rgba(255,255,255,0.55)"
                            returnKeyType="send"
                            style={styles.input}
                        />
                        {text.trim() ? (
                            <Pressable
                                onPress={send}
                                disabled={busy}
                                accessibilityRole="button"
                                accessibilityLabel={t("assistant.send")}
                                style={[styles.roundBtn, styles.sendBtn]}>
                                <ArrowUp size={20} color="#fff" />
                            </Pressable>
                        ) : (
                            <Pressable
                                onPress={va.toggleRecording}
                                disabled={busy}
                                accessibilityRole="button"
                                accessibilityLabel={micLabel}
                                style={[styles.roundBtn, recording && styles.sendBtn]}>
                                {recording ? (
                                    <Square size={16} color="#fff" fill="#fff" />
                                ) : (
                                    <Mic size={20} color="#fff" />
                                )}
                            </Pressable>
                        )}
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    veil: { backgroundColor: "rgba(10, 2, 8, 0.82)" },
    topRow: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: EDGE },
    closeBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.14)",
    },
    // grows with its content, but shrinks (and scrolls) instead of pushing the orb/input off screen
    convo: { flexGrow: 0, flexShrink: 1 },
    convoContent: { paddingHorizontal: EDGE + 4, paddingTop: 8, paddingBottom: 8 },
    headline: { color: "#fff", fontSize: 26, lineHeight: 34, fontFamily: "PlusJakartaSans_700Bold" },
    subtitle: {
        marginTop: 6,
        color: "rgba(255,255,255,0.7)",
        fontSize: 15,
        lineHeight: 22,
        fontFamily: "PlusJakartaSans_500Medium",
    },
    questionBubble: {
        alignSelf: "flex-end",
        maxWidth: "85%",
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        borderBottomRightRadius: 6,
        backgroundColor: "rgba(255,255,255,0.16)",
    },
    questionText: { color: "#fff", fontSize: 15, lineHeight: 21, fontFamily: "PlusJakartaSans_500Medium" },
    answer: { marginTop: 14, color: "#fff", fontSize: 19, lineHeight: 27, fontFamily: "PlusJakartaSans_600SemiBold" },
    answerError: { color: "#FFB4BE" },
    failedRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 8 },
    failedText: { flex: 1, color: "#FFB4BE", fontSize: 13, lineHeight: 18, fontFamily: "PlusJakartaSans_500Medium" },
    status: {
        marginTop: 14,
        color: "rgba(255,255,255,0.75)",
        fontSize: 15,
        fontFamily: "PlusJakartaSans_600SemiBold",
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    chipPressed: { backgroundColor: "rgba(255,255,255,0.22)" },
    chipText: { color: "#fff", fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold" },
    // tall enough to hold the orb's glow, so it never spills over the text or the input
    orbWrap: { alignItems: "center", justifyContent: "center", height: ORB * 1.6, marginBottom: 8 },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: EDGE,
        paddingLeft: 18,
        paddingRight: 6,
        height: 54,
        borderRadius: 27,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    dimmed: { opacity: 0.55 },
    input: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 0, fontFamily: "PlusJakartaSans_500Medium" },
    roundBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.14)",
    },
    sendBtn: { backgroundColor: "#C8102E" },
});
