import urllib.request
import json
import time
import os
import sys

RUN_ID = sys.argv[1] if len(sys.argv) > 1 else "36994677300"
REPO = "TeamSecure-GITA/Disaster-Management-Platform"
OUTPUT_PATH = "/home/deba/Desktop/DISASTER_MANAGEMENT_PLATFORM/mobile/Disaster-Sentinel-Mobile.apk"

headers = {"User-Agent": "Mozilla/5.0"}

print(f"Monitoring GitHub Actions Run {RUN_ID}...")

while True:
    try:
        req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/actions/runs/{RUN_ID}", headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            status = data.get("status")
            conclusion = data.get("conclusion")
            print(f"Status: {status} | Conclusion: {conclusion}")
            
            if status == "completed":
                if conclusion != "success":
                    print(f"Workflow failed with conclusion: {conclusion}")
                    sys.exit(1)
                print("Workflow finished successfully!")
                break
    except Exception as e:
        print(f"Error checking run: {e}")
    time.sleep(15)

# Now find the release asset
print("Looking for release asset Disaster-Sentinel-Mobile.apk...")
for attempt in range(10):
    try:
        req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases", headers=headers)
        with urllib.request.urlopen(req) as resp:
            releases = json.loads(resp.read().decode())
            for rel in releases:
                for asset in rel.get("assets", []):
                    if asset.get("name") == "Disaster-Sentinel-Mobile.apk":
                        download_url = asset.get("browser_download_url")
                        print(f"Found APK download URL: {download_url} ({asset.get('size')} bytes)")
                        print("Downloading APK to:", OUTPUT_PATH)
                        urllib.request.urlretrieve(download_url, OUTPUT_PATH)
                        size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
                        print(f"Downloaded successfully: {OUTPUT_PATH} ({size_mb:.2f} MB)")
                        sys.exit(0)
    except Exception as e:
        print(f"Error checking releases: {e}")
    time.sleep(10)

print("APK not found in releases yet.")
sys.exit(2)
