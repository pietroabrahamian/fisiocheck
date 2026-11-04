import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore"
import { firestore } from "@/config/firebase"
import { Clinic } from "@/types"

// Cada unidade da clínica é um documento em "clinicas"
const clinicsRef = collection(firestore, "clinicas")

export type ClinicInput = Omit<Clinic, "id">

export async function listClinics(): Promise<Clinic[]> {
    const snapshot = await getDocs(clinicsRef)
    return snapshot.docs
        .map((document) => {
            const data = document.data()
            return {
                id: document.id,
                name: data.name,
                address: data.address ?? "",
                latitude: data.latitude,
                longitude: data.longitude,
                radiusMeters: data.radiusMeters,
            }
        })
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
}

/** Sem id cria uma clínica nova; com id atualiza a existente */
export async function saveClinic(clinic: ClinicInput, id?: string): Promise<void> {
    if (id) {
        await setDoc(doc(clinicsRef, id), clinic)
    } else {
        await addDoc(clinicsRef, clinic)
    }
}
