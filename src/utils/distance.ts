type Point = { latitude: number; longitude: number }

const EARTH_RADIUS_METERS = 6_371_000

function toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180
}

/** Distância em metros entre dois pontos (fórmula de Haversine) */
export function distanceInMeters(a: Point, b: Point): number {
    const dLat = toRadians(b.latitude - a.latitude)
    const dLon = toRadians(b.longitude - a.longitude)
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h))
}

/** "850 m" ou "2,3 km" */
export function formatDistance(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km`
}
