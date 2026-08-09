import { View, Text, TextInput, Alert, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { FIREBASE_AUTH } from "../../config/firebase";
import Purchases from "react-native-purchases";
import { getUser } from "../../backend";
import { paywallHref, resolveAppAccess } from "../../utils/access";
import { Screen, Button } from "../../components/ui";
import { FadeSlideIn } from "../../components/FadeSlideIn";
import { useThemeColor } from "../../utils/theme";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const muted = useThemeColor("muted");

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

      const userData = await getUser(userCredential.user.uid);

      if (!userData) {
        router.replace("/(onboarding)/step1");
        return;
      }

      const access = await resolveAppAccess(userData);

      if (access.kind === "pro" || access.kind === "sample") {
        router.replace("/(tabs)/(home)");
      } else {
        router.replace(
          paywallHref({
            source:
              access.reason === "sample_completed"
                ? "sample_workout"
                : "returning",
            level: userData.level,
            trainingDays: userData.trainingDaysPerWeek,
            goalType: userData.goalType,
            primaryGoalId: userData.primaryGoalId,
          })
        );
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
    <Screen className="justify-center" edges={["top", "bottom"]}>
      <FadeSlideIn>
        <View className="items-center mb-10">
          <Image
            source={require("../../assets/ascend_icon.png")}
            style={{ width: 72, height: 72, marginBottom: 20 }}
            resizeMode="contain"
          />
          <Text className="text-text-primary text-[40px] font-sans-semibold tracking-tight mb-3">
            Ascend
          </Text>
          <Text className="text-text-muted text-[16px] font-sans text-center leading-6">
            Your coach that adapts
          </Text>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={80}>
        <View className="mb-6">
          <Text className="text-text-muted text-[13px] font-sans-medium mb-2">
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={muted}
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-surface border border-border text-text-primary px-4 py-3.5 rounded-lg mb-4 font-sans text-[15px]"
          />

          <Text className="text-text-muted text-[13px] font-sans-medium mb-2">
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={muted}
            secureTextEntry
            className="bg-surface border border-border text-text-primary px-4 py-3.5 rounded-lg font-sans text-[15px]"
          />
        </View>

        <Button
          label={loading ? "Signing in…" : "Sign in"}
          onPress={handleEmailSignIn}
          disabled={loading}
          className="mb-3"
        />

        <Button
          label="Continue as guest"
          variant="ghost"
          onPress={handleAnonymousSignIn}
          disabled={loading}
        />

        <Text className="text-text-muted text-[12px] font-sans text-center mt-8 leading-5">
          New here? Continue as guest — you can link email later in You.
        </Text>
      </FadeSlideIn>
    </Screen>
  );
}
