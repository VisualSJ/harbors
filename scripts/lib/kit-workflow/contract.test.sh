#!/usr/bin/env bash

test_skill_layout_and_contract() {
  test -f "$SKILL_SOURCE/SKILL.md" || fail 'SKILL.md is missing'
  test -x "$SOURCE_START" || fail 'start-kit-change.sh is missing or not executable'
  test -x "$SOURCE_FINISH" || fail 'finish-kit-change.sh is missing or not executable'
  skill=$(cat "$SKILL_SOURCE/SKILL.md")
  assert_contains "$skill" 'main:kits/<kit>'
  assert_contains "$skill" 'origin/main'
  assert_contains "$skill" '首次创建 Kit 必须使用 `feature`'
  assert_contains "$skill" '`--ready-for-pr`'
  assert_contains "$skill" '不主动合并 PR'
}

run_contract_tests() { run_case 'skill layout and local-development contract' test_skill_layout_and_contract; }
