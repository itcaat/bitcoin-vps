#!/usr/bin/env python3
"""Scraper for bitcoin-vps.com -- extracts provider data into structured JSON."""

import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup, Tag

URL = "https://bitcoin-vps.com/"
RESOLVE_WORKERS = 20
OUTPUT = Path(__file__).resolve().parent.parent / "site" / "public" / "data" / "providers.json"
COUNTRIES_DB = Path(__file__).resolve().parent / "countries.json"

CATEGORY_KEYWORDS = [
    "VPS providers",
    "Low End VPS",
    "Dedicated Server",
    "VPN providers",
    "VDS providers",
    "Email providers",
    "Domain providers",
]

PAYMENT_PATTERNS = {
    "BTC": [r"\bBTC\b", r"\bBitcoin\b"],
    "Lightning": [r"Lightning Network", r"\bLN\b", r"BTCPayServer"],
    "XMR": [r"\bXMR\b", r"\bMonero\b"],
    "ETH": [r"\bETH\b", r"\bEthereum\b"],
    "LTC": [r"\bLTC\b", r"\bLitecoin\b"],
    "USDT": [r"\bUSDT\b", r"\bTether\b"],
}


def load_countries() -> dict:
    with open(COUNTRIES_DB, "r", encoding="utf-8") as f:
        return json.load(f)


def geocode(location_str: str, countries_db: dict) -> list[dict]:
    """Match location string against countries database, return coordinates."""
    coords = []
    seen = set()

    tokens = re.split(r"[,;/&]+|\band\b", location_str)
    for token in tokens:
        token = token.strip()
        token_clean = re.sub(r"\s*\([^)]*\)", "", token).strip()
        if not token_clean:
            continue

        match = countries_db.get(token_clean)
        if not match:
            for key, val in countries_db.items():
                if key.lower() == token_clean.lower():
                    match = val
                    break

        if not match:
            iso = re.search(r"\(([A-Z]{2,3})\)", token)
            if iso:
                match = countries_db.get(iso.group(1))

        if match and match["cca2"] not in seen:
            seen.add(match["cca2"])
            coords.append({
                "lat": match["lat"],
                "lng": match["lng"],
                "label": token_clean,
                "code": match["cca2"],
            })

    return coords


def detect_category(text: str) -> str:
    text_lower = text.lower()
    if "low end vps" in text_lower:
        return "Low End VPS"
    if "vps" in text_lower:
        return "VPS"
    if "dedicated" in text_lower:
        return "Dedicated Server"
    if "vpn" in text_lower:
        return "VPN"
    if "vds" in text_lower:
        return "VDS"
    if "email" in text_lower:
        return "Email"
    if "domain" in text_lower:
        return "Domain"
    return "Other"


def detect_region(text: str) -> str:
    text_lower = text.lower()
    for region in [
        "Europe", "North America", "South America", "Central America",
        "Asia", "Africa", "Middle East", "Australia", "Oceania",
        "Worldwide", "Accountless", "Undisclosed Location", "Cloud Front-End",
    ]:
        if region.lower() in text_lower:
            return region
    return "Other"


def extract_payments(text: str) -> list[str]:
    found = []
    for method, patterns in PAYMENT_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, text):
                found.append(method)
                break
    return found


def extract_features(text: str) -> list[str]:
    features = []
    feature_checks = {
        "BTCPayServer": [r"BTCPayServer"],
        "Lightning Network": [r"Lightning Network"],
        "Large Storage": [r"Large Storage"],
        "DDoS Protection": [r"DDoS"],
        "GPU Servers": [r"GPU"],
        "Onion Site": [r"\.onion", r"onion URL", r"onion site"],
        "No KYC": [r"no KYC", r"without KYC"],
        "Anonymous Signup": [r"anonymous signup", r"anonymous sign-up"],
        "Tor Friendly": [r"Tor[\s-]*friendly", r"Tor allowed", r"allows Tor"],
        "API Access": [r"\bAPI\b"],
    }
    for feature, patterns in feature_checks.items():
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                features.append(feature)
                break
    return features


def parse_provider(li: Tag, category: str, region: str, countries_db: dict) -> dict | None:
    link = li.find("a")
    if not link:
        return None

    text = li.get_text(separator=" ", strip=True)

    if "Locations:" not in text and "Location:" not in text:
        return None

    name = link.get_text(strip=True)
    href = link.get("href", "")

    loc_match = re.search(r"Locations?:\s*(.+?)(?:\.\s*Company|\.\s*[A-Z]|\.\s*$)", text)
    locations_str = loc_match.group(1).strip().rstrip(".") if loc_match else ""

    company_match = re.search(r"Company registered in\s+([^.]+)", text)
    company = company_match.group(1).strip() if company_match else ""

    payments = extract_payments(text)
    features = extract_features(text)
    coordinates = geocode(locations_str, countries_db)

    tor_friendly = bool(re.search(r"Tor[\s-]*friendly|Tor allowed|allows Tor", text, re.IGNORECASE))

    location_list = [c.strip() for c in re.split(r"[,;/&]+|\band\b", locations_str) if c.strip()]
    location_list = [re.sub(r"\s*\([^)]*\)", "", loc).strip() for loc in location_list]
    location_list = [loc for loc in location_list if loc]

    description_match = re.search(
        r"Company registered in\s+[^.]+\.\s*(.*)",
        text,
        re.DOTALL,
    )
    description = description_match.group(1).strip() if description_match else ""
    if len(description) > 500:
        description = description[:497] + "..."

    return {
        "name": name,
        "url": href,
        "category": category,
        "region": region,
        "locations": location_list,
        "coordinates": coordinates,
        "company_country": company,
        "payments": payments,
        "tor_friendly": tor_friendly,
        "features": features,
        "description": description,
    }


