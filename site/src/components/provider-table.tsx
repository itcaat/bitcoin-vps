"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import type { Provider } from "@/lib/providers";

interface ProviderTableProps {
  providers: Provider[];
  onSelect: (provider: Provider) => void;
}

type SortKey = "name" | "categories" | "regions" | "locations" | "payments";
type SortDir = "asc" | "desc";

export function ProviderTable({ providers, onSelect }: ProviderTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    return [...providers].sort((a, b) => {
      let aVal: string;
      let bVal: string;
      switch (sortKey) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "categories":
          aVal = a.categories.join(",");
          bVal = b.categories.join(",");
          break;
        case "regions":
          aVal = a.regions.join(",");
          bVal = b.regions.join(",");
          break;
        case "locations":
          aVal = a.locations.join(",");
          bVal = b.locations.join(",");
          break;
        case "payments":
          aVal = a.payments.join(",");
          bVal = b.payments.join(",");
          break;
        default:
          aVal = a.name;
          bVal = b.name;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [providers, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="mx-auto h-12 w-12 mb-3 opacity-50" />
        <p>No providers match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Name"
              sortKey="name"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
            />
            <SortableHead
              label="Category"
              sortKey="categories"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
            />
            <SortableHead
              label="Region"
              sortKey="regions"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
            />
            <SortableHead
              label="Locations"
              sortKey="locations"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
            />
            <SortableHead
              label="Payments"
              sortKey="payments"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
            />
            <TableHead className="text-xs uppercase tracking-wider">
              Features
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((p) => (
            <TableRow
              key={p.name + p.url}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelect(p)}
            >
              <TableCell className="font-semibold whitespace-nowrap">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-btc transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {p.name}
                </a>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {p.categories.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="bg-btc-dim text-btc border-none text-xs"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">
                {p.regions.join(", ")}
              </TableCell>
              <TableCell
                className="text-muted-foreground text-sm max-w-[180px] truncate"
                title={p.locations.join(", ")}
              >
                {p.locations.length <= 3
                  ? p.locations.join(", ")
                  : `${p.locations.slice(0, 3).join(", ")} +${p.locations.length - 3}`}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {p.payments.map((pm) => (
                    <Badge
                      key={pm}
                      variant="outline"
                      className="bg-green-500/15 text-green-400 border-none text-xs"
                    >
                      {pm}
                    </Badge>
                  ))}
                  {p.tor_friendly && (
                    <Badge
                      variant="outline"
                      className="bg-purple-500/15 text-purple-400 border-none text-xs"
                    >
                      Tor
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {p.features.slice(0, 3).map((f) => (
                    <Badge
                      key={f}
                      variant="outline"
                      className="bg-blue-500/15 text-blue-400 border-none text-xs"
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SortableHead({
  label,
  sortKey,
  currentKey,
  currentDir,
  onToggle,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onToggle: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <TableHead
      className="text-xs uppercase tracking-wider cursor-pointer select-none hover:text-btc transition-colors whitespace-nowrap"
      onClick={() => onToggle(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "text-btc" : "opacity-40"}`} />
        {active && (
          <span className="text-btc text-[10px]">
            {currentDir === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </TableHead>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
