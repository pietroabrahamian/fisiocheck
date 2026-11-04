import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { createCheckin, listPatientCheckins, listWeekCheckins } from "@/services/checkinService"
import { ClinicInput, listClinics, saveClinic } from "@/services/clinicService"
import { getProfile } from "@/services/profileService"
import { addProfessional, listProfessionals, setProfessionalActive } from "@/services/professionalService"
import { Professional } from "@/types"

// Chaves do cache do TanStack Query. Invalidar uma chave faz as telas buscarem de novo.
export const queryKeys = {
    profile: (uid: string) => ["profile", uid] as const,
    clinics: ["clinics"] as const,
    professionals: ["professionals"] as const,
    checkins: ["checkins"] as const,
    myCheckins: (uid: string) => ["checkins", "patient", uid] as const,
    weekCheckins: (week: string) => ["checkins", "week", week] as const,
}

function useUid(): string {
    const { user } = useAuth()
    return user?.uid ?? ""
}

export function useProfile() {
    const uid = useUid()
    return useQuery({
        queryKey: queryKeys.profile(uid),
        queryFn: () => getProfile(uid),
        enabled: !!uid,
        // Logo após o cadastro o perfil pode ainda estar sendo gravado
        retry: 3,
        retryDelay: 800,
        staleTime: Infinity,
    })
}

export function useClinics() {
    return useQuery({ queryKey: queryKeys.clinics, queryFn: listClinics })
}

export function useProfessionals() {
    return useQuery({ queryKey: queryKeys.professionals, queryFn: listProfessionals })
}

export function useMyCheckins() {
    const uid = useUid()
    return useQuery({
        queryKey: queryKeys.myCheckins(uid),
        queryFn: () => listPatientCheckins(uid),
        enabled: !!uid,
    })
}

export function useWeekCheckins(week: string) {
    return useQuery({ queryKey: queryKeys.weekCheckins(week), queryFn: () => listWeekCheckins(week) })
}

export function useCreateCheckin() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createCheckin,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.checkins }),
    })
}

export function useSaveClinic() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ clinic, id }: { clinic: ClinicInput; id?: string }) => saveClinic(clinic, id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clinics }),
    })
}

export function useAddProfessional() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ name, specialty }: { name: string; specialty: string }) => addProfessional(name, specialty),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.professionals }),
    })
}

export function useToggleProfessional() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (professional: Professional) => setProfessionalActive(professional.id, !professional.active),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.professionals }),
    })
}
