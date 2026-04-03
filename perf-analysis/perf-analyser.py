import subprocess
import json
import statistics
import tempfile
import os
from dotenv import load_dotenv
from datetime import datetime
import sys

load_dotenv()

URL = os.getenv("TARGET_URL")
COOKIE = os.getenv("SESSION_COOKIE")
RUNS = int(os.getenv("RUNS", 3))

METRICS = {
    "lcp": "largest-contentful-paint",
    "fcp": "first-contentful-paint",
    "cls": "cumulative-layout-shift",
    "tti": "interactive",
    "speed_index": "speed-index"
}

results = {key: [] for key in METRICS}


def run_lighthouse(url):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json") as tmp:
        output_path = tmp.name

    try:
        subprocess.run([
            "pnpm", "exec", "lighthouse",
            url,
            "--output=json",
            f"--output-path={output_path}",
            "--chrome-flags=--headless=new",
            "--quiet",
            "--throttling-method=simulate", # Throttle - better for reproducibility
            # "--throttling-method=provided" # Don't throttle - real world performance
        ], check=True)

        with open(output_path) as f:
            data = json.load(f)

        audits = data["audits"]

        run_data = {}
        for key, audit_name in METRICS.items():
            run_data[key] = audits[audit_name]["numericValue"]

        return run_data

    finally:
        os.remove(output_path)


# Run multiple times
for i in range(RUNS):
    print(f"Run {i+1}/{RUNS}...")
    run_data = run_lighthouse(URL)

    for key in METRICS:
        results[key].append(run_data[key])


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
