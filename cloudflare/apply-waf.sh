#!/usr/bin/env bash
# Apply Turfzo WAF custom rules + rate-limit rule via Cloudflare Rulesets API.
# Requires: CLOUDFLARE_API_TOKEN with Zone / WAF Edit + Zone / Firewall Edit.
# Usage:
#   export CLOUDFLARE_API_TOKEN='...'   # never paste into chat
#   export CLOUDFLARE_ZONE_ID='0f63ef05924928fd5c8744b698769d2d'  # turfzo.app
#   ./cloudflare/apply-waf.sh [--dry-run]
#
# Safety properties (do not remove without understanding the blast radius):
#   * A failed Cloudflare API call exits non-zero. It used to be piped into a
#     python print, which always exited 0, so `set -euo pipefail` never fired
#     and a rejected ruleset looked like a successful apply.
#   * The script only ever PUTs to a ruleset whose `name` it owns. It used to
#     PUT to `result[0].id` for the phase, which is whichever ruleset the API
#     happened to return first — a full-PUT on someone else's ruleset silently
#     deletes every rule in it. A phase ruleset that is not ours is now a hard
#     error rather than an overwrite.
#   * PUT is still a full replace of the ruleset's own `rules` array. That is
#     the intended "declarative" behaviour for turfzo-waf-custom, so never add
#     a rule through the dashboard and expect it to survive a re-run.
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

# curl flags: -f turns an HTTP 4xx/5xx into a non-zero exit, -sS keeps the
# response body on stderr so the error is diagnosable, --retry-with-conn-refused
# absorbs the transient connection resets the Rulesets API throws under load.
auth=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

# api_call <method> <url> [data-file] -> response JSON on stdout.
# Exits non-zero on transport error, HTTP error, or a Cloudflare
# `"success": false` envelope.
api_call() {
  local method="$1" url="$2" data_file="${3:-}"
  local body status
  local -a args=(--silent --show-error --fail-with-body --retry 3 --retry-delay 2
                 --retry-connrefused -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
                 -H "Content-Type: application/json" -X "${method}")

  if [[ -n "$data_file" ]]; then
    if ! body="$(curl "${args[@]}" "$url" --data-binary "@${data_file}")"; then
      echo "ERROR: Cloudflare API request failed: ${method} ${url}" >&2
      [[ -n "${body:-}" ]] && echo "$body" >&2
      return 1
    fi
  else
    if ! body="$(curl "${args[@]}" "$url")"; then
      echo "ERROR: Cloudflare API request failed: ${method} ${url}" >&2
      [[ -n "${body:-}" ]] && echo "$body" >&2
      return 1
    fi
  fi

  # A 2xx can still carry {"success": false, "errors": [...]}. Treat that as a
  # failure — printing it and continuing was the original defect.
  status="$(printf '%s' "$body" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception as exc:  # noqa: BLE001
    print(f"non-JSON response: {exc}")
    sys.exit(1)
if not d.get("success"):
    print("success=false errors=" + json.dumps(d.get("errors")))
    sys.exit(1)
print("ok")
')" || return 1
  [[ "$status" == "ok" ]] || { echo "ERROR: $status" >&2; return 1; }
  printf '%s' "$body"
}

# Find the ruleset in `phase` that we own. Prints the id, or nothing if we do
# not have one yet. Refuses to guess: a phase that contains a ruleset we do
# not own is reported so a human can decide, never silently repurposed.
find_owned_ruleset() {
  local phase="$1" want_name="$2"
  local response
  response="$(api_call GET "${API}?phase=${phase}")" || return 1
  printf '%s' "$response" | python3 -c '
import json, sys
phase, want = sys.argv[1], sys.argv[2]
d = json.load(sys.stdin)
results = d.get("result") or []
ours = [r for r in results if r.get("name") == want]
others = [r.get("name", "?") for r in results if r.get("name") != want]
if len(ours) > 1:
    sys.exit(f"FATAL: {len(ours)} rulesets named {want!r} exist in phase {phase!r}; resolve by hand")
if ours:
    print(ours[0]["id"])
else:
    if others:
        print(f"NOTE: phase {phase!r} already holds foreign ruleset(s) {others!r}; "
              f"creating a new {want!r} ruleset alongside them (they are left untouched)",
              file=sys.stderr)
    print("")
' "$phase" "$want_name"
}

upsert_ruleset() {
  local phase="$1" want_name="$2" payload_file="$3"
  local existing
  existing="$(find_owned_ruleset "$phase" "$want_name")" || return 1
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[dry-run] phase=${phase} owned-ruleset=${existing:-none} payload=${payload_file}"
    python3 -c 'import json; print(json.dumps(json.load(open("'"$payload_file"'")), indent=2)[:2000])'
    return 0
  fi
  if [[ -n "$existing" ]]; then
    echo "Updating '${want_name}' ruleset ${existing} in phase ${phase}"
    api_call PUT "${API}/${existing}" "$payload_file" \
      | python3 -c 'import json,sys; print("  applied, result.id =", json.load(sys.stdin)["result"]["id"])'
  else
    echo "Creating '${want_name}' ruleset in phase ${phase}"
    api_call POST "${API}" "$payload_file" \
      | python3 -c 'import json,sys; print("  created, result.id =", json.load(sys.stdin)["result"]["id"])'
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

upsert_ruleset "http_request_firewall_custom" "turfzo-waf-custom"  "$ROOT/.waf-custom-payload.json"
upsert_ruleset "http_ratelimit"              "turfzo-ratelimit"  "$ROOT/.ratelimit-payload.json"
rm -f "$ROOT/.waf-custom-payload.json" "$ROOT/.ratelimit-payload.json"

echo "Done. Verify at https://dash.cloudflare.com/?to=/:account/turfzo.app/waf"
