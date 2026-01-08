import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../../config/firebase";
import { useEffect, useState } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";

export default function ProfileScreen() {
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(FIREBASE_AUTH);
            router.replace("/(onboarding)/step1");
          } catch (error) {
            console.error("Sign out error:", error);
          }
        },
      },
    ]);
  };

  const hasProAccess = customerInfo?.entitlements.active["pro"] !== undefined;
  const expirationDate =
    customerInfo?.entitlements.active["pro"]?.expirationDate;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-16">
        <Text className="text-primary text-4xl font-bold mb-8">Profile</Text>

        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-text-secondary mb-2 font-medium">User ID</Text>
          <Text className="text-text-primary text-sm font-mono">
            {FIREBASE_AUTH.currentUser?.uid.substring(0, 20)}...
          </Text>
          <Text className="text-text-muted text-xs mt-2">
            {FIREBASE_AUTH.currentUser?.isAnonymous
              ? "Anonymous Account"
              : "Registered Account"}
          </Text>
        </View>

        <View className="bg-surface p-6 rounded-xl mb-4 border border-border">
          <Text className="text-text-secondary mb-2 font-medium">
            Subscription Status
          </Text>
          <Text
            className={`text-xl font-bold ${
              hasProAccess ? "text-success" : "text-error"
            }`}
          >
            {hasProAccess ? "Pro Active ✓" : "No Active Subscription"}
          </Text>
          {expirationDate && (
            <Text className="text-text-secondary mt-2 text-sm">
              {customerInfo?.entitlements.active["pro"]?.willRenew
                ? `Renews: ${new Date(expirationDate).toLocaleDateString()}`
                : `Expires: ${new Date(expirationDate).toLocaleDateString()}`}
            </Text>
          )}
        </View>

        <Pressable
          onPress={async () => {
            try {
              const info = await Purchases.restorePurchases();
              setCustomerInfo(info);
              Alert.alert("Success", "Purchases restored successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to restore purchases");
            }
          }}
          className="bg-primary py-4 rounded-xl mb-4"
        >
          <Text className="text-background text-center font-bold text-base">
            Restore Purchases
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSignOut}
          className="border-2 border-error py-4 rounded-xl"
        >
          <Text className="text-error text-center font-bold text-base">
            Reset App
          </Text>
        </Pressable>

        <Text className="text-text-muted text-xs text-center mt-4">
          Resetting will sign you out and clear your session
        </Text>
      </View>
    </ScrollView>
  );
}
