docker compose ls --format json | jq -r '.[] | select(.Name=="infra") | .Status' | grep -q '^running'
