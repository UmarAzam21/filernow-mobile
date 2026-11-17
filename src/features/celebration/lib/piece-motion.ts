// nativeApp\src\features\celebration\lib\piece-motion.ts

import { PIECE_KINDS, type PieceKind, type PieceKindConfig } from "../data/piece-kinds";

/** Seconds from the first piece launching to the last one being gone. */
export const BURST_SECONDS = 4.8;

const FADE_SECONDS = 0.6;
const GRAVITY = 1500; // px/s², for an 850px tall screen
const REFERENCE_HEIGHT = 850;
const VOLLEY_GAP = 0.42; // seconds between the three volleys
const VOLLEY_JITTER = 0.18;
const MAX_SHADE = 0.34;
const LEAN = 0.5; // radians a piece leans into its sway

export type PieceMotion = {
    delay: number;
    startX: number;
    startY: number;
    velocityX: number;
    velocityY: number;
    drag: number;
    fallSpeed: number;
    sway: number;
    swayRate: number;
    swayPhase: number;
    spin: number;
    axisX: number;
    axisY: number;
    tiltX: number;
    tiltY: number;
    roll: number;
};

export type Piece = {
    id: string;
    kind: PieceKind;
    width: number;
    height: number;
    tint?: string;
    shade?: PieceKindConfig["shade"];
    motion: PieceMotion;
};

const between = (min: number, max: number) => min + Math.random() * (max - min);

/** One piece, fired from a bottom corner. Positions are relative to the centre of the screen. */
function createMotion(config: PieceKindConfig, side: 1 | -1, volley: number, screenW: number, screenH: number): PieceMotion {
    const scale = screenH / REFERENCE_HEIGHT;
    const speed = between(...config.launch) * scale;
    // steep and aimed inwards, so the two corners cross over the middle of the screen
    const angle = between(0.14, 0.66);

    return {
        delay: volley * VOLLEY_GAP + Math.random() * VOLLEY_JITTER,
        startX: side * (screenW / 2 + 24),
        startY: screenH / 2 + 40,
        velocityX: -side * speed * Math.sin(angle),
        velocityY: -speed * Math.cos(angle),
        drag: config.drag,
        fallSpeed: GRAVITY * scale * config.drag,
        sway: between(...config.sway),
        swayRate: between(...config.swayRate),
        swayPhase: between(0, Math.PI * 2),
        spin: between(...config.spin) * (Math.random() < 0.5 ? -1 : 1),
        axisX: config.axisX,
        axisY: config.axisY,
        tiltX: between(0, Math.PI * 2),
        tiltY: between(0, Math.PI * 2),
        roll: between(-0.6, 0.6),
    };
}

export function createPieces(screenW: number, screenH: number): Piece[] {
    return (Object.keys(PIECE_KINDS) as PieceKind[]).flatMap((kind) => {
        const config = PIECE_KINDS[kind];
        return Array.from({ length: config.count }, (_, i) => {
            const width = between(...config.width);
            return {
                id: `${kind}-${i}`,
                kind,
                width,
                height: width * config.aspect,
                tint: config.tints?.[i % config.tints.length],
                shade: config.shade,
                motion: createMotion(config, i % 2 === 0 ? 1 : -1, i % 3, screenW, screenH),
            };
        });
    });
}

/** 0 at launch, approaching 1 as air resistance uses up the launch speed. */
const launchSpent = (m: PieceMotion, age: number) => {
    "worklet";
    return 1 - Math.exp(-age / m.drag);
};

/** Spins three times as fast at launch, settling to `spin` as it slows. */
const tumble = (m: PieceMotion, age: number) => {
    "worklet";
    return m.spin * (age + 2 * m.drag * launchSpent(m, age));
};

/**
 * Where a piece is `clock` seconds into the burst. This is the exact solution for a body falling
 * with linear air drag, so nothing accumulates frame to frame and a dropped frame can't throw it off.
 */
export function piecePose(m: PieceMotion, clock: number) {
    "worklet";
    const age = clock - m.delay;
    if (age <= 0) return null;

    const spent = launchSpent(m, age);
    const flutter = m.swayRate * age + m.swayPhase;
    const turn = tumble(m, age);

    return {
        x: m.startX + m.velocityX * m.drag * spent + m.sway * spent * Math.sin(flutter),
        // paper sinks in pulses: faster as it slips sideways, slower as it catches the air
        y: m.startY + m.fallSpeed * age + (m.velocityY - m.fallSpeed) * m.drag * spent + 0.25 * m.sway * spent * Math.sin(2 * flutter),
        rotateX: m.tiltX + turn * m.axisX,
        rotateY: m.tiltY + turn * m.axisY,
        rotateZ: m.roll + LEAN * spent * Math.cos(flutter),
        opacity: Math.min(1, (BURST_SECONDS - clock) / FADE_SECONDS),
    };
}

/** How dark the piece's face is: lit when facing the viewer, in shadow when edge-on. */
export function pieceShade(m: PieceMotion, clock: number) {
    "worklet";
    const age = clock - m.delay;
    if (age <= 0) return 0;
    const turn = tumble(m, age);
    return MAX_SHADE * (1 - Math.abs(Math.cos(m.tiltX + turn * m.axisX) * Math.cos(m.tiltY + turn * m.axisY)));
}
