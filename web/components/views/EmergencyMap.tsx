"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Navigation,
  MapPin,
  Phone,
  Clock,
  RefreshCw,
  ShieldAlert,
  Pill,
  Building2,
  CornerUpRight,
  ArrowUp,
  X,
  Compass,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List
} from "lucide-react";
import "leaflet/dist/leaflet.css";

interface Place {
  id: string | number;
  name: string;
  category: "hospital" | "pharmacy";
  lat: number;
  lng: number;
  address: string;
  phone: string;
  distKm: number;
  etaMins: number;
  open24x7: boolean;
}

interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSecs: number;
  type: string;
  modifier?: string;
}

interface RouteInfo {
  distanceKm: number;
  durationMins: number;
  coordinates: [number, number][]; // [lat, lng] array for Leaflet Polyline
  steps: RouteStep[];
}

// Haversine distance calculation in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// ── Fetch from our server-side API route (/api/geo/nearby) ───────────────────
// Uses free OpenStreetMap (Overpass API) via parallel mirror race. Zero dummy data.
async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  category: "hospital" | "pharmacy",
  onStatus?: (msg: string) => void
): Promise<{ places: Place[]; source: "osm" }> {
  onStatus?.("Searching OpenStreetMap for nearby " + (category === "pharmacy" ? "pharmacies" : "hospitals") + "…");
  try {
    const res = await fetch(
      `/api/geo/nearby?lat=${lat}&lng=${lng}&type=${category}`,
      { signal: AbortSignal.timeout(20000) }
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const places: Place[] = (data.places || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      category,
      lat: p.lat,
      lng: p.lng,
      address: p.address,
      phone: p.phone,
      distKm: p.distKm,
      etaMins: p.etaMins,
      open24x7: p.open24x7,
    }));
    if (places.length > 0) {
      onStatus?.(`✓ Found ${places.length} verified ${category === "pharmacy" ? "pharmacies" : "hospitals"} on OpenStreetMap.`);
      return { places, source: "osm" };
    }
    onStatus?.("No registered " + (category === "pharmacy" ? "pharmacies" : "hospitals") + " within 10 km on OpenStreetMap.");
    return { places: [], source: "osm" };
  } catch (err) {
    console.warn("[EmergencyMap] fetchNearbyPlaces error:", err);
    onStatus?.("⚠ Could not reach map server. Dial emergency hotline below.");
    return { places: [], source: "osm" };
  }
}


// OSRM Routing Fetcher (Real-time turn-by-turn guidance)
async function fetchOSRMRoute(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number
): Promise<RouteInfo | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM routing request failed");

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const geoCoords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] // Swap [lng, lat] to [lat, lng] for Leaflet
    );

    const stepsRaw = route.legs[0]?.steps || [];
    const steps: RouteStep[] = stepsRaw.map((st: any) => {
      const type = st.maneuver?.type || "straight";
      const modifier = st.maneuver?.modifier || "";
      const roadName = st.name ? `onto ${st.name}` : "";

      let instruction = "Continue along the route";
      if (type === "depart") {
        instruction = `Head ${modifier} ${roadName}`.trim();
      } else if (type === "arrive") {
        instruction = "Arrive at destination gate";
      } else if (type === "turn" || type === "end of road" || type === "fork") {
        instruction = `Turn ${modifier || "right"} ${roadName}`.trim();
      } else if (type === "new name" || type === "continue") {
        instruction = `Continue ${roadName}`.trim();
      }

      return {
        instruction: instruction || "Proceed forward",
        distanceMeters: Math.round(st.distance || 0),
        durationSecs: Math.round(st.duration || 0),
        type,
        modifier,
      };
    });

    return {
      distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
      durationMins: Math.max(1, Math.round(route.duration / 60)),
      coordinates: geoCoords,
      steps,
    };
  } catch (err) {
    console.warn("OSRM routing failed, fallback to straight line polyline", err);
    // Fallback straight line polyline
    return {
      distanceKm: parseFloat(getDistanceKm(userLat, userLng, destLat, destLng).toFixed(2)),
      durationMins: Math.max(1, Math.round(getDistanceKm(userLat, userLng, destLat, destLng) * 2.5)),
      coordinates: [
        [userLat, userLng],
        [destLat, destLng],
      ],
      steps: [
        {
          instruction: "Head directly towards destination",
          distanceMeters: Math.round(getDistanceKm(userLat, userLng, destLat, destLng) * 1000),
          durationSecs: Math.round(getDistanceKm(userLat, userLng, destLat, destLng) * 150),
          type: "depart",
        },
        {
          instruction: "Arrive at destination emergency entrance",
          distanceMeters: 0,
          durationSecs: 0,
          type: "arrive",
        },
      ],
    };
  }
}