def scrape() -> list[dict]:
    print(f"Fetching {URL}...")
    resp = requests.get(URL, timeout=30, headers={
        "User-Agent": "bitcoin-vps-scraper/1.0 (https://github.com/itcaat/bitcoin-vps)"
    })
    resp.raise_for_status()

    soup = BeautifulSoup(resp.content, "html.parser")
    countries_db = load_countries()
    providers = []

    current_category = "Other"
    current_region = "Other"

    for elem in soup.find_all(["h1", "h2", "ul"]):
        if elem.name == "h1":
            current_category = detect_category(elem.get_text())
        elif elem.name == "h2":
            current_region = detect_region(elem.get_text())
        elif elem.name == "ul":
            for li in elem.find_all("li", recursive=False):
                provider = parse_provider(li, current_category, current_region, countries_db)
                if provider:
                    providers.append(provider)

    return providers


def resolve_url(tracking_url: str) -> dict:
    """Read the Location header from the 302 redirect.

    Returns {"url": "<clean domain>", "aff": True/False}.
    """
    from urllib.parse import urlparse

    if not tracking_url or not tracking_url.startswith("/cgi-bin/"):
        return {"url": tracking_url, "aff": False}

    full_url = URL.rstrip("/") + tracking_url
    location = ""
    try:
        resp = requests.head(
            full_url,
            allow_redirects=False,
            timeout=10,
            headers={"User-Agent": "bitcoin-vps-scraper/1.0"},
        )
        location = resp.headers.get("Location", "")
    except requests.RequestException:
        pass

    if not location or not location.startswith("http"):
        return {"url": full_url, "aff": True}

    parsed = urlparse(location)
    has_params = bool(parsed.query)
    has_path = bool(parsed.path.rstrip("/"))
    aff = has_params or has_path

    clean_domain = f"{parsed.scheme}://{parsed.netloc}"

    return {"url": clean_domain, "aff": aff}


def resolve_all_urls(providers: list[dict]) -> list[dict]:
    """Resolve all tracking URLs to real provider URLs in parallel."""
    tracking = {
        i: p["url"]
        for i, p in enumerate(providers)
        if p["url"].startswith("/cgi-bin/")
    }

    if not tracking:
        for p in providers:
            p["aff"] = False
        return providers

    print(f"Resolving {len(tracking)} tracking URLs ({RESOLVE_WORKERS} workers)...")
    resolved: dict[int, dict] = {}

    with ThreadPoolExecutor(max_workers=RESOLVE_WORKERS) as executor:
        futures = {
            executor.submit(resolve_url, url): idx
            for idx, url in tracking.items()
        }
        done = 0
        for future in as_completed(futures):
            idx = futures[future]
            try:
                resolved[idx] = future.result()
            except Exception:
                resolved[idx] = {"url": URL.rstrip("/") + tracking[idx], "aff": True}
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(tracking)} resolved...")

    aff_count = 0
    for idx, result in resolved.items():
        providers[idx]["url"] = result["url"]
        providers[idx]["aff"] = result["aff"]
        if result["aff"]:
            aff_count += 1

    for p in providers:
        if "aff" not in p:
            p["aff"] = False

    still_tracking = sum(1 for p in providers if "/cgi-bin/" in p["url"])
    print(f"Resolved URLs: {len(tracking) - still_tracking}/{len(tracking)} "
          f"({still_tracking} still tracking)")
    print(f"Affiliate links detected: {aff_count}")

    return providers


def main():
    providers = scrape()
    providers = resolve_all_urls(providers)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(providers, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {len(providers)} providers to {OUTPUT}")

    categories = {}
    regions = {}
    for p in providers:
        categories[p["category"]] = categories.get(p["category"], 0) + 1
        regions[p["region"]] = regions.get(p["region"], 0) + 1

    print("\nBy category:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    print("\nBy region:")
    for reg, count in sorted(regions.items(), key=lambda x: -x[1]):
        print(f"  {reg}: {count}")

    with_coords = sum(1 for p in providers if p["coordinates"])
    print(f"\nWith coordinates: {with_coords}/{len(providers)}")


if __name__ == "__main__":
    main()
