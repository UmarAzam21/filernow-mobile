// nativeApp\src\components\tab-bar\app-tab-bar.tsx

import { Image } from "expo-image";
import type { BottomTabBarProps } from "expo-router/tabs";
import { useTranslation } from "react-i18next";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Svg, { G, Path, Rect } from "react-native-svg";

import { type EmIconName, emIcons } from "@/constants/expense-manager-icons";
import { useAssistantStore } from "@/features/assistant/store/assistant-store";
import type { Resources } from "@/i18n/resources";
import { colors } from "@/theme/tokens";

type TabLabelKey = keyof Resources["common"]["tabs"];

type TabDef = {
    /** Route name inside src/app/(tabs). */
    name: string;
    /** Key under common:tabs. */
    labelKey: TabLabelKey;
    icon: EmIconName;
    iconInactive?: EmIconName;
    /** The raised round button in the middle. */
    center?: boolean;
};

// Order = order in the bar. Routes not listed here (e.g. settings) are not shown.
export const TAB_DEFS: TabDef[] = [
    { name: "home", labelKey: "home", icon: "navHome", iconInactive: "navHomeInactive" },
    { name: "khata", labelKey: "khata", icon: "navKhata", iconInactive: "navKhataInactive" },
    { name: "ask-ai", labelKey: "askAi", icon: "navAiCircle", center: true },
    { name: "my-advocate", labelKey: "myAdvocate", icon: "navMyAdvocate", iconInactive: "navMyAdvocateInactive" },
    { name: "tax-advisor", labelKey: "taxAdvisor", icon: "navTaxAdvisor", iconInactive: "navTaxAdvisorInactive" },
];

const ACTIVE = "#C8102E";
const INACTIVE = "#8A8285";
const ICON = 26;
const PAD_TOP = 8;

// Floating round button that sits in a circular notch cut into the top edge of the bar.
const ORB = 58; // button diameter
const GAP = 6; // even gap between the button and the notch
const NOTCH_R = ORB / 2 + GAP; // notch = circle around the button centre, which sits on the bar edge
const NOTCH_TILT = (35 * Math.PI) / 180; // where the shoulder curve meets the circle
const SHOULDER = 10; // extra run-in of the shoulder curve along the bar edge
const SHADOW = 6; // room above the bar for its soft top shadow
const BAR_LINE = "#ECE7E6";

/**
 * Top edge of the bar (open path, y = 0 is the bar edge): flat, a smooth shoulder, a circular arc
 * around the button, the mirrored shoulder, flat again. Shoulders are tangent to the arc, so no kinks.
 */
function notchEdge(cx: number, w: number) {
    const px = NOTCH_R * Math.cos(NOTCH_TILT); // arc start/end, relative to cx
    const py = NOTCH_R * Math.sin(NOTCH_TILT);
    const ctrl = NOTCH_R / Math.cos(NOTCH_TILT); // tangent at the arc start meets the bar edge here
    return (
        `M0 0 L${cx - ctrl - SHOULDER} 0 ` +
        `Q${cx - ctrl} 0 ${cx - px} ${py} ` +
        `A${NOTCH_R} ${NOTCH_R} 0 0 0 ${cx + px} ${py} ` +
        `Q${cx + ctrl} 0 ${cx + ctrl + SHOULDER} 0 ` +
        `L${w} 0`
    );
}