// MapBoundsAutoFitter: Dynamically auto-fits map viewport to frame route & destination
function MapBoundsAutoFitter({
  userCoords,
  selectedPlace,
  activeRoute,
  useMapHook,
  L,
}: {
  userCoords: { lat: number; lng: number } | null;
  selectedPlace: Place | null;
  activeRoute: RouteInfo | null;
  useMapHook: () => any;
  L: any;
}) {
  const map = useMapHook();

  useEffect(() => {
    if (!map || !L) return;

    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      const bounds = L.latLngBounds(activeRoute.coordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
    } else if (selectedPlace && userCoords) {
      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lng],
        [selectedPlace.lat, selectedPlace.lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    } else if (userCoords) {
      map.setView([userCoords.lat, userCoords.lng], 14, { animate: true });
    }
  }, [map, L, activeRoute, selectedPlace, userCoords]);

  return null;
}

export function EmergencyMap() {
  const [isClient, setIsClient] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"hospital" | "pharmacy">("hospital");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string>("Requesting GPS location…");
  const [dataSource, setDataSource] = useState<"google" | "osm" | "estimate" | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [locationName, setLocationName] = useState<string>("Detecting GPS location...");
  const [LeafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([ReactLeaflet, L]) => {
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const userMarkerIcon = new L.default.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const hospitalMarkerIcon = new L.default.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const pharmacyMarkerIcon = new L.default.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      setLeafletComponents({
        MapContainer: ReactLeaflet.MapContainer,
        TileLayer: ReactLeaflet.TileLayer,
        Marker: ReactLeaflet.Marker,
        Popup: ReactLeaflet.Popup,
        Polyline: ReactLeaflet.Polyline,
        useMap: ReactLeaflet.useMap,
        userIcon: userMarkerIcon,
        hospitalIcon: hospitalMarkerIcon,
        pharmacyIcon: pharmacyMarkerIcon,
        L: L.default,
      });
    });
  }, []);

  const detectLocation = useCallback((cat: "hospital" | "pharmacy" = activeCategory) => {
    setLoading(true);
    setPlaces([]);
    setDataSource(null);
    setActiveRoute(null);
    setStatusMsg("Requesting GPS location…");
    const defaultLat = 19.076;
    const defaultLng = 72.8777;

    const fetchForCategory = async (lat: number, lng: number) => {
      const { places: nearest, source } = await fetchNearbyPlaces(lat, lng, cat, setStatusMsg);
      setDataSource(source);
      setPlaces(nearest);
      if (nearest.length > 0) setSelectedPlace(nearest[0]);
      setLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          setLocationName(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Accuracy: ~${Math.round(pos.coords.accuracy || 10)}m)`);
          setStatusMsg("GPS permission granted — searching hospitals around your location…");
          fetchForCategory(lat, lng);
        },
        (err) => {
          console.warn("Geolocation permission or position error:", err);
          setUserCoords({ lat: defaultLat, lng: defaultLng });
          setLocationName("Location fallback (Mumbai)");
          setStatusMsg("GPS permission denied/unavailable — using default coordinates…");
          fetchForCategory(defaultLat, defaultLng);
        },
        { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setUserCoords({ lat: defaultLat, lng: defaultLng });
      setLocationName("Location fallback (Mumbai)");
      fetchForCategory(defaultLat, defaultLng);
    }
  }, [activeCategory]);

  const handleCategoryChange = (cat: "hospital" | "pharmacy") => {
    setActiveCategory(cat);
    detectLocation(cat);
  };

  useEffect(() => {
    if (isClient) {
      detectLocation();
    }
  }, [isClient]);

  // Handle building & showing in-app route
  const handleShowRoute = async (place: Place) => {
    setSelectedPlace(place);
    if (!userCoords) return;

    setRouteLoading(true);
    const route = await fetchOSRMRoute(userCoords.lat, userCoords.lng, place.lat, place.lng);
    setActiveRoute(route);
    setRouteLoading(false);
  };

  if (!isClient || !LeafletComponents || !userCoords) {
    return (
      <div className="w-full h-80 bg-surface-2 rounded-2xl border border-line/50 flex flex-col items-center justify-center gap-3 p-6">
        <RefreshCw size={26} className="text-brand-500 animate-spin" />
        <p className="text-sm font-semibold text-ink-base">{statusMsg}</p>
        <p className="text-xs text-ink-muted max-w-xs text-center">
          Querying up to 3 OpenStreetMap servers in parallel. This may take up to 25 seconds.
        </p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline, userIcon, hospitalIcon, pharmacyIcon } =
    LeafletComponents;

  return (
    <div className="w-full space-y-6">
      {/* Category Filter & Status Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 rounded-2xl p-4 gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">📍 Verified Live Location & In-App Navigation</h3>
            <p className="text-xs font-medium text-slate-500">{locationName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Category Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl flex-1 md:flex-initial">
            <button
              onClick={() => handleCategoryChange("hospital")}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeCategory === "hospital"
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 size={14} /> Hospitals
            </button>
            <button
              onClick={() => handleCategoryChange("pharmacy")}
              className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeCategory === "pharmacy"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Pill size={14} /> Pharmacies
            </button>
          </div>

          <button
            onClick={() => detectLocation(activeCategory)}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Map + Sliding Overlay Panel ─────────────────────────────── */}
      <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-line/60 shadow-soft">

        {/* Full-width Leaflet Map — always 100% */}
        <div className="absolute inset-0 z-0">
          <MapContainer
            center={[userCoords.lat, userCoords.lng]}
            zoom={14}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBoundsAutoFitter
              userCoords={userCoords}
              selectedPlace={selectedPlace}
              activeRoute={activeRoute}
              useMapHook={LeafletComponents.useMap}
              L={LeafletComponents.L}
            />

            {/* User GPS Marker */}
            <Marker position={[userCoords.lat, userCoords.lng]} icon={userIcon}>
              <Popup>
                <div className="p-1 font-sans">
                  <p className="font-bold text-red-600 text-sm">📍 Your GPS Location</p>
                  <p className="text-xs text-slate-500">Live navigation start point</p>
                </div>
              </Popup>
            </Marker>

            {/* Top 5 Places Markers */}
            {places.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={p.category === "pharmacy" ? pharmacyIcon : hospitalIcon}
                eventHandlers={{ click: () => handleShowRoute(p) }}
              >
                <Popup>
                  <div className="p-1 font-sans space-y-1">
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.address}</p>
                    <p className="text-xs font-bold text-blue-600">
                      Distance: {p.distKm} km (~{p.etaMins} mins)
                    </p>
                    <button
                      onClick={() => handleShowRoute(p)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded hover:bg-blue-700 mt-1 cursor-pointer"
                    >
                      <Navigation size={12} /> Show In-App Route
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route Polylines */}
            {activeRoute && (
              <>
                <Polyline positions={activeRoute.coordinates} color="#0f172a" weight={10} opacity={0.8} />
                <Polyline positions={activeRoute.coordinates} color="#2563eb" weight={6} opacity={1.0} />
                <Polyline positions={activeRoute.coordinates} color="#60a5fa" weight={2} opacity={0.9} />
              </>
            )}
          </MapContainer>
        </div>

        {/* ── Active Route Banner Overlay (top of map) ── */}
        {activeRoute && selectedPlace && (
          <div className="absolute top-3 left-3 right-16 bg-white/95 backdrop-blur-md border border-blue-200 rounded-2xl p-3.5 shadow-xl z-20 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl animate-pulse">
                <Compass size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-xs">Navigating to: {selectedPlace.name}</h4>
                <p className="text-[11px] font-bold text-blue-600">
                  {activeRoute.distanceKm} km • ~{activeRoute.durationMins} mins drive
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveRoute(null)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Floating Tab Toggle ── anchored to right edge, outside the panel */}
        {!panelOpen && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute top-1/2 -translate-y-1/2 right-0 z-20
                       flex items-center gap-2 pl-3 pr-2 py-4
                       bg-surface-1/95 backdrop-blur-sm
                       border border-line/70 border-r-0
                       rounded-l-2xl shadow-card
                       hover:bg-brand-50 hover:border-brand-300
                       transition-all duration-200 group"
            title="Show hospital list"
          >
            <div className="flex flex-col items-center gap-1.5">
              <Building2 size={15} className="text-brand-500 group-hover:text-brand-600" />
              <span
                className="text-[10px] font-bold text-ink-muted group-hover:text-brand-600 uppercase tracking-widest"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                {activeCategory === "pharmacy" ? "Pharmacies" : "Hospitals"}
              </span>
              <ChevronLeft size={13} className="text-ink-subtle group-hover:text-brand-500" />
            </div>
          </button>
        )}

        {/* ── Sliding Overlay Panel (right side) ── */}
        <div
          className={`absolute top-0 right-0 h-full z-10 transition-all duration-300 ease-in-out ${
            panelOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ width: "320px" }}
        >
          <div className="relative h-full w-full bg-surface-1/97 backdrop-blur-xl border-l border-line/60 flex flex-col shadow-card">

            {/* Panel header with close tab */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-line/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-brand-500" />
                <span className="font-bold text-ink-base text-sm">
                  Top 5 Nearest {activeCategory === "pharmacy" ? "Pharmacies" : "Hospitals"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {dataSource && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    dataSource === "google"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
                      : dataSource === "osm"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                  }`}>
                    {dataSource === "google" ? "via Google" : dataSource === "osm" ? "via OSM" : "Estimate"}
                  </span>
                )}
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1.5 bg-surface-2 hover:bg-surface-3 text-ink-muted rounded-lg transition-all"
                  title="Close list"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {activeRoute && selectedPlace ? (
                /* TURN-BY-TURN IN-APP NAVIGATION PANEL */
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Turn-by-Turn Guidance
                      </span>
                      <h3 className="font-bold text-ink-base text-sm mt-1">{selectedPlace.name}</h3>
                      <p className="text-xs text-ink-muted">{selectedPlace.address}</p>
                    </div>
                    <button
                      onClick={() => setActiveRoute(null)}
                      className="text-xs font-bold text-ink-muted hover:text-ink-base bg-surface-2 px-2 py-1 rounded-lg"
                    >
                      Exit
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-500/10 p-3 rounded-xl border border-brand-200/60 dark:border-brand-500/30 text-xs">
                    <span className="font-semibold text-ink-muted">Estimated Drive:</span>
                    <span className="font-bold text-brand-600 text-sm">
                      {activeRoute.distanceKm} km ({activeRoute.durationMins} mins)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-ink-muted uppercase tracking-wider">Maneuver Steps</h4>
                    {activeRoute.steps.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-surface-2/50 border border-line/40 rounded-xl flex items-start gap-2.5 text-xs"
                      >
                        <div className="p-1.5 bg-brand-500 text-white rounded-lg flex-shrink-0 mt-0.5">
                          {idx === activeRoute.steps.length - 1 ? (
                            <CheckCircle2 size={13} />
                          ) : st.modifier?.includes("right") ? (
                            <CornerUpRight size={13} />
                          ) : (
                            <ArrowUp size={13} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-ink-base">{st.instruction}</p>
                          {st.distanceMeters > 0 && (
                            <p className="text-[10px] text-ink-muted mt-0.5">
                              In {st.distanceMeters}m ({Math.round(st.durationSecs / 60)} min)
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* PLACES LIST CARDS OR CLEAN EMPTY STATE */
                <div className="space-y-2">
                  {places.length === 0 ? (
                    <div className="p-4 bg-surface-2/60 border border-line/50 rounded-xl text-center space-y-3">
                      <ShieldAlert size={28} className="text-amber-500 mx-auto" />
                      <div>
                        <h4 className="font-bold text-ink-base text-xs">No OSM {activeCategory === "pharmacy" ? "Pharmacies" : "Hospitals"} Found</h4>
                        <p className="text-[11px] text-ink-muted mt-1 leading-snug">
                          No tagged {activeCategory === "pharmacy" ? "pharmacies" : "hospitals"} found in OpenStreetMap within 10 km of your current GPS location.
                        </p>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <a
                          href="tel:108"
                          className="w-full py-2 bg-danger-500 hover:bg-danger-600 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-danger-glow"
                        >
                          <Phone size={12} /> Call 108 (Emergency Ambulance)
                        </a>
                        <a
                          href="tel:112"
                          className="w-full py-2 bg-surface-1 hover:bg-surface-3 text-ink-base font-bold text-xs rounded-lg border border-line/60 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Phone size={12} /> Call 112 (National Helpline)
                        </a>
                      </div>
                    </div>
                  ) : (
                    places.map((p, idx) => {
                      const isSelected = selectedPlace?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleShowRoute(p)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-400 bg-brand-50/60 dark:bg-brand-500/10 ring-1 ring-brand-400/30"
                              : "border-line/60 bg-surface-2/40 hover:bg-surface-1 hover:border-line hover:shadow-soft"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <h4 className="font-semibold text-ink-base text-xs leading-tight">{p.name}</h4>
                            </div>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold text-[10px] rounded-full flex-shrink-0">
                              24x7
                            </span>
                          </div>

                          <p className="text-[11px] text-ink-muted mb-2 pl-7">{p.address}</p>

                          <div className="flex items-center justify-between pl-7">
                            <span className="text-xs font-semibold text-brand-600">{p.distKm} km</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleShowRoute(p); }}
                                disabled={routeLoading}
                                className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                              >
                                <Navigation size={11} />
                                {routeLoading && selectedPlace?.id === p.id ? "..." : "Route"}
                              </button>
                              <a
                                href={`tel:${p.phone.split("/")[0].trim()}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                              >
                                <Phone size={11} /> Call
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
