"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  region: string;
  onRegionChange: (value: string) => void;
  payment: string;
  onPaymentChange: (value: string) => void;
  tor: string;
  onTorChange: (value: string) => void;
  categories: string[];
  regions: string[];
  payments: string[];
  visibleCount: number;
  totalCount: number;
}

export function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  region,
  onRegionChange,
  payment,
  onPaymentChange,
  tor,
  onTorChange,
  categories,
  regions,
  payments,
  visibleCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search providers..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={payment} onValueChange={onPaymentChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {payments.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tor} onValueChange={onTorChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Tor: Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tor: Any</SelectItem>
            <SelectItem value="true">Tor Friendly</SelectItem>
            <SelectItem value="false">Not Tor</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground font-mono whitespace-nowrap">
          {visibleCount} / {totalCount}
        </span>
      </div>
    </div>
  );
}
