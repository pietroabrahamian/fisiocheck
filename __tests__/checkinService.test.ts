import { createCheckin } from "@/services/checkinService"
import { getCurrentCoords } from "@/services/locationService"
import { Clinic, Professional } from "@/types"
import { AppError } from "@/utils/errors"

// Firestore e GPS falsos: o teste controla a posição do paciente e se já existe check-in no dia
const mockTransaction = { get: jest.fn(), set: jest.fn() }

jest.mock("@/config/firebase", () => ({ firestore: {} }))
jest.mock("firebase/firestore", () => ({
    collection: jest.fn(() => ({})),
    doc: jest.fn((_ref: unknown, id: string) => ({ id })),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    serverTimestamp: jest.fn(() => "SERVER_TIME"),
    runTransaction: jest.fn((_db: unknown, run: (t: typeof mockTransaction) => Promise<void>) => run(mockTransaction)),
}))
jest.mock("@/services/locationService", () => ({ getCurrentCoords: jest.fn() }))

const mockedCoords = getCurrentCoords as jest.MockedFunction<typeof getCurrentCoords>

const sede: Clinic = {
    id: "sede",
    name: "Clinica Sede",
    address: "R. Nova dos Portugueses, 365 - São Paulo - SP",
    latitude: -23.4875,
    longitude: -46.6372,
    radiusMeters: 150,
}
const professional: Professional = { id: "p1", name: "Bruna Cardoso", specialty: "Pilates", active: true }
const input = { patientId: "uid123", patientName: "Paciente", professional, clinic: sede }

beforeEach(() => {
    jest.clearAllMocks()
    mockTransaction.get.mockResolvedValue({ exists: () => false })
})

describe("createCheckin", () => {
    it("registra o check-in quando o paciente está dentro do raio", async () => {
        mockedCoords.mockResolvedValue({ latitude: -23.4876, longitude: -46.6373 }) // ~15 m da clínica

        const checkin = await createCheckin(input)

        expect(checkin.id).toMatch(/^uid123_\d{4}-\d{2}-\d{2}$/)
        expect(checkin.clinicId).toBe("sede")
        expect(checkin.clinicName).toBe("Clinica Sede")
        expect(checkin.professionalName).toBe("Bruna Cardoso")
        expect(checkin.week).toMatch(/^\d{4}-W\d{2}$/)
        expect(checkin.distanceMeters).toBeLessThan(150)
        expect(mockTransaction.set).toHaveBeenCalledWith(
            { id: checkin.id },
            expect.objectContaining({ patientId: "uid123", clinicId: "sede", createdAt: "SERVER_TIME" })
        )
    })

    it("recusa quando o paciente está longe e mostra a distância", async () => {
        mockedCoords.mockResolvedValue({ latitude: -23.5641, longitude: -46.6527 }) // FIAP Paulista, ~9 km

        await expect(createCheckin(input)).rejects.toThrow(/Você está a \d+,\d km da Clinica Sede/)
        expect(mockTransaction.set).not.toHaveBeenCalled()
    })

    it("recusa com a posição padrão do emulador (Califórnia)", async () => {
        mockedCoords.mockResolvedValue({ latitude: 37.421998, longitude: -122.084 })

        await expect(createCheckin(input)).rejects.toBeInstanceOf(AppError)
        expect(mockTransaction.set).not.toHaveBeenCalled()
    })

    it("aceita perto do limite do raio", async () => {
        // ~140 m ao norte da clínica
        mockedCoords.mockResolvedValue({ latitude: sede.latitude + 0.00126, longitude: sede.longitude })

        await expect(createCheckin(input)).resolves.toMatchObject({ clinicId: "sede" })
    })

    it("recusa um segundo check-in no mesmo dia", async () => {
        mockedCoords.mockResolvedValue({ latitude: sede.latitude, longitude: sede.longitude })
        mockTransaction.get.mockResolvedValue({ exists: () => true })

        await expect(createCheckin(input)).rejects.toThrow("Você já fez check-in hoje")
        expect(mockTransaction.set).not.toHaveBeenCalled()
    })

    it("repassa o erro de localização sem gravar nada", async () => {
        mockedCoords.mockRejectedValue(new AppError("A localização do aparelho está desligada."))

        await expect(createCheckin(input)).rejects.toThrow("desligada")
        expect(mockTransaction.get).not.toHaveBeenCalled()
    })
})
