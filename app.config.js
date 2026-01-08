import "dotenv/config";
export default {
  expo: {
    scheme: "ascend",
    userInterfaceStyle: "dark",
    orientation: "portrait",
    web: {
      output: "static",
    },
    name: "Ascend: Calisthenics",
    slug: "ascend",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    },
    experiments: {
      typedRoutes: true,
    },
    owner: "guan-eric",
  },
};
