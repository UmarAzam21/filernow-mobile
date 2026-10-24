// nativeApp\src\hooks\use-sheet-keyboard-layout.ts

import { useCallback, useEffect, useState } from "react";
import { Keyboard, type LayoutChangeEvent, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Sizes a bottom sheet so it stays fully visible above the keyboard (iOS and Android). */
export function useSheetKeyboardLayout() {
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const [areaH, setAreaH] = useState(0);
    const [baseH, setBaseH] = useState(0); // tallest area seen while the keyboard was closed
    const [kb, setKb] = useState(0);

    useEffect(() => {
        const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
        const show = Keyboard.addListener(showEvt, (e) => setKb(e.endCoordinates.height));
        const hide = Keyboard.addListener(hideEvt, () => setKb(0));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    const onAreaLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        setBaseH((prev) => Math.max(prev, h));
        setAreaH(h);
    };

    const resetBase = useCallback(() => setBaseH(0), []);

    // part of the keyboard still covering the area (0 if Android already resized the window)
    const area = areaH || height;
    const overlap = kb > 0 ? Math.max(0, kb - (baseH - area)) : 0;
    const maxSheet = Math.max(240, area - overlap - insets.top - 12);

    return { onAreaLayout, resetBase, keyboardOpen: kb > 0, overlap, maxSheet };
}
