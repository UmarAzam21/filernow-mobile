// nativeApp\src\features\celebration\data\piece-kinds.ts

export type PieceKind = "coin" | "note" | "receipt" | "wallet" | "squiggle" | "dot";

type Range = readonly [min: number, max: number];

export type PieceKindConfig = {
    count: number;
    /** Rendered width in px; height follows from `aspect`. */
    width: Range;
    aspect: number;
    /** How quickly air slows it down, in seconds. Small = light paper, large = heavy metal. */
    drag: number;
    /** Launch speed in px/s, for an 850px tall screen. */
    launch: Range;
    /** Side-to-side flutter once the launch is spent. */
    sway: Range;
    swayRate: Range;
    /** Tumbling speed in rad/s, and how much of it goes around each axis. */
    spin: Range;
    axisX: number;
    axisY: number;
    /** Dark overlay for the lighting, sized to the artwork. Omit for shapes too small to need it. */
    shade?: { radius: number; bottom?: number };
    tints?: readonly string[];
};

export const PIECE_KINDS: Record<PieceKind, PieceKindConfig> = {
    coin: {
        count: 12,
        width: [34, 52],
        aspect: 1,
        drag: 0.7,
        launch: [2050, 2750],
        sway: [2, 10],
        swayRate: [2, 3.5],
        spin: [5, 9],
        axisX: 0.2,
        axisY: 1,
        shade: { radius: 0.5 },
    },
    note: {
        count: 10,
        width: [66, 92],
        aspect: 0.6,
        drag: 0.26,
        launch: [3500, 5000],
        sway: [26, 48],
        swayRate: [2.6, 4.2],
        spin: [1.6, 3.2],
        axisX: 0.9,
        axisY: 0.6,
        shade: { radius: 0.08 },
    },
    receipt: {
        count: 7,
        width: [42, 60],
        aspect: 1.33,
        drag: 0.23,
        launch: [3500, 5000],
        sway: [30, 54],
        swayRate: [3, 4.8],
        spin: [1.8, 3.4],
        axisX: 0.7,
        axisY: 0.8,
        shade: { radius: 0.02, bottom: 0.1 },
    },
    wallet: {
        count: 4,
        width: [46, 64],
        aspect: 1,
        drag: 0.42,
        launch: [2700, 3700],
        sway: [8, 20],
        swayRate: [2, 3],
        spin: [2.4, 4],
        axisX: 0.8,
        axisY: 0.7,
        shade: { radius: 0.2 },
    },
    squiggle: {
        count: 5,
        width: [30, 46],
        aspect: 0.5,
        drag: 0.2,
        launch: [3800, 5500],
        sway: [20, 40],
        swayRate: [3, 5],
        spin: [2, 4],
        axisX: 0.4,
        axisY: 0.4,
        tints: ["#8B5CF6", "#FBBF24", "#22C55E", "#38BDF8"],
    },
    dot: {
        count: 5,
        width: [10, 16],
        aspect: 1,
        drag: 0.3,
        launch: [3100, 4600],
        sway: [10, 24],
        swayRate: [2.5, 4],
        spin: [0, 0],
        axisX: 0,
        axisY: 0,
        tints: ["#EC4899", "#8B5CF6", "#38BDF8"],
    },
};
