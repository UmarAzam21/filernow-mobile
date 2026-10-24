// nativeApp\src\features\home\hooks\use-open-service.ts

import { useCallback } from "react";
import { router, type Href } from "expo-router";

import { toast } from "@/lib/toast";

/** Opens a service's route, or tells the user it isn't ready yet. */
export function useOpenService() {
    return useCallback((name: string, href?: Href) => {
        if (href) router.push(href);
        else toast(`${name} is coming soon`);
    }, []);
}
