import { NextRequest, NextResponse } from "next/server";

interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distKm: number;
  etaMins: number;
  open24x7: boolean;
  source: "osm";
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fast and reliable public Overpass mirrors
const OVERPASS_MIRRORS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function fetchOverpassPlaces(lat: number, lng: number, type: "hospital" | "pharmacy"): Promise<NearbyPlace[]> {
  const r = 15000; // 15 km radius
  const hq = `[out:json][timeout:25];(node["amenity"="hospital"](around:${r},${lat},${lng});way["amenity"="hospital"](around:${r},${lat},${lng});node["amenity"="clinic"](around:${r},${lat},${lng});way["amenity"="clinic"](around:${r},${lat},${lng});node["healthcare"="hospital"](around:${r},${lat},${lng});way["healthcare"="hospital"](around:${r},${lat},${lng}););out center 20;`;
  const pq = `[out:json][timeout:25];(node["amenity"="pharmacy"](around:${r},${lat},${lng});way["amenity"="pharmacy"](around:${r},${lat},${lng});node["shop"="chemist"](around:${r},${lat},${lng});way["shop"="chemist"](around:${r},${lat},${lng});node["healthcare"="pharmacy"](around:${r},${lat},${lng}););out center 20;`;
  const query = type === "pharmacy" ? pq : hq;

  // Try each working mirror sequentially if race encounters blocked servers
  let elements: any[] = [];

  for (const ep of OVERPASS_MIRRORS) {
    try {
      const url = ep + "?data=" + encodeURIComponent(query);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Medora/1.0 (Emergency Medical Locator; contact@medora.app)",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) continue;

      const json = await res.json();
      if (json.elements && json.elements.length > 0) {
        elements = json.elements;
        break;
      }
    } catch (e) {
      console.warn(`[geo/nearby] Overpass mirror ${ep} failed:`, e);
    }
  }

  return elements
    .map((el: any) => {
      const eLat = el.lat ?? el.center?.lat;
      const eLng = el.lon ?? el.center?.lon;
      if (!eLat || !eLng) return null;

      const name =
        el.tags?.["name:en"] ||
        el.tags?.["name"] ||
        el.tags?.["alt_name"] ||
        el.tags?.["official_name"] ||
        (type === "pharmacy" ? "Pharmacy / Chemist" : "Hospital / Medical Center");

      const addrParts = [
        el.tags?.["addr:housename"],
        el.tags?.["addr:street"],
        el.tags?.["addr:suburb"] || el.tags?.["addr:neighbourhood"],
        el.tags?.["addr:city"] || el.tags?.["addr:town"] || el.tags?.["addr:village"],
      ].filter(Boolean);

      const address =
        addrParts.length > 0
          ? addrParts.join(", ")
          : el.tags?.["description"] || (type === "pharmacy" ? "Local Medical Store" : "Nearby Hospital Center");

      const phone =
        el.tags?.["phone"] ||
        el.tags?.["contact:phone"] ||
        el.tags?.["telephone"] ||
        el.tags?.["contact:mobile"] ||
        "108 / 112";

      const dist = haversineKm(lat, lng, eLat, eLng);

      return {
        id: String(el.id),
        name,
        address,
        phone,
        lat: eLat,
        lng: eLng,
        distKm: parseFloat(dist.toFixed(2)),
        etaMins: Math.max(1, Math.round(dist * 3 + 1)),
        open24x7: el.tags?.["opening_hours"] === "24/7" || type === "hospital",
        source: "osm" as const,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.distKm - b.distKm)
    .slice(0, 10);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const type = (searchParams.get("type") ?? "hospital") as "hospital" | "pharmacy";

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
  }

  try {
    const places = await fetchOverpassPlaces(lat, lng, type);
    return NextResponse.json({ places, source: "osm" }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.warn("[geo/nearby] Free OSM search query returned 0 results or timed out:", err);
    return NextResponse.json({ places: [], source: "osm" }, { headers: { "Cache-Control": "no-store" } });
  }
}
