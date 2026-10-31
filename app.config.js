module.exports = {
    name: "FisioCheck",
    slug: "fisiocheck",
    scheme: "fisiocheck",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
        supportsTablet: false,
        bundleIdentifier: "br.com.fiap.fisiocheck",
    },
    android: {
        package: "br.com.fiap.fisiocheck",
        adaptiveIcon: {
            backgroundColor: "#0E5E5A",
            foregroundImage: "./assets/android-icon-foreground.png",
            backgroundImage: "./assets/android-icon-background.png",
            monochromeImage: "./assets/android-icon-monochrome.png",
        },
    },
    web: {
        favicon: "./assets/favicon.png",
    },
    plugins: [
        "expo-router",
        [
            "expo-location",
            { locationWhenInUsePermission: "O FisioCheck usa sua localização para confirmar que você está na clínica no check-in." },
        ],
    ],
}
