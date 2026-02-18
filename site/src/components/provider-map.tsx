"use client";

import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import type { Provider } from "@/lib/providers";

interface GlobePoint {
  lat: number;
  lng: number;
  provider: Provider;
  label: string;
  size: number;
}

interface ProviderMapProps {
  providers: Provider[];
  onSelect: (provider: Provider) => void;
}

export function ProviderMap({ providers, onSelect }: ProviderMapProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [GlobeComponent, setGlobeComponent] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 500 });
  const [hoverPoint, setHoverPoint] = useState<GlobePoint | null>(null);

  useEffect(() => {
    import("react-globe.gl").then((mod) => {
      setGlobeComponent(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 500,
        });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = true;
        controls.minDistance = 150;
        controls.maxDistance = 500;
      }
    }
  }, [GlobeComponent]);

  const points = useMemo<GlobePoint[]>(() => {
    const result: GlobePoint[] = [];
    const countByCode: Record<string, number> = {};

    for (const p of providers) {
      for (const c of p.coordinates) {
        countByCode[c.code] = (countByCode[c.code] || 0) + 1;
      }
    }

    for (const p of providers) {
      for (const c of p.coordinates) {
        const count = countByCode[c.code] || 1;
        result.push({
          lat: c.lat,
          lng: c.lng,
          provider: p,
          label: p.name,
          size: Math.min(0.4 + count * 0.05, 1.2),
        });
      }
    }
    return result;
  }, [providers]);

  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint;
      if (p.provider) onSelect(p.provider);
    },
    [onSelect]
  );

  const handlePointHover = useCallback((point: object | null) => {
    setHoverPoint(point ? (point as GlobePoint) : null);
  }, []);

  if (!GlobeComponent) {
    return (
      <div ref={containerRef} className="px-6 py-4">
        <div className="w-full h-[500px] rounded-xl border border-border bg-muted/20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-btc border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground text-sm">
              Loading globe...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="px-6 py-4 relative">
      <div className="w-full h-[500px] rounded-xl border border-border overflow-hidden bg-[#070b14]">
        <GlobeComponent
          ref={globeRef}
          width={dimensions.width}
          height={500}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl=""
          backgroundColor="#070b14"
          atmosphereColor="#f7931a"
          atmosphereAltitude={0.15}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={0.01}
          pointRadius="size"
          pointColor={() => "#f7931a"}
          pointLabel={(d: object) => {
            const point = d as GlobePoint;
            return `<div style="background:rgba(0,0,0,0.85);color:#fff;padding:6px 10px;border-radius:6px;font-size:13px;font-weight:600;border:1px solid rgba(247,147,26,0.3);backdrop-filter:blur(4px);pointer-events:none;">
              <span style="color:#f7931a;">&#x25CF;</span> ${point.label}
              <div style="font-size:11px;color:#999;font-weight:400;">${point.provider.categories.join(", ")}</div>
            </div>`;
          }}
          onPointClick={handlePointClick}
          onPointHover={handlePointHover}
          pointsMerge={false}
          animateIn={true}
        />
      </div>
      {hoverPoint && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-2 shadow-lg text-center">
            <span className="text-btc font-semibold">{hoverPoint.label}</span>
            <span className="text-muted-foreground text-xs ml-2">
              {hoverPoint.provider.categories.join(", ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
