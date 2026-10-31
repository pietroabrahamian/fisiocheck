import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { firestore } from "@/config/firebase"
import { UserProfile } from "@/types"
import { AppError } from "@/utils/errors"

export async function createProfile(uid: string, profile: UserProfile): Promise<void> {
    await setDoc(doc(firestore, "users", uid), { ...profile, createdAt: serverTimestamp() })
}

export async function getProfile(uid: string): Promise<UserProfile> {
    const snapshot = await getDoc(doc(firestore, "users", uid))
    if (!snapshot.exists()) {
        throw new AppError("Não encontramos o seu perfil. Saia e entre novamente.")
    }
    const data = snapshot.data()
    return { name: data.name, email: data.email, role: data.role === "dono" ? "dono" : "paciente" }
}
