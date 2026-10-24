// nativeApp\src\components\header\brand-logo.tsx

import { Image } from "expo-image";

type Props = { size?: number };

/** Full FilerNow logo, rendered straight from assets/images/FILERNOW.COM LOGO-01.svg. */
export function BrandLogo({ size = 56 }: Props) {
    return (
        <Image
            source={require("@/assets/images/FILERNOW.COM LOGO-01.svg")}
            contentFit="contain"
            accessibilityLabel="FilerNow"
            style={{ width: size, height: size }}
        />
    );
}
