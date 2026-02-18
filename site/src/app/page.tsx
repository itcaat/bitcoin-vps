import {
  getProviders,
  getUniqueCategories,
  getUniqueRegions,
  getUniquePayments,
  getUniqueCountryCodes,
} from "@/lib/providers";
import { ProvidersClient } from "@/components/providers-client";

export default function Home() {
  const providers = getProviders();
  const categories = getUniqueCategories(providers);
  const regions = getUniqueRegions(providers);
  const payments = getUniquePayments(providers);
  const countryCount = getUniqueCountryCodes(providers).length;

  return (
    <main>
      <header className="text-center py-12 px-6 border-b border-border bg-gradient-to-b from-card to-background">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="text-btc">Bitcoin</span> VPS Directory
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-6">
          Comprehensive directory of hosting providers accepting Bitcoin and
          cryptocurrency payments
        </p>
        <div className="flex gap-8 justify-center flex-wrap">
          <div className="text-center">
            <div className="text-3xl font-bold text-btc font-mono">
              {providers.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Providers
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-btc font-mono">
              {countryCount}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Countries
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-btc font-mono">
              {categories.length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Categories
            </div>
          </div>
        </div>
      </header>

      <ProvidersClient
        providers={providers}
        categories={categories}
        regions={regions}
        payments={payments}
      />

      <footer className="text-center py-8 px-6 border-t border-border text-muted-foreground text-sm">
        <p>
          Data sourced from{" "}
          <a
            href="https://bitcoin-vps.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-btc hover:underline"
          >
            bitcoin-vps.com
          </a>
          . Updated daily.{" "}
          <a
            href="https://github.com/itcaat/bitcoin-vps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Source on GitHub
          </a>
          .
        </p>
      </footer>
    </main>
  );
}
