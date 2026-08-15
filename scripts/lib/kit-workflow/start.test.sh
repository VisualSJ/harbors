#!/usr/bin/env bash

test_start_uses_main_baseline_and_allows_feature_bootstrap() {
  new_fixture
  install_mocks
  output=$("$START" redis feature first-kit)
  assert_contains "$output" 'KIT=redis'
  assert_contains "$output" 'TARGET_BRANCH=main'
  test -d "$REPO/.worktrees/kit-redis-feature-first-kit/docs/tasks/$(date +%F)-first-kit" || fail 'bootstrap Task is missing'

  new_fixture
  install_mocks
  if output=$("$START" redis bug missing-kit 2>&1); then fail 'non-feature bootstrap succeeded'; fi
  assert_contains "$output" 'only feature changes can create a new Kit'
}

test_start_validates_existing_descriptor_and_context() {
  new_fixture
  install_mocks
  node - "$REPO/kits/sqlite/kit.json" <<'NODE'
const fs = require('node:fs'); const file = process.argv[2]; const value = JSON.parse(fs.readFileSync(file)); value.id = 'wrong'; fs.writeFileSync(file, JSON.stringify(value));
NODE
  git -C "$REPO" add kits/sqlite/kit.json
  git -C "$REPO" commit -m '[Bug] 制造描述错误' >/dev/null
  git -C "$REPO" push origin main >/dev/null 2>&1
  if output=$("$START" sqlite bug invalid-descriptor 2>&1); then fail 'invalid descriptor succeeded'; fi
  assert_contains "$output" 'Kit identity mismatch'

  new_fixture
  install_mocks
  if output=$("$START" '../bad' feature valid 2>&1); then fail 'invalid kit succeeded'; fi
  assert_contains "$output" 'invalid Kit name'
  linked="$REPO/.worktrees/linked"
  git -C "$REPO" worktree add --detach "$linked" origin/main >/dev/null 2>&1
  if output=$("$linked/.agents/skills/kit-workflow/scripts/start-kit-change.sh" sqlite feature nested 2>&1); then fail 'linked start succeeded'; fi
  assert_contains "$output" 'primary worktree'
}

run_start_tests() {
  run_case 'start uses main and bootstraps a feature Kit' test_start_uses_main_baseline_and_allows_feature_bootstrap
  run_case 'start validates existing descriptors and context' test_start_validates_existing_descriptor_and_context
}
