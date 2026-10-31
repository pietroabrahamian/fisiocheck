import * as Location from "expo-location"
import { AppError } from "@/utils/errors"

/** Permissão negada: a tela oferece um botão para abrir as configurações do aparelho */
export class LocationPermissionError extends AppError {}

export type Coords = { latitude: number; longitude: number }

const TIMEOUT_MS = 15_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new AppError("Não conseguimos achar sua localização. Vá para um local aberto e tente de novo.")),
            ms
        )
        promise.then(
            (value) => {
                clearTimeout(timer)
                resolve(value)
            },
            (error) => {
                clearTimeout(timer)
                reject(error)
            }
        )
    })
}

export async function getCurrentCoords(): Promise<Coords> {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
        throw new LocationPermissionError("Precisamos da sua localização para confirmar que você está na clínica.")
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync()
    if (!servicesEnabled) {
        throw new AppError("A localização do aparelho está desligada. Ative o GPS e tente novamente.")
    }

    try {
        const position = await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            TIMEOUT_MS
        )
        return { latitude: position.coords.latitude, longitude: position.coords.longitude }
    } catch (error) {
        if (error instanceof AppError) throw error
        throw new AppError("Não foi possível obter sua localização. Tente novamente.")
    }
}
