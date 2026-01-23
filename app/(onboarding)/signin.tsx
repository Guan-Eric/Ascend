// app/(auth)/signin.tsx
import { View, Text, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { FIREBASE_AUTH } from "../../config/firebase";
import Purchases from "react-native-purchases";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AnimatedPressable } from "../../components/AnimatedPressable";

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                FIREBASE_AUTH,
                email,
                password
            );

            await Purchases.logIn(userCredential.user.uid);

            // Check if they have pro access
            const customerInfo = await Purchases.getCustomerInfo();

            if (customerInfo.entitlements.active["pro"]) {
                router.replace("/(tabs)/(home)");
            } else {
                router.replace("/(onboarding)/paywall");
            }
        } catch (error: any) {
            console.error("Sign in error:", error);

            let message = "Failed to sign in";
            if (error.code === "auth/user-not-found") {
                message = "No account found with this email";
            } else if (error.code === "auth/wrong-password") {
                message = "Incorrect password";
            } else if (error.code === "auth/invalid-email") {
                message = "Invalid email address";
            }

            Alert.alert("Sign In Failed", message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnonymousSignIn = async () => {
        setLoading(true);
        try {
            const userCredential = await signInAnonymously(FIREBASE_AUTH);
            await Purchases.logIn(userCredential.user.uid);

            router.replace("/(onboarding)/step1");
        } catch (error) {
            console.error("Anonymous sign in error:", error);
            Alert.alert("Error", "Failed to start. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-background px-8 justify-center">
            <View className="mb-12">
                <Text className="text-primary text-5xl font-bold mb-3 text-center">
                    Welcome Back
                </Text>
                <Text className="text-text-secondary text-center text-lg">
                    Sign in to continue your journey
                </Text>
            </View>

            <View className="card-frosted p-6 rounded-3xl mb-6 shadow-elevated">
                <Text className="text-text-secondary text-sm mb-2 font-medium">Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#7a86a8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-surface-elevated text-text-primary px-4 py-3 rounded-xl mb-4"
                />

                <Text className="text-text-secondary text-sm mb-2 font-medium">Password</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#7a86a8"
                    secureTextEntry
                    className="bg-surface-elevated text-text-primary px-4 py-3 rounded-xl"
                />
            </View>

            <AnimatedPressable
                onPress={handleEmailSignIn}
                disabled={loading}
                className="bg-primary py-4 rounded-2xl mb-4 shadow-elevated"
            >
                <Text className="text-background text-center font-bold text-lg">
                    {loading ? "Signing In..." : "Sign In"}
                </Text>
            </AnimatedPressable>

            <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-text-muted px-4">OR</Text>
                <View className="flex-1 h-px bg-border" />
            </View>

            <AnimatedPressable
                onPress={handleAnonymousSignIn}
                disabled={loading}
                className="card-frosted border-2 border-primary py-4 rounded-2xl shadow-elevated"
            >
                <Text className="text-primary text-center font-bold text-lg">
                    Continue as Guest
                </Text>
            </AnimatedPressable>

            <Text className="text-text-muted text-xs text-center mt-8 leading-5">
                Don't have an account? Sign up as a guest and link your email later in settings.
            </Text>
        </View>
    );
}
