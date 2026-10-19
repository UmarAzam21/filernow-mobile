// nativeApp\src\lib\cn.ts

import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { fontSize, radius } from "@/theme/tokens";

// Teach tailwind-merge our custom tokens so text-heading-h2 is a font size, not a color.
const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            "font-size": [{ text: Object.keys(fontSize) }],
            rounded: [{ rounded: Object.keys(radius) }],
            "rounded-t": [{ "rounded-t": Object.keys(radius) }],
            "rounded-b": [{ "rounded-b": Object.keys(radius) }],
        },
    },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));