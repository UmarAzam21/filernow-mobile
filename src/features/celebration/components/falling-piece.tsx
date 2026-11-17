// nativeApp\src\features\celebration\components\falling-piece.tsx

import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import { piecePose, pieceShade, type Piece } from "../lib/piece-motion";
import { PieceArt } from "./piece-art";

const PERSPECTIVE = 900;

type Props = { piece: Piece; clock: SharedValue<number> };

/** Lighting: a dark layer over the artwork that deepens as the piece turns away. */
function PieceShade({ piece, clock }: Props) {
    const { motion, width, height, shade } = piece;
    const style = useAnimatedStyle(() => ({ opacity: pieceShade(motion, clock.get()) }));
    if (!shade) return null;

    const inset = width * 0.03;
    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    top: inset,
                    left: inset,
                    right: inset,
                    bottom: inset + height * (shade.bottom ?? 0),
                    borderRadius: width * shade.radius,
                    backgroundColor: "#0F172A",
                },
                style,
            ]}
        />
    );
}

export function FallingPiece({ piece, clock }: Props) {
    const { motion, kind, width, height, tint } = piece;

    const style = useAnimatedStyle(() => {
        const pose = piecePose(motion, clock.get());
        if (!pose) return { opacity: 0 };
        return {
            opacity: pose.opacity,
            transform: [
                { perspective: PERSPECTIVE },
                { translateX: pose.x },
                { translateY: pose.y },
                { rotateZ: `${pose.rotateZ}rad` },
                { rotateY: `${pose.rotateY}rad` },
                { rotateX: `${pose.rotateX}rad` },
            ],
        };
    });

    return (
        <Animated.View style={[{ position: "absolute", width, height }, style]}>
            <PieceArt kind={kind} width={width} height={height} tint={tint} />
            <PieceShade piece={piece} clock={clock} />
        </Animated.View>
    );
}
