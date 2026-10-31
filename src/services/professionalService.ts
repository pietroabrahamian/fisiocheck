import { addDoc, collection, doc, getDocs, updateDoc } from "firebase/firestore"
import { firestore } from "@/config/firebase"
import { Professional } from "@/types"

const professionalsRef = collection(firestore, "profissionais")

export async function listProfessionals(): Promise<Professional[]> {
    const snapshot = await getDocs(professionalsRef)
    return snapshot.docs
        .map((document) => {
            const data = document.data()
            return { id: document.id, name: data.name, specialty: data.specialty ?? "", active: data.active !== false }
        })
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

export async function addProfessional(name: string, specialty: string): Promise<void> {
    await addDoc(professionalsRef, { name: name.trim(), specialty: specialty.trim(), active: true })
}

export async function setProfessionalActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(professionalsRef, id), { active })
}
