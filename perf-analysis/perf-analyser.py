import subprocess
import json
import statistics
import tempfile
import os
import shutil
import socket
import time
import urllib.request
import urllib.parse
import websocket
from dotenv import load_dotenv
from datetime import datetime
import sys

load_dotenv()

URL = os.getenv("TARGET_URL")
COOKIE = os.getenv("SESSION_COOKIE")
COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "id")
RUNS = int(os.getenv("RUNS", 3))

METRICS = {
    "lcp": "largest-contentful-paint",
    "fcp": "first-contentful-paint",
    "cls": "cumulative-layout-shift",
    "tti": "interactive",
    "speed_index": "speed-index"
}

results = {key: [] for key in METRICS}


def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("localhost", 0))
        return s.getsockname()[1]


def find_chrome():
    for name in ("google-chrome", "google-chrome-stable", "chromium-browser", "chromium", "chrome"):
        path = shutil.which(name)
        if path:
            return path
    raise RuntimeError("No Chrome/Chromium binary found on PATH")


def wait_for_cdp(port, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(f"http://localhost:{port}/json/version", timeout=1)
            return
        except OSError:
            time.sleep(0.2)
    raise RuntimeError("Chrome did not open its debugging port in time")


def set_session_cookie(port, url, name, value):
    # Setting this via CDP puts it in Chrome's real cookie jar, so it behaves
    # exactly like a logged-in browser (unlike --extra-headers, which forces
    # a raw header onto the wire but leaves document.cookie/native cookie
    # handling untouched - that's what broke authenticated XHR calls here).
    host = urllib.parse.urlparse(url).hostname
    req = urllib.request.Request(f"http://localhost:{port}/json/new?about:blank", method="PUT")
    with urllib.request.urlopen(req) as r:
        target = json.load(r)

    ws = websocket.create_connection(target["webSocketDebuggerUrl"])
    try:
        ws.send(json.dumps({
            "id": 1,
            "method": "Network.setCookie",
            "params": {
                "name": name,
                "value": value,
                "domain": host,
                "path": "/",
                "secure": True,
            }
        }))
        reply = json.loads(ws.recv())
        if not reply.get("result", {}).get("success", False):
            raise RuntimeError(f"Chrome rejected the session cookie: {reply}")
    finally:
        ws.close()
        close_req = urllib.request.Request(f"http://localhost:{port}/json/close/{target['id']}", method="PUT")
        urllib.request.urlopen(close_req)


def check_auth(url, data):
    origin = "{0.scheme}://{0.netloc}".format(urllib.parse.urlparse(url))
    reqs = data.get("audits", {}).get("network-requests", {}).get("details", {}).get("items", [])
    failed = [r["url"] for r in reqs if r.get("url", "").startswith(origin) and r.get("statusCode") in (401, 403)]
    if failed:
        print(f"WARNING: {len(failed)} same-origin request(s) came back 401/403 - the session cookie is not authenticating:")
        for u in failed[:5]:
            print(f"  - {u}")


def run_lighthouse(url, port):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp:
        output_path = tmp.name

    try:
        subprocess.run([
            "pnpm", "exec", "lighthouse",
            url,
            "--output=json",
            f"--output-path={output_path}",
            f"--port={port}",
            "--quiet",
            "--throttling-method=simulate", # Throttle - better for reproducibility
            # "--throttling-method=provided" # Don't throttle - real world performance
        ], check=True)

        with open(output_path) as f:
            data = json.load(f)

        check_auth(url, data)

        audits = data["audits"]

        run_data = {}
        for key, audit_name in METRICS.items():
            run_data[key] = audits[audit_name]["numericValue"]

        return run_data

    finally:
        os.remove(output_path)


chrome_port = find_free_port()
profile_dir = tempfile.mkdtemp(prefix="perf-analyser-chrome-")
chrome_proc = subprocess.Popen([
    find_chrome(),
    "--headless=new",
    f"--remote-debugging-port={chrome_port}",
    "--remote-allow-origins=*",
    f"--user-data-dir={profile_dir}",
    "--no-first-run",
    "--log-level=3",
])

try:
    wait_for_cdp(chrome_port)
    set_session_cookie(chrome_port, URL, COOKIE_NAME, COOKIE)

    # Run multiple times against the same authenticated browser instance
    for i in range(RUNS):
        print(f"Run {i+1}/{RUNS}...")
        run_data = run_lighthouse(URL, chrome_port)

        for key in METRICS:
            results[key].append(run_data[key])
finally:
    chrome_proc.terminate()
    chrome_proc.wait(timeout=10)
    shutil.rmtree(profile_dir, ignore_errors=True)


# Compute stats
summary = {}

print("\n=== Results ===\n")

for key, values in results.items():
    avg = statistics.mean(values)
    std = statistics.stdev(values) if len(values) > 1 else 0

    summary[key] = {
        "values": values,
        "average": avg,
        "std_dev": std
    }

    print(f"{key.upper()}:")
    print(f"  values: {[round(v, 2) for v in values]}")
    print(f"  avg   : {avg:.2f}")
    print(f"  std   : {std:.2f}")
    print()


# Write JSON output
name = sys.argv[1] if len(sys.argv) > 1 else "run"
timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
os.makedirs("results", exist_ok=True)

output = {
    "url": URL,
    "runs": RUNS,
    "metrics": summary,
    "timestamp": timestamp,
    "name": name
}


output_path = f"results/{name}-{timestamp}.json"

with open(output_path, "w") as f:
    json.dump(output, f, indent=2)

print(f"Saved results to {output_path}")
