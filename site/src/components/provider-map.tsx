"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import type { Provider } from "@/lib/providers";

const btcIcon = L.divIcon({
  html: '<div style="background:#f7931a;width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>',
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const children = cluster.getAllChildMarkers();
  const count = cluster.getChildCount();

  const seen = new Set<string>();
  const names: string[] = [];
  for (const child of children) {
    const name = (child.options as { providerName?: string }).providerName;
    if (name && !seen.has(name) && names.length < 5) {
      seen.add(name);
      names.push(name);
    }
  }
  const uniqueCount = new Set(
    children.map((m: L.Marker) => (m.options as { providerName?: string }).providerName)
  ).size;

  let tooltip = names.join("\n");
  if (uniqueCount > 5) tooltip += `\n... +${uniqueCount - 5} more`;

  let size = "small";
  if (count >= 50) size = "large";
  else if (count >= 10) size = "medium";

  return L.divIcon({
    html: `<div title="${tooltip.replace(/"/g, "&quot;")}">${count}</div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(40, 40),
  });
}

function jitter() {
  return (Math.random() - 0.5) * 0.5;
}

interface ProviderMapProps {
  providers: Provider[];
  onSelect: (provider: Provider) => void;
}

export function ProviderMap({ providers, onSelect }: ProviderMapProps) {
  const markers = useMemo(() => {
    const result: {
      provider: Provider;
      lat: number;
      lng: number;
      label: string;
    }[] = [];
    for (const p of providers) {
      for (const c of p.coordinates) {
        result.push({
          provider: p,
          lat: c.lat + jitter(),
          lng: c.lng + jitter(),
          label: c.label,
        });
      }
    }
    return result;
  }, [providers]);

  return (
    <div className="px-6 py-4">
      <MapContainer
        center={[30, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        className="w-full h-[420px] rounded-xl border border-border"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />
        <MarkerClusterGroup
          maxClusterRadius={40}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={createClusterIcon}
        >
          {markers.map((m, i) => (
            <Marker
              key={`${m.provider.name}-${m.label}-${i}`}
              position={[m.lat, m.lng]}
              icon={btcIcon}
              eventHandlers={{
                click: () => onSelect(m.provider),
              }}
              {...({ providerName: m.provider.name } as Record<string, unknown>)}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                className="marker-tooltip"
              >
                {m.provider.name}
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
