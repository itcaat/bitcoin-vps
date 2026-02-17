# Bitcoin VPS Directory

A directory of VPS, dedicated server, VPN, and hosting providers that accept Bitcoin and cryptocurrency payments.

**Live site:** [itcaat.github.io/bitcoin-vps](https://itcaat.github.io/bitcoin-vps)

Data sourced from [bitcoin-vps.com](https://bitcoin-vps.com/) and updated daily via GitHub Actions.

## Features

- Interactive world map with provider locations (Leaflet + OpenStreetMap)
- Searchable and filterable provider table
- Filter by category, region, payment method, Tor-friendliness
- Column sorting
- Dark theme, responsive design

## Tech Stack

- **Scraper:** Python 3 + BeautifulSoup
- **Frontend:** Astro (static site generator)
- **Map:** Leaflet.js with CartoDB Dark Matter tiles
- **CI/CD:** GitHub Actions (daily cron) + GitHub Pages

## Local Development

```bash
# 1. Run scraper to fetch fresh data
pip install -r scraper/requirements.txt
python scraper/scrape.py

# 2. Start dev server
cd site
npm install
npm run dev
# -> http://localhost:4321/bitcoin-vps/

# 3. Production build
npm run build
npm run preview
```

## Project Structure

```
scraper/
  scrape.py          # Parses bitcoin-vps.com into JSON
  countries.json     # Country name/code -> lat/lng mapping
  requirements.txt   # Python dependencies
site/
  src/
    pages/index.astro   # Main page
    layouts/Layout.astro # Base HTML layout
    styles/global.css    # Dark theme styles
  public/
    data/providers.json  # Generated provider data
  astro.config.mjs       # Astro configuration
.github/
  workflows/build.yml    # Daily scrape + deploy pipeline
```
