// nativeApp\src\features\notifications\hooks\use-notifications-sync.ts

import { useEffect } from "react";
import { AppState } from "react-native";

import { useNotificationsStore } from "../store/notifications-store";

/** Keeps the bell badge current: on sign-in and whenever the app comes back to the foreground. */
export function useNotificationsSync() {
    useEffect(() => {
        const { refreshUnreadCount, reset } = useNotificationsStore.getState();
        refreshUnreadCount();
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active") refreshUnreadCount();
        });
        return () => {
            sub.remove();
            // signed out (the tabs unmount): don't show the previous account's notifications
            reset();
        };
    }, []);
}

/** Render-nothing wrapper so a layout can mount the sync only while signed in. */
export function NotificationsSync() {
    useNotificationsSync();
    return null;
}
