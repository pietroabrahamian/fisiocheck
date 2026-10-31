export type Role = "paciente" | "dono"

export type UserProfile = {
    name: string
    email: string
    role: Role
}

export type Clinic = {
    name: string
    latitude: number
    longitude: number
    /** Distância máxima, em metros, para aceitar o check-in */
    radiusMeters: number
}

export type Professional = {
    id: string
    name: string
    specialty: string
    active: boolean
}

export type Checkin = {
    /** {patientId}_{AAAA-MM-DD} */
    id: string
    patientId: string
    patientName: string
    professionalId: string
    professionalName: string
    /** AAAA-MM-DD, no horário do aparelho */
    date: string
    /** Semana ISO, ex.: 2026-W44 */
    week: string
    distanceMeters: number
    createdAt: Date | null
}
