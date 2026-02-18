import fs from "fs";
import path from "path";

export interface Coordinate {
  lat: number;
  lng: number;
  label: string;
  code: string;
}

export interface Provider {
  name: string;
  url: string;
  categories: string[];
  regions: string[];
  locations: string[];
  coordinates: Coordinate[];
  company_country: string;
  payments: string[];
  tor_friendly: boolean;
  features: string[];
  description: string;
  aff: boolean;
}

export function getProviders(): Provider[] {
  const filePath = path.join(process.cwd(), "public/data/providers.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Provider[];
}

export function getUniqueCategories(providers: Provider[]): string[] {
  return [...new Set(providers.flatMap((p) => p.categories))].sort();
}

export function getUniqueRegions(providers: Provider[]): string[] {
  return [...new Set(providers.flatMap((p) => p.regions))].sort();
}

export function getUniquePayments(providers: Provider[]): string[] {
  return [...new Set(providers.flatMap((p) => p.payments))].sort();
}

export function getUniqueCountryCodes(providers: Provider[]): string[] {
  return [
    ...new Set(providers.flatMap((p) => p.coordinates.map((c) => c.code))),
  ];
}
