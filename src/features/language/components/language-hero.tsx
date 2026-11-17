// nativeApp\src\features\language\components\language-hero.tsx

import Svg, {
    Circle,
    ClipPath,
    Defs,
    Ellipse,
    G,
    LinearGradient,
    Path,
    Pattern,
    RadialGradient,
    Rect,
    Stop,
    Text as SvgText,
} from "react-native-svg";

type Props = { width?: number };

/**
 * Glossy 3D-style globe for the language screen's top-right corner: blue sphere with a white
 * orbit ring, "A" and "文" script chips, a globe chip, sparkles, and a faint dotted map behind.
 * Drawn in SVG so it stays crisp at any size; swap in a PNG export later if design provides one.
 */
export function LanguageHero({ width = 210 }: Props) {
    const height = width * 0.78;

    return (
        <Svg width={width} height={height} viewBox="0 0 210 164">
            <Defs>
                <Pattern id="heroDots" width="6" height="6" patternUnits="userSpaceOnUse">
                    <Circle cx="3" cy="3" r="1.1" fill="#5B8FD6" />
                </Pattern>
                <ClipPath id="heroMap">
                    {/* rough continent silhouettes, filled with the dot pattern */}
                    <Path d="M8 46 C 20 30, 48 28, 62 38 C 70 44, 66 58, 54 62 C 44 66, 40 78, 30 76 C 18 72, 4 60, 8 46 Z" />
                    <Path d="M70 24 C 86 14, 112 16, 120 26 C 126 34, 112 42, 100 40 C 88 38, 74 36, 70 24 Z" />
                    <Path d="M48 84 C 58 80, 66 92, 62 106 C 58 118, 48 122, 44 110 C 40 100, 40 88, 48 84 Z" />
                </ClipPath>

                <RadialGradient id="heroSphere" cx="0.38" cy="0.32" r="0.75">
                    <Stop offset="0" stopColor="#BFE3FF" />
                    <Stop offset="0.45" stopColor="#3D9BF5" />
                    <Stop offset="1" stopColor="#1452C4" />
                </RadialGradient>
                <RadialGradient id="heroShine" cx="0.32" cy="0.25" r="0.45">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.75} />
                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                </RadialGradient>
                <ClipPath id="heroSphereClip">
                    <Circle cx="128" cy="76" r="46" />
                </ClipPath>

                <LinearGradient id="heroChipBlue" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#5AB2FF" />
                    <Stop offset="1" stopColor="#1A64DE" />
                </LinearGradient>
                <LinearGradient id="heroChipPurple" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#B49CFF" />
                    <Stop offset="1" stopColor="#6A3DE8" />
                </LinearGradient>
            </Defs>

            {/* faint dotted world map */}
            <Rect width="210" height="164" fill="url(#heroDots)" clipPath="url(#heroMap)" opacity={0.22} />

            {/* orbit ring, back half (behind the sphere) */}
            <Ellipse
                cx="126"
                cy="82"
                rx="84"
                ry="22"
                transform="rotate(-16 126 82)"
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity={0.55}
                strokeWidth={2.5}
            />

            {/* sphere */}
            <Circle cx="128" cy="76" r="46" fill="url(#heroSphere)" />
            <G clipPath="url(#heroSphereClip)">
                {/* land masses */}
                <Path
                    d="M96 52 C 104 42, 122 40, 130 48 C 136 54, 128 62, 120 62 C 112 62, 112 72, 104 74 C 96 76, 90 62, 96 52 Z"
                    fill="#FFFFFF"
                    opacity={0.78}
                />
                <Path
                    d="M140 58 C 150 54, 164 62, 166 74 C 168 86, 158 100, 148 98 C 140 96, 144 84, 138 78 C 132 72, 132 62, 140 58 Z"
                    fill="#FFFFFF"
                    opacity={0.7}
                />
                <Path d="M112 88 C 120 86, 126 94, 122 104 C 118 112, 108 110, 108 100 C 108 94, 106 90, 112 88 Z" fill="#FFFFFF" opacity={0.62} />
                {/* grid */}
                <Ellipse cx="128" cy="76" rx="22" ry="46" fill="none" stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={1} />
                <Ellipse cx="128" cy="76" rx="46" ry="14" fill="none" stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={1} />
                {/* glossy highlight */}
                <Circle cx="128" cy="76" r="46" fill="url(#heroShine)" />
            </G>

            {/* orbit ring, front arc (over the sphere) */}
            <Path
                d="M44 100 C 80 112, 170 88, 208 58"
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity={0.95}
                strokeWidth={2.5}
                strokeLinecap="round"
            />

            {/* "A" chip */}
            <G transform="rotate(-14 64 44)">
                <Rect x="47" y="29" width="34" height="34" rx="9" fill="#0B3E9E" opacity={0.18} />
                <Rect x="45" y="26" width="34" height="34" rx="9" fill="url(#heroChipBlue)" />
                <Path d="M51 31 Q 54 29 60 29" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" fill="none" />
                <SvgText x="62" y="51" fontSize="20" fontWeight="800" fill="#FFFFFF" textAnchor="middle">
                    A
                </SvgText>
            </G>

            {/* "文" chip */}
            <G transform="rotate(10 186 92)">
                <Rect x="170" y="77" width="36" height="36" rx="9" fill="#3B1C9E" opacity={0.18} />
                <Rect x="168" y="74" width="36" height="36" rx="9" fill="url(#heroChipPurple)" />
                <Path d="M174 79 Q 177 77 183 77" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} strokeLinecap="round" fill="none" />
                <SvgText x="186" y="99" fontSize="20" fontWeight="800" fill="#FFFFFF" textAnchor="middle">
                    文
                </SvgText>
            </G>

            {/* globe chip */}
            <Rect x="135" y="114" width="30" height="30" rx="8" fill="#1B4FA8" opacity={0.14} />
            <Rect x="133" y="111" width="30" height="30" rx="8" fill="#FFFFFF" />
            <G stroke="#1E4E9E" strokeWidth={1.6} fill="none">
                <Circle cx="148" cy="126" r="8" />
                <Ellipse cx="148" cy="126" rx="3.6" ry="8" />
                <Path d="M140 126 H156 M141.5 122 H154.5 M141.5 130 H154.5" />
            </G>

            {/* sparkles */}
            <Path d="M196 12 Q 197.5 19 204 20 Q 197.5 21 196 28 Q 194.5 21 188 20 Q 194.5 19 196 12 Z" fill="#9B7BFF" />
            <Path d="M30 104 Q 31 109 35 110 Q 31 111 30 116 Q 29 111 25 110 Q 29 109 30 104 Z" fill="#6FB6FF" />
        </Svg>
    );
}
