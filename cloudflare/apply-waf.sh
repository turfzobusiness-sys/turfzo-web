#!/usr/bin/env bash
# Apply Turfzo WAF custom rules + rate-limit rule via Cloudflare Rulesets API.
# Requires: CLOUDFLARE_API_TOKEN with Zone / WAF Edit + Zone / Firewall Edit.
# Usage:
#   export CLOUDFLARE_API_TOKEN='...'   # never paste into chat
#   export CLOUDFLARE_ZONE_ID='0f63ef05924928fd5c8744b698769d2d'  # turfzo.app
#   ./cloudflare/apply-waf.sh [--dry-run]
set -euo pipefail

ZONE_ID="${CLOUDFLARE_ZONE_ID:-0f63ef05924928fd5c8744b698769d2d}"
API="https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/rulesets"
DRY_RUN="false"
if [[ "${1:-}" == "--dry-run" ]]; then DRY_RUN="true"; fi
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN is not set." >&2
  echo "Create one at https://dash.cloudflare.com/profile/api-tokens (Zone WAF Edit on turfzo.app)." >&2
  exit 1
fi

auth=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

phase_ruleset_id() {
  local phase="$1"
  curl -sS "${auth[@]}" "${API}?phase=${phase}" \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); r=(d.get("result") or []); print(r[0]["id"] if r else "")'
}

upsert_phase() {
  local phase="$1" payload_file="$2"
  local existing
  existing="$(phase_ruleset_id "$phase")"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[dry-run] phase=${phase} existing=${existing:-none} payload=${payload_file}"
    python3 -c 'import json; print(json.dumps(json.load(open("'"$payload_file"'")), indent=2)[:2000])'
    return 0
  fi
  if [[ -n "$existing" ]]; then
    echo "Updating ${phase} ruleset ${existing} from ${payload_file}"
    curl -sS "${auth[@]}" -X PUT "${API}/${existing}" --data-binary "@${payload_file}" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("success:", d.get("success"), "errors:", d.get("errors"))'
  else
    echo "Creating ${phase} ruleset from ${payload_file}"
    curl -sS "${auth[@]}" -X POST "${API}" --data-binary "@${payload_file}" | python3 -c 'import json,sys; d=json.load(sys.stdin); print("success:", d.get("success"), "errors:", d.get("errors"))'
  fi
}

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build Rulesets API payloads from the declarative JSON files.
python3 - "$ROOT/waf-custom-rules.json" "$ROOT/.waf-custom-payload.json" <<'PY'
import json, sys
src = json.load(open(sys.argv[1]))
rules = []
for r in src["rules"]:
    rules.append({
        "ref": r["ref"],
        "description": r["description"],
        "expression": r["expression"],
        "action": r["action"],
    })
payload = {"name": "turfzo-waf-custom", "kind": "zone", "phase": "http_request_firewall_custom", "rules": rules}
json.dump(payload, open(sys.argv[2], "w"), indent=2)
PY

python3 - "$ROOT/rate-limit-rule.json" "$ROOT/.ratelimit-payload.json" <<'PY'
import json, sys
src = json.load(open(sys.argv[1]))["rule"]
rule = {
    "ref": src["ref"],
    "description": src["description"],
    "expression": src["expression"],
    "action": src["action"],
    "ratelimit": {
        "characteristics": src["characteristics"],
        "period": src["period"],
        "requests_per_period": src["requests_per_period"],
        "mitigation_timeout": src["mitigation_timeout"],
    },
}
payload = {"name": "turfzo-ratelimit", "kind": "zone", "phase": "http_ratelimit", "rules": [rule]}
json.dump(payload, open(sys.argv[2], "w"), indent=2)
PY

upsert_phase "http_request_firewall_custom" "$ROOT/.waf-custom-payload.json"
upsert_phase "http_ratelimit" "$ROOT/.ratelimit-payload.json"
rm -f "$ROOT/.waf-custom-payload.json" "$ROOT/.ratelimit-payload.json"

echo "Done. Verify at https://dash.cloudflare.com/?to=/:account/turfzo.app/waf"
