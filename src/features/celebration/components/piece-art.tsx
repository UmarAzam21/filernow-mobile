// nativeApp\src\features\celebration\components\piece-art.tsx

import { memo } from "react";
import type { JSX } from "react";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";

import type { PieceKind } from "../data/piece-kinds";

type ArtProps = { width: number; height: number; tint?: string };

const SLATE = "#475569";
const SLATE_LIGHT = "#94A3B8";

/** "$" centred on 0,0, 40 units tall. */
const DOLLAR = "M10 -12 C6 -17 -6 -17 -8 -10 C-10 -2 10 -1 9 8 C8 16 -6 17 -10 11 M0 -20 V20";

function Coin({ width, height }: ArtProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
            <Circle cx={50} cy={50} r={48} fill="#D9730D" />
            <Circle cx={50} cy={50} r={39} fill="#F9B233" />
            <Circle cx={50} cy={50} r={31} fill="none" stroke="#E8890C" strokeWidth={3} />
            <G transform="translate(50 50) scale(1.05)">
                <Path d={DOLLAR} fill="none" stroke="#B45309" strokeWidth={6} strokeLinecap="round" />
            </G>
            <Path d="M24 40 A28 28 0 0 1 44 22" fill="none" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" />
        </Svg>
    );
}

function Note({ width, height }: ArtProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 100 60">
            <Rect x={3} y={3} width={94} height={54} rx={7} fill="#34D399" stroke="#0F8F6A" strokeWidth={5} />
            <Circle cx={50} cy={30} r={15} fill="none" stroke="#0F8F6A" strokeWidth={3.5} />
            <G transform="translate(50 30) scale(0.45)">
                <Path d={DOLLAR} fill="none" stroke="#0F8F6A" strokeWidth={6.5} strokeLinecap="round" />
            </G>
            <Circle cx={17} cy={30} r={3.5} fill="#0F8F6A" />
            <Circle cx={83} cy={30} r={3.5} fill="#0F8F6A" />
        </Svg>
    );
}

function Receipt({ width, height }: ArtProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 60 80">
            <Path
                d="M3 3 H57 V70 L48 77 L39 70 L30 77 L21 70 L12 77 L3 70 Z"
                fill="#FFFFFF"
                stroke={SLATE}
                strokeWidth={4}
                strokeLinejoin="round"
            />
            <Path d="M17 17 V56 M30 17 V56 M43 17 V56" stroke={SLATE_LIGHT} strokeWidth={5} strokeLinecap="round" />
        </Svg>
    );
}

function Wallet({ width, height }: ArtProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
            <Rect x={3} y={3} width={94} height={94} rx={20} fill="#7C3AED" />
            <Rect x={20} y={24} width={60} height={13} rx={6.5} fill="#34D399" />
            <Rect x={20} y={45} width={46} height={13} rx={6.5} fill="#FBBF24" />
            <Rect x={20} y={66} width={28} height={13} rx={6.5} fill="#FFFFFF" />
        </Svg>
    );
}

function Squiggle({ width, height, tint }: ArtProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 60 30">
            <Path d="M5 23 C12 2 21 2 29 15 S45 29 55 7" fill="none" stroke={tint} strokeWidth={7} strokeLinecap="round" />
        </Svg>
    );
}

function Dot({ width, height, tint }: ArtProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 10 10">
            <Circle cx={5} cy={5} r={5} fill={tint} />
        </Svg>
    );
}

const ART: Record<PieceKind, (props: ArtProps) => JSX.Element> = {
    coin: Coin,
    note: Note,
    receipt: Receipt,
    wallet: Wallet,
    squiggle: Squiggle,
    dot: Dot,
};

export const PieceArt = memo(function PieceArt({ kind, ...props }: ArtProps & { kind: PieceKind }) {
    const Art = ART[kind];
    return <Art {...props} />;
});
