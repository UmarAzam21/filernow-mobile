// nativeApp\src\features\notifications\lib\time-ago.ts

import { localDate } from "@/lib/dateFmt";

/** "Just now", "10 min ago", "2 hours ago", "Yesterday", "3 days ago", then "12 Oct". */
export function timeAgo(iso: string, now = new Date()) {
    const d = new Date(iso);
    const mins = Math.floor((now.getTime() - d.getTime()) / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;

    if (localDate(d) === localDate(now)) {
        const hours = Math.floor(mins / 60);
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (localDate(d) === localDate(yesterday)) return "Yesterday";

    const days = Math.max(2, Math.round(mins / (60 * 24)));
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const isToday = (iso: string, now = new Date()) => localDate(new Date(iso)) === localDate(now);
