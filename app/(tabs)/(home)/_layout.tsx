import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create-plan" />
      <Stack.Screen name="workout-presets" />
      <Stack.Screen name="preset-details" />
      <Stack.Screen name="edit-plan" />
      <Stack.Screen name="workout" options={{gestureEnabled:false}} />
    </Stack>
  );
}
