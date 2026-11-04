import * as Location from "expo-location"
import { describeCoords, geocodeAddress, getCurrentCoords, LocationPermissionError } from "@/services/locationService"
import { AppError } from "@/utils/errors"

jest.mock("expo-location", () => ({
    Accuracy: { Balanced: 3 },
    requestForegroundPermissionsAsync: jest.fn(),
    hasServicesEnabledAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
    geocodeAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
}))

const mocked = Location as jest.Mocked<typeof Location>

function grant(status: "granted" | "denied") {
    mocked.requestForegroundPermissionsAsync.mockResolvedValue({ status } as Location.LocationPermissionResponse)
}

beforeEach(() => {
    jest.clearAllMocks()
    grant("granted")
    mocked.hasServicesEnabledAsync.mockResolvedValue(true)
})

describe("getCurrentCoords", () => {
    it("devolve a posição atual", async () => {
        mocked.getCurrentPositionAsync.mockResolvedValue({
            coords: { latitude: -23.56, longitude: -46.65 },
        } as Location.LocationObject)
        await expect(getCurrentCoords()).resolves.toEqual({ latitude: -23.56, longitude: -46.65 })
    })

    it("lança LocationPermissionError se a permissão for negada", async () => {
        grant("denied")
        await expect(getCurrentCoords()).rejects.toBeInstanceOf(LocationPermissionError)
        expect(mocked.getCurrentPositionAsync).not.toHaveBeenCalled()
    })

    it("avisa quando o GPS está desligado", async () => {
        mocked.hasServicesEnabledAsync.mockResolvedValue(false)
        await expect(getCurrentCoords()).rejects.toThrow("Ative o GPS")
    })

    it("troca erro técnico por mensagem amigável", async () => {
        mocked.getCurrentPositionAsync.mockRejectedValue(new Error("E_LOCATION_UNAVAILABLE"))
        await expect(getCurrentCoords()).rejects.toThrow("Não foi possível obter sua localização")
    })

    it("desiste depois de 15 s", async () => {
        jest.useFakeTimers()
        mocked.getCurrentPositionAsync.mockReturnValue(new Promise(() => {}))
        const result = getCurrentCoords()
        const assertion = expect(result).rejects.toThrow("Não conseguimos achar sua localização")
        await jest.advanceTimersByTimeAsync(15_000)
        await assertion
        jest.useRealTimers()
    })
})

describe("geocodeAddress", () => {
    it("converte o endereço no primeiro resultado", async () => {
        mocked.geocodeAsync.mockResolvedValue([{ latitude: -23.5641, longitude: -46.6527 } as Location.LocationGeocodedLocation])
        await expect(geocodeAddress("Av. Paulista, 1106")).resolves.toEqual({ latitude: -23.5641, longitude: -46.6527 })
    })

    it("avisa quando o endereço não existe", async () => {
        mocked.geocodeAsync.mockResolvedValue([])
        await expect(geocodeAddress("Rua que não existe")).rejects.toThrow("Endereço não encontrado")
    })

    it("pede a permissão antes de buscar", async () => {
        grant("denied")
        await expect(geocodeAddress("Av. Paulista")).rejects.toBeInstanceOf(LocationPermissionError)
        expect(mocked.geocodeAsync).not.toHaveBeenCalled()
    })

    it("troca falha do serviço por AppError", async () => {
        mocked.geocodeAsync.mockRejectedValue(new Error("network"))
        await expect(geocodeAddress("Av. Paulista")).rejects.toBeInstanceOf(AppError)
    })
})

describe("describeCoords", () => {
    it("monta o endereço legível", async () => {
        mocked.reverseGeocodeAsync.mockResolvedValue([
            { street: "Av. Paulista", streetNumber: "1106", district: "Bela Vista", city: "São Paulo", region: "SP" },
        ] as Location.LocationGeocodedAddress[])
        await expect(describeCoords({ latitude: 0, longitude: 0 })).resolves.toBe("Av. Paulista, 1106 - Bela Vista - São Paulo - SP")
    })

    it("devolve vazio se o aparelho não souber", async () => {
        mocked.reverseGeocodeAsync.mockRejectedValue(new Error("x"))
        await expect(describeCoords({ latitude: 0, longitude: 0 })).resolves.toBe("")
    })
})
