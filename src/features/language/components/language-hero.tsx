// nativeApp\src\features\language\components\language-hero.tsx

import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, RadialGradient, Stop } from "react-native-svg";

type Props = { size?: number };

/**
 * Glossy red 3D globe for the language screen's top-right corner: red sphere with a darker
 * lower edge, white latitude / meridian grid and a soft top highlight. Drawn in SVG so it stays
 * crisp at any size.
 */
export function LanguageHero({ size = 72 }: Props) {
    return (
        <Svg width={size} height={size * 1.04} viewBox="0 0 100 104">
            <Defs>
                <RadialGradient id="globeBody" cx="0.36" cy="0.28" r="0.8">
                    <Stop offset="0" stopColor="#FF8C9C" />
                    <Stop offset="0.45" stopColor="#EE3B58" />
                    <Stop offset="1" stopColor="#C8102E" />
                </RadialGradient>
                <RadialGradient id="globeShine" cx="0.5" cy="0.15" r="0.5">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} />
                    <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
                </RadialGradient>
                <ClipPath id="globeClip">
                    <Circle cx="50" cy="50" r="48" />
                </ClipPath>
            </Defs>

            {/* darker lower edge = thickness of the 3D sphere */}
            <Circle cx="50" cy="54" r="48" fill="#9E0A24" />
            <Circle cx="50" cy="50" r="48" fill="url(#globeBody)" />

            <G clipPath="url(#globeClip)" stroke="#FFFFFF" strokeOpacity={0.92} strokeWidth={3.4} fill="none">
                {/* meridians */}
                <Ellipse cx="50" cy="50" rx="21" ry="48" />
                <Path d="M50 2 V98" />
                {/* latitudes (curved like a sphere seen slightly from above) */}
                <Path d="M4 36 Q50 26 96 36" />
                <Path d="M2 54 Q50 46 98 54" />
                <Path d="M8 74 Q50 68 92 74" />
            </G>

            {/* glossy highlight on top */}
            <Ellipse cx="50" cy="22" rx="34" ry="18" fill="url(#globeShine)" />
        </Svg>
    );
}
