#!/usr/bin/env python3
"""
IIT Research Report Collector: GDACS Automated Feeds & Crowd-Sourced Social Signal Anomalies
=============================================================================================
Designed for IIT disaster management research and automated early-warning report gathering.

Features:
1. Ingests GDACS RSS & automated human-intervention-free impact calculations (UN OCHA / EC JRC).
2. Connects to open social media streams to calculate mathematical keyword volume anomalies (Z-Score & Surge Ratio).
3. Generates publication-ready academic research reports in structured JSON and CSV formats.
"""

import argparse
import csv
import json
import math
import os
import re
import sys
from datetime import datetime, timezone
import urllib.request
import urllib.error

# Official GDACS RSS Endpoints
GDACS_RSS_URLS = [
    "https://www.gdacs.org/xml/rss.xml",
    "https://www.gdacs.org/xml/rss_24h.xml"
]

# Monitored Disaster Keywords & Baselines (posts/min)
DEFAULT_KEYWORDS = {
    "earthquake": {"type": "earthquake", "baseline": 2.0},
    "flood": {"type": "flood", "baseline": 1.5},
    "cyclone": {"type": "cyclone", "baseline": 1.0},
    "landslide": {"type": "landslide", "baseline": 0.8},
    "building collapse": {"type": "other", "baseline": 0.5},
    "power outage": {"type": "other", "baseline": 1.2},
    "dam breach": {"type": "flood", "baseline": 0.3}
}

# Known geographic entities for quick entity extraction
KNOWN_LOCATIONS = [
    "Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad",
    "Bhubaneswar", "Cuttack", "Puri", "Guwahati", "Assam", "Sikkim",
    "Uttarakhand", "Shimla", "Manali", "Kerala", "Wayanad", "California", "Tokyo"
]


def fetch_url(url, timeout=10):
    """Fetch URL with custom User-Agent headers using urllib standard library."""
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "IIT-DisasterResearch-Agent/2.0 (Academic Report Gathering)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[Warning] Failed to fetch {url}: {e}", file=sys.stderr)
        return None


def parse_gdacs_rss(xml_content):
    """
    Parse GDACS XML RSS items, extracting automated impact calculations.
    """
    alerts = []
    if not xml_content:
        return alerts

    # Extract all <item>...</item> blocks
    items = re.findall(r"<item[\s\S]*?</item>", xml_content, re.IGNORECASE)

    for item_str in items:
        def get_tag(tag):
            m = re.search(rf"<{tag}[^>]*>([\s\S]*?)</{tag}>", item_str, re.IGNORECASE)
            if not m:
                return ""
            val = m.group(1).strip()
            # Clean CDATA
            val = re.sub(r"<!\[CDATA\[([\s\S]*?)\]\]>", r"\1", val).strip()
            return val

        title = get_tag("title")
        link = get_tag("link")
        description = get_tag("description")
        pub_date = get_tag("pubDate")
        event_type = get_tag("gdacs:eventtype")
        alert_level = get_tag("gdacs:alertlevel") or "Green"
        alert_score = get_tag("gdacs:alertscore") or "0"
        country = get_tag("gdacs:country") or "International"
        event_id = get_tag("gdacs:eventid")
        cap_url = get_tag("gdacs:cap")
        severity = get_tag("gdacs:severity")
        population = get_tag("gdacs:population")

        lat_str = get_tag("geo:lat")
        lon_str = get_tag("geo:long")
        try:
            lat = float(lat_str) if lat_str else None
            lon = float(lon_str) if lon_str else None
        except ValueError:
            lat, lon = None, None

        if not title:
            continue

        alerts.append({
            "source": "GDACS_AUTOMATED_RSS",
            "event_id": event_id,
            "title": title,
            "description": description,
            "event_type": event_type,
            "alert_level": alert_level,
            "alert_score": float(alert_score) if alert_score.replace(".", "", 1).isdigit() else 0.0,
            "severity_calculation": severity,
            "population_exposed": population,
            "country": country,
            "latitude": lat,
            "longitude": lon,
            "link": link,
            "cap_xml_url": cap_url,
            "pub_date": pub_date,
            "ingested_at": datetime.now(timezone.utc).isoformat()
        })

    return alerts


def fetch_social_stream_mentions(keyword):
    """
    Fetch live situational mentions for a keyword from open decentralized social streams.
    """
    posts = []
    url = f"https://mastodon.social/api/v1/timelines/tag/{urllib.parse.quote(keyword)}?limit=15"
    raw = fetch_url(url, timeout=6)
    if raw:
        try:
            data = json.loads(raw)
            if isinstance(data, list):
                for p in data:
                    content = p.get("content", "")
                    clean_text = re.sub(r"<[^>]+>", " ", content).strip()
                    if clean_text:
                        posts.append({
                            "text": clean_text,
                            "author": p.get("account", {}).get("username", "anonymous"),
                            "created_at": p.get("created_at"),
                            "url": p.get("url")
                        })
        except Exception:
            pass

    return posts