/** Bottom navigation: white bar with a circular notch, 3D icons (grey when inactive), floating AI orb in the middle. */
export function AppTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
    const { t } = useTranslation();
    const { width } = useWindowDimensions();
    const showAssistant = useAssistantStore((s) => s.show);
    const tabs = TAB_DEFS.map((def) => ({ def, route: state.routes.find((r) => r.name === def.name) })).filter(
        (t): t is { def: TabDef; route: (typeof state.routes)[number] } => t.route !== undefined,
    );
    const focusedName = state.routes[state.index]?.name;

    // tabs are equal width, so the notch sits at the centre of the center tab
    const centerIndex = tabs.findIndex((x) => x.def.center);
    const cx = ((centerIndex < 0 ? tabs.length / 2 : centerIndex + 0.5) * width) / Math.max(tabs.length, 1);
    const edge = notchEdge(cx, width);
    const notchH = NOTCH_R + 2; // bar part drawn by the SVG (below that it is a plain white view)
    const svgH = SHADOW + notchH;

    return (
        <View className="flex-row" style={{ paddingTop: PAD_TOP, paddingBottom: Math.max(insets.bottom, 8) }}>
            {/* Bar background. The notch is filled with the screens' page colour so it reads as a cut-out,
                and a soft shadow follows the whole top edge (including the notch) so the bar looks raised. */}
            <Svg pointerEvents="none" width={width} height={svgH} style={{ position: "absolute", top: -SHADOW, left: 0 }}>
                <Rect x={0} y={0} width={width} height={svgH} fill={colors["page-bg"]} />
                <G transform={`translate(0 ${SHADOW})`}>
                    {/* shadow strokes: the white fill drawn next hides their lower half */}
                    <Path d={edge} stroke="#3A1B22" strokeOpacity={0.025} strokeWidth={12} fill="none" />
                    <Path d={edge} stroke="#3A1B22" strokeOpacity={0.035} strokeWidth={6} fill="none" />
                    <Path d={`${edge} L${width} ${notchH} L0 ${notchH} Z`} fill="#fff" />
                    <Path d={edge} stroke={BAR_LINE} strokeWidth={1} fill="none" />
                </G>
            </Svg>
            <View
                pointerEvents="none"
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: notchH - 1, backgroundColor: "#fff" }}
            />

            {tabs.map(({ def, route }) => {
                const focused = route.name === focusedName;
                const { options } = descriptors[route.key];

                const onPress = () => {
                    // The center orb opens the assistant over the current screen instead of switching tabs.
                    if (def.center) {
                        showAssistant();
                        return;
                    }
                    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                    if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
                };
                const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });

                return (
                    <Pressable
                        key={route.key}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: focused }}
                        accessibilityLabel={options.tabBarAccessibilityLabel ?? t(`tabs.${def.labelKey}`)}
                        className="flex-1 items-center active:opacity-70">
                        <View style={{ height: ICON, width: ORB, alignItems: "center" }}>
                            {def.center ? (
                                <CenterOrb />
                            ) : (
                                <Image
                                    source={emIcons[focused || !def.iconInactive ? def.icon : def.iconInactive]}
                                    contentFit="contain"
                                    style={{ width: ICON, height: ICON, opacity: focused ? 1 : 0.85 }}
                                />
                            )}
                        </View>

                        <Text
                            numberOfLines={1}
                            className={focused ? "font-jakarta-bold" : "font-jakarta-medium"}
                            style={{ marginTop: 4, fontSize: 11, color: focused ? ACTIVE : INACTIVE }}>
                            {t(`tabs.${def.labelKey}`)}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

// ask-ai-warm-anim.webp: animated, 384 x 384, transparent; the glass disc spans ~93% of the
// image and the rest is its own baked drop shadow, so the image is drawn larger than ORB.
const ORB_ART = Math.round(ORB / 0.928);

/** Glossy glass AI orb floating in the notch, centred on the bar's top edge. Ring and shadow are baked into the art. */
function CenterOrb() {
    return (
        <View
            style={{
                position: "absolute",
                top: -(PAD_TOP + ORB / 2), // centre exactly on the bar edge = centre of the notch circle
                width: ORB,
                height: ORB,
                alignItems: "center",
                justifyContent: "center",
            }}>
            <Image
                source={require("@/assets/images/ask-ai-warm-anim.webp")}
                contentFit="contain"
                style={{ width: ORB_ART, height: ORB_ART }}
            />
        </View>
    );
}
