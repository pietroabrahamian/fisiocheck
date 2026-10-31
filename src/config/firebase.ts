import AsyncStorage from "@react-native-async-storage/async-storage"
import { getApp, getApps, initializeApp } from "firebase/app"
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Valores do .env (modelo em .env.example)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("[firebase] Variáveis EXPO_PUBLIC_FIREBASE_* não encontradas. Copie .env.example para .env.")
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// A persistência no AsyncStorage mantém o usuário logado ao reabrir o app
function createAuth(): Auth {
    try {
        return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
    } catch {
        // Fast Refresh: o Auth já foi inicializado
        return getAuth(app)
    }
}

export const auth = createAuth()

export const firestore = getFirestore(app)
