// nativeApp\src\features\language\components\language-flag.tsx

import { useId } from "react";
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from "react-native-svg";

type Props = { code: string; size?: number; /** Greyed out, for languages that are not available yet. */ muted?: boolean };

/** Round flag for a language code: "en" → UK, every other (Pakistani) language → Pakistan. Drawn in SVG. */
export function LanguageFlag({ code, size = 32, muted = false }: Props) {
    const clip = `flag${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

    return (
        <Svg width={size} height={size} viewBox="0 0 36 36">
            <Defs>
                <ClipPath id={clip}>
                    <Circle cx="18" cy="18" r="18" />
                </ClipPath>
            </Defs>
            <G clipPath={`url(#${clip})`}>{code === "en" ? <UnitedKingdom /> : <Pakistan green={muted ? "#ADADAD" : "#01411C"} />}</G>
            {/* hairline ring so light flag edges don't melt into white rows */}
            <Circle cx="18" cy="18" r="17.6" fill="none" stroke="#000000" strokeOpacity={0.14} strokeWidth={0.8} />
        </Svg>
    );
}

function UnitedKingdom() {
    return (
        <>
            <Rect width="36" height="36" fill="#012169" />
            <Path d="M0 0 L36 36 M36 0 L0 36" stroke="#FFFFFF" strokeWidth={7} />
            <Path d="M0 0 L36 36 M36 0 L0 36" stroke="#C8102E" strokeWidth={2.4} />
            <Path d="M18 0 V36 M0 18 H36" stroke="#FFFFFF" strokeWidth={10} />
            <Path d="M18 0 V36 M0 18 H36" stroke="#C8102E" strokeWidth={6} />
        </>
    );
}

function Pakistan({ green }: { green: string }) {
    return (
        <>
            <Rect width="36" height="36" fill={green} />
            <Rect width="9" height="36" fill="#FFFFFF" />
            {/* crescent: white disc with a green disc cut out toward the upper right */}
            <Circle cx="22.5" cy="19" r="8" fill="#FFFFFF" />
            <Circle cx="25" cy="16.8" r="7" fill={green} />
            <Path
                d="M27.6 10.4 L28.3 12.5 L30.5 12.5 L28.7 13.8 L29.4 15.9 L27.6 14.6 L25.8 15.9 L26.5 13.8 L24.7 12.5 L26.9 12.5 Z"
                fill="#FFFFFF"
            />
        </>
    );
}
