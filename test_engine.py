import requests
import os

# Find the URL for the Brahan Engine service
stream = os.popen("gcloud run services describe brahan-engine --region us-central1 --format='value(status.url)'")
url = stream.read().strip()

def run_test():
    if not url:
        print("Error: Could not find the Brahan Engine URL.")
        return

    print(f"--- Brahan Engine Connectivity Test ---")
    print(f"Target URL: {url}\n")

    # 1. GET Request (Health Check)
    try:
        get_res = requests.get(url)
        print(f"[GET] Status: {get_res.status_code}")
        print(f"[GET] Data: {get_res.json() if get_res.status_code == 200 else get_res.text}")
    except Exception as e:
        print(f"[GET] Failed: {e}")

    # 2. POST Request (Ingestion)
    try:
        payload = {"sensor": "well-666", "status": "testing", "engine": "Brahan"}
        post_res = requests.post(f"{url}/ingest", json=payload)
        print(f"\n[POST] Status: {post_res.status_code}")
        print(f"[POST] Data: {post_res.json() if post_res.status_code < 400 else post_res.text}")
    except Exception as e:
        print(f"[POST] Failed: {e}")

if __name__ == "__main__":
    run_test()
