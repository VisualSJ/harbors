#!/usr/bin/env bash

kit_workflow_fail() { printf 'error: %s\n' "$*" >&2; exit 1; }
kit_workflow_validate_kit_name() { [[ "$1" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || kit_workflow_fail "invalid Kit name: $1"; }
kit_workflow_validate_change_type() { case "$1" in feature|bug|docs|refactor|optimize|test|chore) ;; *) kit_workflow_fail "invalid change type: $1" ;; esac; }
kit_workflow_label_for_type() { case "$1" in feature) printf 'Feature\n' ;; bug) printf 'Bug\n' ;; docs) printf 'Docs\n' ;; refactor) printf 'Refactor\n' ;; optimize) printf 'Optimize\n' ;; test) printf 'Test\n' ;; chore) printf 'Chore\n' ;; *) kit_workflow_fail "invalid change type: $1" ;; esac; }
kit_workflow_repo_root() { local script_dir; script_dir=$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd -P); git -C "$script_dir" rev-parse --show-toplevel 2>/dev/null || kit_workflow_fail 'Skill is not inside a Git repository'; }
kit_workflow_validate_identity() { local repo_root=$1 actual_name actual_email; actual_name=$(git -C "$repo_root" config --local --get user.name 2>/dev/null || true); actual_email=$(git -C "$repo_root" config --local --get user.email 2>/dev/null || true); test "$actual_name" = 'VisualSJ' || kit_workflow_fail "Git user.name must be VisualSJ, got ${actual_name:-unset}"; test "$actual_email" = 'devhacker520@hotmail.com' || kit_workflow_fail "Git user.email must be devhacker520@hotmail.com, got ${actual_email:-unset}"; }

# Existing Kits must have a coherent local descriptor. This deliberately does
# not impose publication channels or version progression.
kit_workflow_validate_product() {
  local repo_root=$1 kit=$2 manifest_path="$repo_root/kits/$kit/kit.json" package_path="$repo_root/kits/$kit/package.json"
  test -f "$manifest_path" || kit_workflow_fail "kits/$kit/kit.json is missing"
  test -f "$package_path" || kit_workflow_fail "kits/$kit/package.json is missing"
  node - "$manifest_path" "$package_path" "$kit" <<'NODE'
const fs = require('node:fs');
const [manifestPath, packagePath, expectedId] = process.argv.slice(2);
const read = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { console.error(`error: ${file} must contain valid JSON`); process.exit(1); } };
const manifest = read(manifestPath);
const pkg = read(packagePath);
if (manifest.id !== expectedId || pkg.name !== expectedId) { console.error(`error: Kit identity mismatch: expected ${expectedId}`); process.exit(1); }
NODE
}
kit_workflow_run_product_checks() { local repo_root=$1 kit=$2 pack_dir=$3; (cd "$repo_root" && npm run kit:check -- "$kit" --output-directory "$pack_dir"); }
