import {
    collection,
    doc,
    DocumentData,
    getDocs,
    query,
    QueryDocumentSnapshot,
    runTransaction,
    serverTimestamp,
    where,
} from "firebase/firestore"
import { firestore } from "@/config/firebase"
import { Checkin, Clinic, Professional } from "@/types"
import { toDateKey, toWeekKey } from "@/utils/dates"
import { distanceInMeters, formatDistance } from "@/utils/distance"
import { AppError } from "@/utils/errors"
import { getCurrentCoords } from "./locationService"

const checkinsRef = collection(firestore, "checkins")

function toCheckin(document: QueryDocumentSnapshot<DocumentData>): Checkin {
    const data = document.data()
    return {
        id: document.id,
        patientId: data.patientId,
        patientName: data.patientName,
        professionalId: data.professionalId,
        professionalName: data.professionalName,
        date: data.date,
        week: data.week,
        distanceMeters: data.distanceMeters,
        createdAt: data.createdAt?.toDate?.() ?? null,
    }
}

// Mais recentes primeiro
function byNewest(a: Checkin, b: Checkin): number {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
}

type CreateCheckinInput = {
    patientId: string
    patientName: string
    professional: Professional
    clinic: Clinic
}

export async function createCheckin({ patientId, patientName, professional, clinic }: CreateCheckinInput): Promise<Checkin> {
    const coords = await getCurrentCoords()
    const distance = distanceInMeters(coords, clinic)
    if (distance > clinic.radiusMeters) {
        throw new AppError(
            `Você está a ${formatDistance(distance)} da clínica. O check-in só é liberado a até ${formatDistance(clinic.radiusMeters)}.`
        )
    }
    const now = new Date()
    const date = toDateKey(now)
    // O ID com a data garante no máximo um check-in por paciente por dia
    const checkinRef = doc(checkinsRef, `${patientId}_${date}`)
    const checkin: Omit<Checkin, "id" | "createdAt"> = {
        patientId,
        patientName,
        professionalId: professional.id,
        professionalName: professional.name,
        date,
        week: toWeekKey(now),
        distanceMeters: Math.round(distance),
    }

    await runTransaction(firestore, async (transaction) => {
        const existing = await transaction.get(checkinRef)
        if (existing.exists()) {
            throw new AppError("Você já fez check-in hoje. Até a próxima sessão!")
        }
        transaction.set(checkinRef, { ...checkin, createdAt: serverTimestamp() })
    })

    return { ...checkin, id: checkinRef.id, createdAt: now }
}

export async function listPatientCheckins(patientId: string): Promise<Checkin[]> {
    const snapshot = await getDocs(query(checkinsRef, where("patientId", "==", patientId)))
    return snapshot.docs.map(toCheckin).sort(byNewest)
}

export async function listWeekCheckins(week: string): Promise<Checkin[]> {
    const snapshot = await getDocs(query(checkinsRef, where("week", "==", week)))
    return snapshot.docs.map(toCheckin).sort(byNewest)
}