def compute_anomaly_metrics(keyword, post_count, baseline):
    """
    Calculate statistical anomaly metrics: Surge Ratio and Z-Score.
    """
    current_velocity = float(post_count)
    base = max(0.5, float(baseline))
    surge_ratio = round(current_velocity / base, 2)

    # Assumed Poisson-like or empirical variance (sigma approx sqrt(base) + 0.5)
    std_dev = max(0.5, math.sqrt(base))
    z_score = round((current_velocity - base) / std_dev, 2)

    is_anomaly = surge_ratio >= 1.8 or z_score >= 2.0
    confidence = min(95, max(20, round(40 + (z_score * 12 if z_score > 0 else 0) + ((surge_ratio - 1) * 15 if surge_ratio > 1 else 0))))

    return {
        "current_velocity_per_min": current_velocity,
        "baseline_velocity_per_min": base,
        "surge_ratio": surge_ratio,
        "z_score": z_score,
        "is_anomaly": is_anomaly,
        "confidence_score": confidence
    }


def extract_location_mentions(text):
    """Extract location entities from unstructured post text."""
    found = []
    lower = text.lower()
    for loc in KNOWN_LOCATIONS:
        if loc.lower() in lower:
            found.append(loc)
    return list(set(found))


def collect_crowd_signals(keywords_dict):
    """Scan all keyword topics and detect volume spikes."""
    signals = []
    for kw, meta in keywords_dict.items():
        posts = fetch_social_stream_mentions(kw)
        post_count = len(posts)
        metrics = compute_anomaly_metrics(kw, post_count, meta["baseline"])

        combined_text = " ".join(p["text"] for p in posts)
        locations = extract_location_mentions(combined_text)

        signals.append({
            "keyword": kw,
            "disaster_type": meta["type"],
            "post_count_sample": post_count,
            "metrics": metrics,
            "detected_locations": locations,
            "sample_posts": posts[:3],
            "detected_at": datetime.now(timezone.utc).isoformat()
        })
    return signals


def generate_research_report(output_dir="./reports", dry_run=False):
    """
    Collect all feeds and generate academic research reports.
    """
    print("=" * 70)
    print("IIT DISASTER MANAGEMENT RESEARCH: PROGRAMMATIC DATA & CROWD SIGNALS")
    print("=" * 70)

    # 1. Collect GDACS automated alerts
    print("[1/3] Ingesting GDACS RSS & Automated Impact Feeds...")
    gdacs_alerts = []
    for u in GDACS_RSS_URLS:
        xml = fetch_url(u)
        if xml:
            gdacs_alerts = parse_gdacs_rss(xml)
            if gdacs_alerts:
                print(f"      Successfully parsed {len(gdacs_alerts)} automated alerts from {u}")
                break

    # 2. Collect social stream crowd signals
    print("[2/3] Analyzing Social Media Stream Volume & Detecting Anomalies...")
    crowd_signals = collect_crowd_signals(DEFAULT_KEYWORDS)
    active_anomalies = [s for s in crowd_signals if s["metrics"]["is_anomaly"]]
    print(f"      Scanned {len(crowd_signals)} keyword topics. Detected {len(active_anomalies)} volume anomaly spike(s).")

    # 3. Assemble Academic Report
    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    report_data = {
        "institution": "IIT Disaster Management Research Initiative",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_gdacs_events": len(gdacs_alerts),
            "gdacs_high_severity_count": len([a for a in gdacs_alerts if a["alert_level"] in ("Red", "Orange")]),
            "monitored_crowd_topics": len(crowd_signals),
            "active_crowd_anomalies": len(active_anomalies),
        },
        "gdacs_automated_alerts": gdacs_alerts,
        "crowd_source_signals": crowd_signals
    }

    if dry_run:
        print("[Dry Run] Summary of collected data:")
        print(json.dumps(report_data["summary"], indent=2))
        return

    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, f"iit_disaster_report_{timestamp_str}.json")
    csv_path = os.path.join(output_dir, f"iit_disaster_report_{timestamp_str}.csv")

    # Write JSON report
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    print(f"[3/3] Academic JSON report saved to: {json_path}")

    # Write CSV summary of GDACS and Crowd Anomalies
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Category", "ID_or_Keyword", "Title_or_Type", "Severity_Level", "Impact_or_SurgeRatio", "Location", "Timestamp"])

        for a in gdacs_alerts:
            writer.writerow([
                "GDACS_OFFICIAL",
                a["event_id"],
                a["title"],
                a["alert_level"],
                f"Score: {a['alert_score']} ({a['severity_calculation']})",
                a["country"],
                a["pub_date"]
            ])

        for s in crowd_signals:
            writer.writerow([
                "CROWD_SIGNAL",
                s["keyword"],
                s["disaster_type"],
                "Surge Anomaly" if s["metrics"]["is_anomaly"] else "Normal",
                f"Surge: {s['metrics']['surge_ratio']}x (Z={s['metrics']['z_score']})",
                ", ".join(s["detected_locations"]) or "Global",
                s["detected_at"]
            ])

    print(f"      Academic CSV summary table saved to: {csv_path}")
    print("=" * 70)
    print("Report collection complete. Ready for IIT research synthesis.")


def main():
    parser = argparse.ArgumentParser(description="IIT Disaster Management GDACS & Crowd Signals Collector")
    parser.add_argument("--output-dir", default="./reports", help="Directory to save generated reports")
    parser.add_argument("--dry-run", action="store_true", help="Print summary without writing files")
    args = parser.parse_args()

    generate_research_report(output_dir=args.output_dir, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
