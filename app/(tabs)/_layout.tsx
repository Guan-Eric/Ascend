// app/(tabs)/_layout.tsx — Wave A: Today · Plan · Progress · You
import { Tabs, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUniwind } from "uniwind";
import { useCallback, useEffect, useState } from "react";
import Purchases from "react-native-purchases";
import { FIREBASE_AUTH } from "../../config/firebase";
import { getUser } from "../../backend";
import { PRO_ENTITLEMENT_ID } from "../../constants/revenuecat";
import { paywallHref } from "../../utils/access";
import { colors, getThemeColor } from "../../utils/theme";

export default function TabsLayout() {
  const { theme } = useUniwind();
  const isDark = theme === "dark";
  const active = getThemeColor(theme, "primary");
  const inactive = getThemeColor(theme, "muted");
  const background = isDark ? colors.dark : colors.canvas;
  const border = getThemeColor(theme, "border");

  const router = useRouter();
  const [hasProAccess, setHasProAccess] = useState(true);
  const [userMeta, setUserMeta] = useState<{
    level?: string;
    trainingDays?: number;
    goalType?: string;
    primaryGoalId?: string;
  }>({});

  const refreshAccess = useCallback(async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro =
        customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
      setHasProAccess(isPro);

      const uid = FIREBASE_AUTH.currentUser?.uid;
      if (uid) {
        const user = await getUser(uid);
        if (user) {
          setUserMeta({
            level: user.level,
            trainingDays: user.trainingDaysPerWeek,
            goalType: user.goalType,
            primaryGoalId: user.primaryGoalId,
          });
        }
      }
    } catch (error) {
      console.error("Error checking tab access:", error);
    }
  }, []);

  useEffect(() => {
    refreshAccess();
  }, [refreshAccess]);

  const requirePro = () => {
    if (hasProAccess) return true;
    router.push(
      paywallHref({
        source: "tab_gate",
        ...userMeta,
      })
    );
    return false;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarLabelStyle: {
          fontFamily: "DMSans_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-today"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(plan)"
        listeners={{
          tabPress: (e) => {
            if (!requirePro()) e.preventDefault();
          },
        }}
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-month-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(progress)"
        listeners={{
          tabPress: (e) => {
            if (!requirePro()) e.preventDefault();
          },
        }}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        listeners={{
          tabPress: (e) => {
            if (!requirePro()) e.preventDefault();
          },
        }}
        options={{
          title: "You",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden — detail routes still reachable from Progress */}
      <Tabs.Screen
        name="(skills)"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="(strength)"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
