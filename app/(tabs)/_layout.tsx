// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUniwind } from "uniwind";
import { useCallback, useEffect, useState } from "react";
import Purchases from "react-native-purchases";
import { FIREBASE_AUTH } from "../../config/firebase";
import { getUser } from "../../backend";
import { PRO_ENTITLEMENT_ID } from "../../constants/revenuecat";
import { paywallHref } from "../../utils/access";

const tabThemeColors: Record<
  string,
  {
    background: string;
    border: string;
    active: string;
    inactive: string;
  }
> = {
  dark: {
    background: "#0b1220",
    border: "#27272a",
    active: "#38e8ff",
    inactive: "#71717a",
  },
  light: {
    background: "#ffffff",
    border: "#dbe2f3",
    active: "#2563eb",
    inactive: "#64748b",
  },
  zen: {
    background: "#ffffff",
    border: "#e5e7eb",
    active: "#2563eb",
    inactive: "#64748b",
  },
  matcha: {
    background: "#f3f7f2",
    border: "#c7d3c0",
    active: "#3f7d4f",
    inactive: "#6b7280",
  },
  ube: {
    background: "#2a1938",
    border: "#3a2550",
    active: "#c084fc",
    inactive: "#a1a1aa",
  },
  coffee: {
    background: "#1e1a16",
    border: "#3b2f24",
    active: "#d6a26a",
    inactive: "#9ca3af",
  },
  ascend: {
    background: "#17181B",
    border: "#2A2B2E",
    active: "#A8D93F",
    inactive: "#8A8B8D",
  },
};

export default function TabsLayout() {
  const { theme } = useUniwind();
  const tabColors = tabThemeColors[theme] ?? tabThemeColors.dark;
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
          backgroundColor: tabColors.background,
          borderTopColor: tabColors.border,
        },
        tabBarActiveTintColor: tabColors.active,
        tabBarInactiveTintColor: tabColors.inactive,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-variant-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(skills)"
        listeners={{
          tabPress: (e) => {
            if (!requirePro()) e.preventDefault();
          },
        }}
        options={{
          title: "Skills",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="human-handsup"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(strength)"
        listeners={{
          tabPress: (e) => {
            if (!requirePro()) e.preventDefault();
          },
        }}
        options={{
          title: "Strength",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="arm-flex-outline"
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
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
