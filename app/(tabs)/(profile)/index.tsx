// app/(tabs)/(profile)/index.tsx — You tab (Wave A)
import { View, Text, Alert, TextInput } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import {
  signOut,
  linkWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { FIREBASE_AUTH } from "../../../config/firebase";
import { useCallback, useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import * as backend from "../../../backend";
import { User } from "../../../types/User";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeSwitcher } from "../../../components/ThemeSwitcher";
import { useThemeColor } from "../../../utils/theme";
import { AnimatedPressable } from "../../../components/AnimatedPressable";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { FadeSlideIn } from "../../../components/FadeSlideIn";
import { PRO_ENTITLEMENT_ID } from "../../../constants/revenuecat";
import { Screen, Button } from "../../../components/ui";

export default function YouScreen() {
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmailLink, setShowEmailLink] = useState(false);
  const [checkInCadence, setCheckInCadence] = useState<"weekly" | "monthly">(
    "weekly"
  );
  const primaryColor = useThemeColor("primary");
  const errorColor = useThemeColor("error");
  const mutedColor = useThemeColor("muted");

  const [editLevel, setEditLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [editDays, setEditDays] = useState(3);
  const [editGoalType, setEditGoalType] = useState<"skill" | "strength">(
    "strength"
  );
  const [editPrimaryGoalId, setEditPrimaryGoalId] = useState("");
  const [editAutoProgress, setEditAutoProgress] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      const userData = await backend.getUser(userId);
      setUser(userData);

      if (userData) {
        setEditLevel(userData.level);
        setEditDays(userData.trainingDaysPerWeek);
        setEditGoalType(userData.goalType);
        setEditPrimaryGoalId(userData.primaryGoalId);
        setEditAutoProgress(userData.autoProgressExercises);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) return;

      await backend.updateUser(userId, {
        level: editLevel,
        trainingDaysPerWeek: editDays,
        goalType: editGoalType,
        primaryGoalId: editPrimaryGoalId,
        autoProgressExercises: editAutoProgress,
      });

      Alert.alert("Saved", "Profile updated");
      setShowSettings(false);
      loadUserData();
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const handleLinkEmail = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
        Alert.alert("Error", "Not an anonymous account");
        return;
      }

      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(currentUser, credential);

      Alert.alert("Success", "Email linked to your account");
      setShowEmailLink(false);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Error linking email:", error);
      Alert.alert("Error", error.message || "Failed to link email");
    }
  };

  const handleSignOut = async () => {
    try {
      await Purchases.logOut().catch(() => undefined);
      await signOut(FIREBASE_AUTH);
      router.replace("/(onboarding)/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This permanently deletes your account and training data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const currentUser = FIREBASE_AUTH.currentUser;
              if (!currentUser) return;

              await backend.deleteUserAccount(currentUser.uid);
              try {
                await Purchases.logOut();
              } catch {
                /* ignore */
              }
              await deleteUser(currentUser);
              await signOut(FIREBASE_AUTH);
              router.replace("/(onboarding)/signin");
            } catch (error: any) {
              if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                  "Re-authentication required",
                  "Sign out, sign back in, then try deleting again."
                );
              } else {
                Alert.alert(
                  "Error",
                  error.message || "Failed to delete account"
                );
              }
            }
          },
        },
      ]
    );
  };

  const hasProAccess =
    customerInfo?.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
  const proEntitlement =
    customerInfo?.entitlements.active[PRO_ENTITLEMENT_ID];
  const expirationDate = proEntitlement?.expirationDate;
  const isTrial = proEntitlement?.periodType === "TRIAL";

  const formatExpiration = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Screen className="justify-center items-center" padded={false}>
        <LoadingSpinner size={56} />
      </Screen>
    );
  }

  if (showEmailLink && FIREBASE_AUTH.currentUser?.isAnonymous) {
    return (
      <Screen edges={["top"]}>
        <AnimatedPressable
          onPress={() => setShowEmailLink(false)}
          className="mb-6"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={primaryColor}
          />
        </AnimatedPressable>
        <Text className="text-text-primary text-[28px] font-sans-semibold mb-2">
          Link email
        </Text>
        <Text className="text-text-muted font-sans text-[15px] mb-6">
          Convert your guest account to a permanent login
        </Text>
        <Text className="text-text-muted text-[13px] font-sans-medium mb-2">
          Email
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor={mutedColor}
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-surface border border-border text-text-primary px-4 py-3.5 rounded-lg mb-4 font-sans"
        />
        <Text className="text-text-muted text-[13px] font-sans-medium mb-2">
          Password
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Min 6 characters"
          placeholderTextColor={mutedColor}
          secureTextEntry
          className="bg-surface border border-border text-text-primary px-4 py-3.5 rounded-lg font-sans mb-6"
        />
        <Button label="Link email" onPress={handleLinkEmail} />
      </Screen>
    );
  }

  if (showSettings) {
    return (
      <Screen padded={false} edges={["top"]}>
        <FlashList
          data={[
            "header",
            "experience",
            "days",
            "goal",
            "autoprogress",
            "save",
          ]}
          keyExtractor={(item) => item}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 48,
          }}
          renderItem={({ item }) => {
            if (item === "header") {
              return (
                <View className="flex-row items-center mb-8 gap-3">
                  <AnimatedPressable onPress={() => setShowSettings(false)}>
                    <MaterialCommunityIcons
                      name="arrow-left"
                      size={24}
                      color={primaryColor}
                    />
                  </AnimatedPressable>
                  <Text className="text-text-primary text-[28px] font-sans-semibold">
                    Profile
                  </Text>
                </View>
              );
            }
            if (item === "experience") {
              return (
                <View className="mb-6">
                  <Text className="text-text-muted text-[13px] font-sans-medium mb-3 uppercase tracking-wide">
                    Experience
                  </Text>
                  <View className="flex-row gap-2">
                    {(
                      ["beginner", "intermediate", "advanced"] as const
                    ).map((level) => (
                      <AnimatedPressable
                        key={level}
                        onPress={() => setEditLevel(level)}
                        className={`flex-1 py-3.5 rounded-lg border ${
                          editLevel === level
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        <Text
                          className={`text-center font-sans-semibold capitalize text-[13px] ${
                            editLevel === level
                              ? "text-primary"
                              : "text-text-secondary"
                          }`}
                        >
                          {level}
                        </Text>
                      </AnimatedPressable>
                    ))}
                  </View>
                </View>
              );
            }
            if (item === "days") {
              return (
                <View className="mb-6">
                  <Text className="text-text-muted text-[13px] font-sans-medium mb-3 uppercase tracking-wide">
                    Training days / week
                  </Text>
                  <View className="flex-row items-center justify-center gap-6 py-4">
                    <AnimatedPressable
                      onPress={() => setEditDays(Math.max(1, editDays - 1))}
                      className="w-11 h-11 rounded-lg border border-border items-center justify-center"
                    >
                      <MaterialCommunityIcons
                        name="minus"
                        size={22}
                        color={primaryColor}
                      />
                    </AnimatedPressable>
                    <Text className="text-text-primary text-[32px] font-sans-semibold w-12 text-center">
                      {editDays}
                    </Text>
                    <AnimatedPressable
                      onPress={() => setEditDays(Math.min(7, editDays + 1))}
                      className="w-11 h-11 rounded-lg border border-border items-center justify-center"
                    >
                      <MaterialCommunityIcons
                        name="plus"
                        size={22}
                        color={primaryColor}
                      />
                    </AnimatedPressable>
                  </View>
                </View>
              );
            }
            if (item === "goal") {
              return (
                <View className="mb-6">
                  <Text className="text-text-muted text-[13px] font-sans-medium mb-3 uppercase tracking-wide">
                    Goal type
                  </Text>
                  <View className="flex-row bg-surface-elevated p-1 rounded-lg">
                    {(
                      [
                        ["strength", "Strength"],
                        ["skill", "Skills"],
                      ] as const
                    ).map(([value, label]) => (
                      <AnimatedPressable
                        key={value}
                        onPress={() => setEditGoalType(value)}
                        className={`flex-1 py-3 rounded-md ${
                          editGoalType === value ? "bg-surface" : ""
                        }`}
                      >
                        <Text
                          className={`text-center font-sans-semibold text-[14px] ${
                            editGoalType === value
                              ? "text-text-primary"
                              : "text-text-muted"
                          }`}
                        >
                          {label}
                        </Text>
                      </AnimatedPressable>
                    ))}
                  </View>
                </View>
              );
            }
            if (item === "autoprogress") {
              return (
                <View className="mb-8">
                  <AnimatedPressable
                    onPress={() => setEditAutoProgress(!editAutoProgress)}
                    className="flex-row items-center py-2"
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-text-primary font-sans-semibold text-[15px] mb-1">
                        Auto-progress exercises
                      </Text>
                      <Text className="text-text-muted font-sans text-[13px] leading-5">
                        Move to the next progression when you complete one
                      </Text>
                    </View>
                    <View
                      className={`w-12 h-7 rounded-full p-0.5 ${
                        editAutoProgress ? "bg-primary" : "bg-surface-elevated"
                      }`}
                    >
                      <View
                        className={`w-6 h-6 rounded-full bg-background ${
                          editAutoProgress ? "ml-auto" : ""
                        }`}
                      />
                    </View>
                  </AnimatedPressable>
                </View>
              );
            }
            return <Button label="Save changes" onPress={handleSaveSettings} />;
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={["top"]}>
      <FlashList
        className="flex-1"
        data={[0]}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 112 }}
        renderItem={() => (
          <>
            <FadeSlideIn>
              <Text className="text-text-primary text-[28px] font-sans-semibold mb-1">
                You
              </Text>
              <Text className="text-text-muted text-[15px] font-sans mb-8">
                Account & preferences
              </Text>
            </FadeSlideIn>

            <FadeSlideIn delay={40}>
              <Text className="text-text-muted text-[13px] font-sans-medium uppercase tracking-wide mb-3">
                Profile
              </Text>
              <AnimatedPressable
                onPress={() => setShowSettings(true)}
                className="flex-row items-center py-4 border-b border-border"
              >
                <View className="flex-1">
                  <Text className="text-text-primary font-sans-semibold text-[15px]">
                    Training profile
                  </Text>
                  <Text className="text-text-muted font-sans text-[13px] mt-1 capitalize">
                    {user?.level ?? "—"} · {user?.trainingDaysPerWeek ?? "—"}{" "}
                    days · {user?.goalType ?? "—"}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={mutedColor}
                />
              </AnimatedPressable>

              {FIREBASE_AUTH.currentUser?.isAnonymous && (
                <AnimatedPressable
                  onPress={() => setShowEmailLink(true)}
                  className="flex-row items-center py-4 border-b border-border"
                >
                  <View className="flex-1">
                    <Text className="text-text-primary font-sans-semibold text-[15px]">
                      Link email
                    </Text>
                    <Text className="text-text-muted font-sans text-[13px] mt-1">
                      Secure your guest account
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={mutedColor}
                  />
                </AnimatedPressable>
              )}
            </FadeSlideIn>

            <FadeSlideIn delay={80}>
              <View className="mt-8">
                <ThemeSwitcher />
              </View>
            </FadeSlideIn>

            <FadeSlideIn delay={100}>
              <Text className="text-text-muted text-[13px] font-sans-medium uppercase tracking-wide mb-3">
                Check-in cadence
              </Text>
              <View className="flex-row bg-surface-elevated p-1 rounded-lg mb-8">
                {(
                  [
                    ["weekly", "Weekly"],
                    ["monthly", "Monthly"],
                  ] as const
                ).map(([value, label]) => (
                  <AnimatedPressable
                    key={value}
                    onPress={() => setCheckInCadence(value)}
                    className={`flex-1 py-3 rounded-md ${
                      checkInCadence === value ? "bg-surface" : ""
                    }`}
                  >
                    <Text
                      className={`text-center font-sans-semibold text-[14px] ${
                        checkInCadence === value
                          ? "text-text-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {label}
                    </Text>
                  </AnimatedPressable>
                ))}
              </View>
            </FadeSlideIn>

            <FadeSlideIn delay={120}>
              <Text className="text-text-muted text-[13px] font-sans-medium uppercase tracking-wide mb-3">
                Pro
              </Text>
              <View className="py-4 border-b border-border mb-2">
                {hasProAccess ? (
                  <>
                    <Text className="text-text-primary font-sans-semibold text-[15px] mb-1">
                      Ascend Pro{isTrial ? " · Trial" : ""}
                    </Text>
                    {expirationDate && (
                      <Text className="text-text-muted font-sans text-[13px]">
                        {isTrial ? "Trial ends" : "Renews"}{" "}
                        {formatExpiration(expirationDate)}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text className="text-text-primary font-sans-semibold text-[15px] mb-1">
                      Free
                    </Text>
                    <Text className="text-text-muted font-sans text-[13px] mb-4">
                      Unlock the coach that adapts
                    </Text>
                    <Button
                      label="Upgrade to Pro"
                      variant="ghost"
                      onPress={() => router.push("/(onboarding)/paywall")}
                    />
                  </>
                )}
              </View>
              <AnimatedPressable
                onPress={async () => {
                  try {
                    const info = await Purchases.restorePurchases();
                    setCustomerInfo(info);
                    Alert.alert("Restored", "Purchases restored");
                  } catch {
                    Alert.alert("Error", "Failed to restore purchases");
                  }
                }}
                className="py-4 border-b border-border mb-8"
              >
                <Text className="text-primary font-sans-medium text-[15px]">
                  Restore purchases
                </Text>
              </AnimatedPressable>
            </FadeSlideIn>

            <FadeSlideIn delay={140}>
              <Button
                label="Sign out"
                variant="ghost"
                onPress={handleSignOut}
                className="mb-3"
              />
              <AnimatedPressable
                onPress={handleDeleteAccount}
                className="py-4 flex-row items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={18}
                  color={errorColor}
                />
                <Text className="text-error font-sans-medium text-[15px] ml-2">
                  Delete account
                </Text>
              </AnimatedPressable>
            </FadeSlideIn>
          </>
        )}
      />
    </Screen>
  );
}
