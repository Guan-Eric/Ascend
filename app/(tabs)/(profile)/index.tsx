import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
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
            await signOut(auth);
            router.replace("/(auth)/welcome");
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
    <ScrollView className="flex-1 bg-slate-900">
      <View className="px-6 pt-16">
        <Text className="text-white text-3xl font-bold mb-8">Profile</Text>

        {/* User Info */}
        <View className="bg-slate-800 p-6 rounded-lg mb-4">
          <Text className="text-slate-400 mb-2">Email</Text>
          <Text className="text-white text-lg">{auth.currentUser?.email}</Text>
        </View>

        {/* Subscription Status */}
        <View className="bg-slate-800 p-6 rounded-lg mb-4">
          <Text className="text-slate-400 mb-2">Subscription Status</Text>
          <Text
            className={`text-lg font-semibold ${
              hasProAccess ? "text-green-500" : "text-red-500"
            }`}
          >
            {hasProAccess ? "Pro Active" : "No Active Subscription"}
          </Text>
          {expirationDate && (
            <Text className="text-slate-400 mt-2 text-sm">
              {customerInfo?.entitlements.active["pro"]?.willRenew
                ? `Renews: ${new Date(expirationDate).toLocaleDateString()}`
                : `Expires: ${new Date(expirationDate).toLocaleDateString()}`}
            </Text>
          )}
        </View>

        {/* Restore Purchases */}
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
          className="bg-blue-600 py-4 rounded-lg mb-4"
        >
          <Text className="text-white text-center font-semibold">
            Restore Purchases
          </Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="border border-red-600 py-4 rounded-lg"
        >
          <Text className="text-red-600 text-center font-semibold">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
