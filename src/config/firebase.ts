import AsyncStorage from "@react-native-async-storage/async-storage"
import { getApp, getApps, initializeApp } from "firebase/app"
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Projeto Firebase do FisioCheck (fisiocheck-fiap), onde estão as contas de teste do README.
// A configuração web do Firebase não é secreta: quem protege os dados são as regras do Firestore.
// Para usar outro projeto, crie um .env (modelo em .env.example); ele tem prioridade.
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBtCAKWgg4wxkmtDOnCIgWPGv4NtGerTUk",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "fisiocheck-fiap.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "fisiocheck-fiap",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "fisiocheck-fiap.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "436495807872",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:436495807872:web:58e2a4e54f81e678153d65",
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
