// nativeApp\src\features\language\data\languages.ts

import ISO6391, { type LanguageCode } from "iso-639-1";

export type Language = { code: LanguageCode; name: string; nativeName: string };

export const DEFAULT_LANGUAGE_CODE: LanguageCode = "en";

const FEATURED_CODES: LanguageCode[] = ["en", "ur", "ar", "hi", "bn"];

const rank = (code: LanguageCode) => {
    const i = FEATURED_CODES.indexOf(code);
    return i === -1 ? FEATURED_CODES.length : i;
};

export const languages: Language[] = ISO6391.getLanguages(ISO6391.getAllCodes()).sort((a, b) => {
    const diff = rank(a.code) - rank(b.code);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
});

export const POPULAR = languages.filter((l) => FEATURED_CODES.includes(l.code));
export const OTHERS = languages.filter((l) => !FEATURED_CODES.includes(l.code));

export const getLanguage = (code: LanguageCode) =>
    languages.find((l) => l.code === code) ?? languages[0];

export function searchLanguages(query: string): Language[] {
    const q = query.trim().toLocaleLowerCase();
    return languages.filter(({ code, name, nativeName }) =>
        [code, name, nativeName].some((v) => v.toLocaleLowerCase().includes(q)),
    );
}

export const isFeaturedLanguage = (code: LanguageCode) => FEATURED_CODES.includes(code);