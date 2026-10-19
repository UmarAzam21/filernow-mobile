// nativeApp\src\features\welcome\hooks\use-auto-carousel.ts

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    type FlatList,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    useWindowDimensions,
} from "react-native";

/** Auto-advancing, full-width paging carousel. Pauses while dragging, resumes after. */
export function useAutoCarousel(count: number, intervalMs = 3800) {
    const { width } = useWindowDimensions();
    const listRef = useRef<FlatList>(null);
    const [scrollX] = useState(() => new Animated.Value(0));
    const index = useRef(0);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    const stop = useCallback(() => {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
    }, []);

    const start = useCallback(() => {
        stop();
        timer.current = setInterval(() => {
            const next = (index.current + 1) % count; // wraps last -> first
            index.current = next;
            listRef.current?.scrollToOffset({ offset: next * width, animated: true });
        }, intervalMs);
    }, [stop, count, width, intervalMs]);

    useEffect(() => {
        start();
        return stop;
    }, [start, stop]);

    const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: false,
    });

    const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        index.current = Math.round(e.nativeEvent.contentOffset.x / width);
        start();
    };

    return { listRef, scrollX, width, onScroll, onScrollBeginDrag: stop, onMomentumScrollEnd };
}