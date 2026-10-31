const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function pad(value: number): string {
    return String(value).padStart(2, "0")
}

/** Data no formato AAAA-MM-DD usando o fuso do aparelho */
export function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromDateKey(key: string): Date {
    const [year, month, day] = key.split("-").map(Number)
    return new Date(year, month - 1, day)
}

/** Segunda-feira da semana da data (00:00) */
export function startOfWeek(date: Date): Date {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diff = (monday.getDay() + 6) % 7 // segunda = 0 ... domingo = 6
    monday.setDate(monday.getDate() - diff)
    return monday
}

export function addDays(date: Date, days: number): Date {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
}

/** Semana ISO 8601 (começa na segunda), ex.: 2026-W44 */
export function toWeekKey(date: Date): string {
    const thursday = addDays(startOfWeek(date), 3) // a quinta define o ano da semana
    const firstThursday = addDays(startOfWeek(new Date(thursday.getFullYear(), 0, 4)), 3)
    const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return `${thursday.getFullYear()}-W${pad(week)}`
}

/** Os 7 dias (segunda a domingo) da semana da data */
export function weekDays(date: Date): Date[] {
    const monday = startOfWeek(date)
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index))
}

/** "27/10" */
export function formatShortDate(date: Date): string {
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`
}

/** "Seg" */
export function formatWeekday(date: Date): string {
    return WEEKDAYS[date.getDay()]
}

/** "26/10 a 01/11" */
export function formatWeekRange(date: Date): string {
    const days = weekDays(date)
    return `${formatShortDate(days[0])} a ${formatShortDate(days[6])}`
}

/** "Seg, 27/10/2026" */
export function formatLongDate(key: string): string {
    const date = fromDateKey(key)
    return `${formatWeekday(date)}, ${formatShortDate(date)}/${date.getFullYear()}`
}

/** "14:05" */
export function formatTime(date: Date | null): string {
    if (!date) return "--:--"
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}
