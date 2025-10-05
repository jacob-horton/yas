docker compose ls --format json | jq -r '.[] | select(.Name=="db") | .Status' | grep -q '^running'
