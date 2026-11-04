import {
    addDays,
    formatLongDate,
    formatTime,
    formatWeekday,
    formatWeekRange,
    fromDateKey,
    startOfWeek,
    toDateKey,
    toWeekKey,
    weekDays,
} from "@/utils/dates"

// new Date(ano, mês - 1, dia) usa o fuso local, igual ao app
const day = (year: number, month: number, date: number, hours = 12) => new Date(year, month - 1, date, hours)

describe("toDateKey / fromDateKey", () => {
    it("formata AAAA-MM-DD com zeros", () => {
        expect(toDateKey(day(2026, 3, 5))).toBe("2026-03-05")
    })

    it("ida e volta dão a mesma data", () => {
        expect(toDateKey(fromDateKey("2026-11-03"))).toBe("2026-11-03")
    })

    it("perto da meia-noite continua no mesmo dia", () => {
        expect(toDateKey(day(2026, 11, 3, 23))).toBe("2026-11-03")
        expect(toDateKey(day(2026, 11, 3, 0))).toBe("2026-11-03")
    })
})

describe("startOfWeek", () => {
    it("volta para a segunda-feira", () => {
        expect(toDateKey(startOfWeek(day(2026, 11, 3)))).toBe("2026-11-02") // terça
        expect(toDateKey(startOfWeek(day(2026, 11, 2)))).toBe("2026-11-02") // segunda
    })

    it("domingo pertence à semana que começou na segunda anterior", () => {
        expect(toDateKey(startOfWeek(day(2026, 11, 8)))).toBe("2026-11-02")
    })
})

describe("toWeekKey (semana ISO)", () => {
    it("calcula a semana de uma data comum", () => {
        expect(toWeekKey(day(2026, 11, 3))).toBe("2026-W45")
    })

    it("segunda a domingo têm a mesma chave", () => {
        const keys = weekDays(day(2026, 11, 3)).map(toWeekKey)
        expect(new Set(keys)).toEqual(new Set(["2026-W45"]))
    })

    it("trata a virada de ano", () => {
        expect(toWeekKey(day(2025, 12, 29))).toBe("2026-W01") // segunda da 1ª semana de 2026
        expect(toWeekKey(day(2027, 1, 1))).toBe("2026-W53") // 2026 tem 53 semanas
        expect(toWeekKey(day(2027, 1, 4))).toBe("2027-W01")
    })
})

describe("weekDays e formatos", () => {
    it("lista de segunda a domingo", () => {
        const days = weekDays(day(2026, 11, 5))
        expect(days).toHaveLength(7)
        expect(days.map(formatWeekday)).toEqual(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"])
    })

    it("formata o intervalo da semana", () => {
        expect(formatWeekRange(day(2026, 11, 3))).toBe("02/11 a 08/11")
    })

    it("formata data longa e hora", () => {
        expect(formatLongDate("2026-11-03")).toBe("Ter, 03/11/2026")
        expect(formatTime(new Date(2026, 10, 3, 9, 5))).toBe("09:05")
        expect(formatTime(null)).toBe("--:--")
    })

    it("addDays atravessa o mês", () => {
        expect(toDateKey(addDays(day(2026, 10, 30), 3))).toBe("2026-11-02")
    })
})
