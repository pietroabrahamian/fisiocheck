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
import { Coords, getCurrentCoords } from "./locationService"

const checkinsRef = collection(firestore, "checkins")

function toCheckin(document: QueryDocumentSnapshot<DocumentData>): Checkin {
    const data = document.data()
    return {
        id: document.id,
        patientId: data.patientId,
        patientName: data.patientName,
        // Check-ins anteriores às várias clínicas não têm esses campos
        clinicId: data.clinicId ?? "",
        clinicName: data.clinicName ?? "",
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
    clinics: Clinic[]
}

type ClinicDistance = { clinic: Clinic; distance: number }

function nearest(items: ClinicDistance[]): ClinicDistance {
    return items.reduce((best, current) => (current.distance < best.distance ? current : best))
}

/** Clínica onde o paciente está (dentro do raio) ou, se nenhuma, a mais próxima — para mostrar a distância */
function findClinic(coords: Coords, clinics: Clinic[]): ClinicDistance & { inside: boolean } {
    const all = clinics.map((clinic) => ({ clinic, distance: distanceInMeters(coords, clinic) }))
    const inside = all.filter((item) => item.distance <= item.clinic.radiusMeters)
    return inside.length > 0 ? { ...nearest(inside), inside: true } : { ...nearest(all), inside: false }
}

export async function createCheckin({ patientId, patientName, professional, clinics }: CreateCheckinInput): Promise<Checkin> {
    if (clinics.length === 0) throw new AppError("Nenhuma clínica cadastrada ainda. Avise a recepção.")

    const coords = await getCurrentCoords()
    // O paciente não escolhe a unidade: vale a clínica onde ele está
    const { clinic, distance, inside } = findClinic(coords, clinics)
    if (!inside) {
        throw new AppError(
            `Você está a ${formatDistance(distance)} da clínica mais próxima (${clinic.name}). O check-in só é liberado a até ${formatDistance(clinic.radiusMeters)}.`
        )
    }

    const now = new Date()
    const date = toDateKey(now)
    // O ID com a data garante no máximo um check-in por paciente por dia
    const checkinRef = doc(checkinsRef, `${patientId}_${date}`)
    const checkin: Omit<Checkin, "id" | "createdAt"> = {
        patientId,
        patientName,
        clinicId: clinic.id,
        clinicName: clinic.name,
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
