"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Provider } from "@/lib/providers";
import { FilterBar } from "@/components/filter-bar";
import { ProviderTable } from "@/components/provider-table";
import { ProviderModal } from "@/components/provider-modal";

const ProviderMap = dynamic(
  () => import("@/components/provider-map").then((m) => m.ProviderMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
  return (
    <div className="px-6 py-4">
      <div className="w-full h-[500px] rounded-xl border border-border bg-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground text-sm">Loading globe...</span>
        </div>
      </div>
    </div>
  );
}

interface ProvidersClientProps {
  providers: Provider[];
  categories: string[];
  regions: string[];
  payments: string[];
}

export function ProvidersClient({
  providers,
  categories,
  regions,
  payments,
}: ProvidersClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [payment, setPayment] = useState("all");
  const [tor, setTor] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return providers.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.locations.join(", ").toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
      if (category !== "all" && !p.categories.includes(category)) return false;
      if (region !== "all" && !p.regions.includes(region)) return false;
      if (payment !== "all" && !p.payments.includes(payment)) return false;
      if (tor === "true" && !p.tor_friendly) return false;
      if (tor === "false" && p.tor_friendly) return false;
      return true;
    });
  }, [providers, search, category, region, payment, tor]);

  const handleSelect = useCallback((provider: Provider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
  }, []);

  return (
    <>
      <ProviderMap providers={filtered} onSelect={handleSelect} />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        region={region}
        onRegionChange={setRegion}
        payment={payment}
        onPaymentChange={setPayment}
        tor={tor}
        onTorChange={setTor}
        categories={categories}
        regions={regions}
        payments={payments}
        visibleCount={filtered.length}
        totalCount={providers.length}
      />

      <section className="max-w-7xl mx-auto px-6 py-6">
        <ProviderTable providers={filtered} onSelect={handleSelect} />
      </section>

      <ProviderModal
        provider={selectedProvider}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
