import { distanceInMeters, formatDistance } from "@/utils/distance"

const FIAP_PAULISTA = { latitude: -23.5641, longitude: -46.6527 }
const MASP = { latitude: -23.5614, longitude: -46.6559 }
const PRACA_DA_SE = { latitude: -23.5503, longitude: -46.6339 }
// Posição padrão do emulador Android (sede do Google, Califórnia)
const EMULADOR_PADRAO = { latitude: 37.421998, longitude: -122.084 }

describe("distanceInMeters", () => {
    it("é zero para o mesmo ponto", () => {
        expect(distanceInMeters(FIAP_PAULISTA, FIAP_PAULISTA)).toBe(0)
    })

    it("é igual nos dois sentidos", () => {
        expect(distanceInMeters(FIAP_PAULISTA, PRACA_DA_SE)).toBeCloseTo(distanceInMeters(PRACA_DA_SE, FIAP_PAULISTA), 6)
    })

    it("mede distâncias curtas dentro de São Paulo", () => {
        // FIAP Paulista → MASP: uns 440 m
        expect(distanceInMeters(FIAP_PAULISTA, MASP)).toBeGreaterThan(400)
        expect(distanceInMeters(FIAP_PAULISTA, MASP)).toBeLessThan(480)
        // FIAP Paulista → Praça da Sé: uns 2,5 km
        expect(distanceInMeters(FIAP_PAULISTA, PRACA_DA_SE)).toBeGreaterThan(2_300)
        expect(distanceInMeters(FIAP_PAULISTA, PRACA_DA_SE)).toBeLessThan(2_700)
    })

    it("explica os ~10.000 km vistos no emulador sem GPS configurado", () => {
        const km = distanceInMeters(FIAP_PAULISTA, EMULADOR_PADRAO) / 1000
        expect(km).toBeGreaterThan(10_000)
        expect(km).toBeLessThan(10_800)
    })
})

describe("formatDistance", () => {
    it("usa metros abaixo de 1 km", () => {
        expect(formatDistance(0)).toBe("0 m")
        expect(formatDistance(149.6)).toBe("150 m")
        expect(formatDistance(999)).toBe("999 m")
    })

    it("usa km com vírgula a partir de 1 km", () => {
        expect(formatDistance(1000)).toBe("1,0 km")
        expect(formatDistance(2345)).toBe("2,3 km")
    })
})
