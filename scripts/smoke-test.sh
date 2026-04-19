#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://localhost:3000}"
for path in "" "/admin" "/api/auth/check"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$URL$path")
  echo "GET $URL$path -> $code"
  if [[ "$code" != "200" && ! ( "$path" == "/api/auth/check" && "$code" == "401" ) ]]; then
    echo "FAIL: unexpected status"; exit 1
  fi
done
echo "smoke test passed"
