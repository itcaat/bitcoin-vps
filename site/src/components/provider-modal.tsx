"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Provider } from "@/lib/providers";
import { ExternalLink } from "lucide-react";

interface ProviderModalProps {
  provider: Provider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProviderModal({
  provider,
  open,
  onOpenChange,
}: ProviderModalProps) {
  if (!provider) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3 flex-wrap">
            {provider.name}
            <div className="flex gap-1.5 flex-wrap">
              {provider.categories.map((c) => (
                <Badge
                  key={c}
                  variant="outline"
                  className="bg-btc-dim text-btc border-none text-xs"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Region" value={provider.regions.join(", ") || "Worldwide"} />
            <Field label="Company" value={provider.company_country || "Unknown"} />
            <Field
              label="Tor Friendly"
              value={
                provider.tor_friendly ? (
                  <Badge variant="outline" className="bg-purple-500/15 text-purple-400 border-none">
                    Yes
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">No</span>
                )
              }
            />
            <Field
              label="Affiliate Link"
              value={
                provider.aff ? (
                  <span className="text-muted-foreground">Yes</span>
                ) : (
                  <span className="text-green-400">No (direct link)</span>
                )
              }
            />
          </div>

          <Field
            label="Locations"
            value={provider.locations.join(", ") || "Not specified"}
          />

          <Field
            label="Payments"
            value={
              provider.payments.length > 0 ? (
                <div className="flex gap-1.5 flex-wrap">
                  {provider.payments.map((p) => (
                    <Badge
                      key={p}
                      variant="outline"
                      className="bg-green-500/15 text-green-400 border-none text-xs"
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">Not specified</span>
              )
            }
          />

          <Field
            label="Features"
            value={
              provider.features.length > 0 ? (
                <div className="flex gap-1.5 flex-wrap">
                  {provider.features.map((f) => (
                    <Badge
                      key={f}
                      variant="outline"
                      className="bg-blue-500/15 text-blue-400 border-none text-xs"
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">None detected</span>
              )
            }
          />

          {provider.description && (
            <Field
              label="Description"
              value={
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {provider.description}
                </p>
              }
            />
          )}
        </div>

        <div className="mt-4">
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-btc text-black font-semibold rounded-lg hover:bg-btc-hover transition-colors"
          >
            Visit Website
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
