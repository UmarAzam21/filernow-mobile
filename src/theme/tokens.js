// nativeApp\src\theme\tokens.js

// Single source of truth. Used by tailwind.config.js AND by TS code (tintColor etc.).
// Key names match the FilerNow dashboard @theme wherever the meaning is the same.
const colors = {
    // primary: "#D3222C", // dashboard primary is #C8102E!
    // "primary-light": "#E8A5A9",
    primary: "#C8102E", // same as dashboard --brand-primary
    "primary-light": "#FFB4C0", // dashboard --brand-primary-light
    "primary-tint": "#FFF6F6",
    "primary-lighter": "#C8102E1A", // dashboard --brand-primary-lighter (10% alpha)
    "primary-soft": "#EBA3A7", // banner placeholder background
    "primary-deep": "#64163C", // shadow tint
    "text-dark": "#161315",
    "text-secondary": "#463C40",
    "page-bg": "#FBFCF9",
    "surface-muted": "#F6F1F2",
    "border-clr": "#ECE5E7",
    "border-strong": "#DED2D6",
};

const fontFamily = {
    jakarta: ["PlusJakartaSans_400Regular"],
    "jakarta-medium": ["PlusJakartaSans_500Medium"],
    "jakarta-semibold": ["PlusJakartaSans_600SemiBold"],
    "jakarta-bold": ["PlusJakartaSans_700Bold"],
    "jakarta-extrabold": ["PlusJakartaSans_800ExtraBold"],
};

// Mobile-base values of the dashboard type scale (size + line-height only;
// weight comes from the font-jakarta-* family classes).
const fontSize = {
    "heading-h1": ["40px", { lineHeight: "48px" }],
    "heading-h2": ["28px", { lineHeight: "34px" }],
    "heading-h3": ["20px", { lineHeight: "28px" }],
    "heading-h4": ["18px", { lineHeight: "26px" }],
    "heading-h5": ["16px", { lineHeight: "22px" }],
    "heading-h6": ["14px", { lineHeight: "20px" }],
    "para-tiny": ["12px", { lineHeight: "16px" }],
    "para-small": ["13px", { lineHeight: "18px" }],
    "para-base": ["15px", { lineHeight: "22px" }],
    "para-18": ["16px", { lineHeight: "24px" }],
};

const radius = {
    "brand-8": "8px",
    "brand-12": "12px",
    "brand-16": "16px",
    "brand-24": "24px",
    "brand-32": "32px",
};

const spacing = { brand: "16px", "brand-8": "8px", "brand-12": "12px", "brand-20": "20px" };

module.exports = { colors, fontFamily, fontSize, radius, spacing };