"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_META, type Report } from "@/lib/types";
import { WARNER_BEACH_BOUNDS } from "@/lib/location";

const FIT_OPTIONS = { padding: [20, 20] as [number, number] };

function categoryIcon(report: Report) {
  const meta = CATEGORY_META[report.category];
  return L.divIcon({
    className: "",
    html: `<span class="block size-4 rounded-full border-2 border-white ${meta.dot} shadow-md"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const draftIcon = L.divIcon({
  className: "",
  html: `<span class="block size-5 rounded-full border-2 border-white bg-blue-600 shadow-lg"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function PinPlacer({ onPlace }: { onPlace: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

function ResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      map.fitBounds(WARNER_BEACH_BOUNDS, FIT_OPTIONS);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function FlyToSelected({ report }: { report: Report | null }) {
  const map = useMap();

  useEffect(() => {
    if (report?.lat && report?.lng) {
      map.flyTo([report.lat, report.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    }
  }, [report, map]);

  return null;
}

export function FeedMap({
  reports,
  selected,
  onSelect,
  pinEditable = false,
  pinCoords = null,
  onPinChange,
  placingPin = false,
  onPlacingClick,
}: {
  reports: Report[];
  selected: Report | null;
  onSelect: (report: Report) => void;
  pinEditable?: boolean;
  pinCoords?: { lat: number; lng: number } | null;
  onPinChange?: (coords: { lat: number; lng: number }) => void;
  placingPin?: boolean;
  onPlacingClick?: (coords: { lat: number; lng: number }) => void;
}) {
  const located = reports.filter(
    (r): r is Report & { lat: number; lng: number } => r.lat != null && r.lng != null
  );

  return (
    <MapContainer
      bounds={WARNER_BEACH_BOUNDS}
      boundsOptions={FIT_OPTIONS}
      maxZoom={19}
      scrollWheelZoom
      className={`absolute inset-0 ${placingPin ? "cursor-crosshair" : ""}`}
    >
      <TileLayer
        attribution="Tiles &copy; Esri, Garmin, GEBCO, NOAA NGDC, &copy; OpenStreetMap contributors"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
      />
      {located.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={categoryIcon(report)}
          eventHandlers={{ click: () => onSelect(report) }}
        >
          <Popup>
            <p className="font-medium">{report.title}</p>
            {report.location_text && (
              <p className="text-sm text-zinc-600">{report.location_text}</p>
            )}
          </Popup>
        </Marker>
      ))}
      {pinEditable && pinCoords && onPinChange && (
        <Marker
          position={[pinCoords.lat, pinCoords.lng]}
          icon={draftIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const pos = e.target.getLatLng();
              onPinChange({ lat: pos.lat, lng: pos.lng });
            },
          }}
        />
      )}
      {placingPin && onPlacingClick && <PinPlacer onPlace={onPlacingClick} />}
      <FlyToSelected report={selected} />
      <ResizeHandler />
    </MapContainer>
  );
}
