import { doc, getDoc, setDoc } from "firebase/firestore"
import { firestore } from "@/config/firebase"
import { Clinic } from "@/types"

// A clínica é um único documento: clinica/config
const clinicRef = doc(firestore, "clinica", "config")

export async function getClinic(): Promise<Clinic | null> {
    const snapshot = await getDoc(clinicRef)
    if (!snapshot.exists()) return null
    const data = snapshot.data()
    return {
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        radiusMeters: data.radiusMeters,
    }
}

export async function saveClinic(clinic: Clinic): Promise<void> {
    await setDoc(clinicRef, clinic)
}
