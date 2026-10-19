// nativeApp\src\features\welcome\data\slides.ts

export const SLIDE_ICONS = {
    chart: { ios: "chart.bar.fill", android: "bar_chart", web: "bar_chart" },
    people: { ios: "person.2.fill", android: "groups", web: "groups" },
    laptop: { ios: "laptopcomputer", android: "laptop", web: "laptop" },
} as const;

export type Slide = { image: number; icon: keyof typeof SLIDE_ICONS; title: string; text: string };

export const SLIDES: Slide[] = [
    {
        image: require("@/assets/images/slide_1.jpg"),
        icon: "chart",
        title: "Apne paison par apna control",
        text: "Kharche track karein, aamdani sambhalein — sab kuch ek hi jagah.",
    },
    {
        image: require("@/assets/images/slide_2.jpg"),
        icon: "people",
        title: "Poora karobar, ek hi app mein",
        text: "Grahak, bank, bikri, amla aur kharche — sab kuch Digital Khata mein.",
    },
    {
        image: require("@/assets/images/slide_3.jpg"),
        icon: "laptop",
        title: "Har device par aapka hisaab",
        text: "Mobile aur laptop, dono par Digital Khata — data hamesha sync.",
    },
];