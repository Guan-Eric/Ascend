import "dotenv/config";
export default {
  expo: {
    scheme: "ascend",
    userInterfaceStyle: "automatic",
    orientation: "portrait",
    platforms: ["ios", "android"],
    name: "Ascend: Calisthenics",
    slug: "ascend",
    icon: "./assets/ascend_icon.jpg",
    splash: {
      image: "./assets/ascend_logo.png",
      resizeMode: "contain",
      backgroundColor: "#17181B",
    },
    ios: {
      bundleIdentifier: 'com.ascend.calisthenics',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    plugins: [["expo-font"], "expo-router", "expo-status-bar"],
    extra: {
      eas: {
        projectId: "fc4507c1-e06b-4acc-8537-55dfa89cc3cd"
      },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
      measurementApiSecret: process.env.MEASUREMENT_API_SECRET,
      revenuecatApiKey: process.env.REVENUECAT_API_KEY,
    },
    experiments: {
      typedRoutes: true,
    },
    owner: "guan-eric",
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/fc4507c1-e06b-4acc-8537-55dfa89cc3cd"
    }
  },
};
