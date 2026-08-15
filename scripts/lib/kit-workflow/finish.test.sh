#!/usr/bin/env bash

test_finish_runs_local_gates_and_creates_pr() {
  prepare_change feature
  output=$("$FINISH" sqlite '完成 Kit 变更' "$BODY")
  assert_contains "$output" 'PR_URL=https://github.com/example/repo/pull/1'
  assert_contains "$(cat "$NPM_LOG")" "run kit:boundary -- sqlite --task $TASK_ID --base refs/remotes/origin/main --head HEAD"
  assert_contains "$(cat "$NPM_LOG")" 'run kit:check -- sqlite --output-directory'
  assert_contains "$(cat "$GH_LOG")" 'pr create --base main --head kit-change/sqlite/feature/finish-case'
  assert_eq "$(node -p "require('$TASK_DIR/status.json').pullRequest.number")" 1
}

test_finish_rejects_dirty_boundary_and_invalid_pr() {
  prepare_change feature
  printf 'outside\n' > "$WORKTREE/outside.txt"
  if output=$("$FINISH" sqlite '拒绝越界变更' "$BODY" 2>&1); then fail 'out-of-boundary change succeeded'; fi
  assert_contains "$output" 'working tree is not clean'
  test ! -s "$GH_LOG" || fail 'PR command ran for dirty tree'

  prepare_change feature
  export GH_VIEW_BASE=develop
  if output=$("$FINISH" sqlite '拒绝错误 PR' "$BODY" 2>&1); then fail 'wrong-base PR succeeded'; fi
  assert_contains "$output" 'unexpected base'
}

test_finish_reuses_open_pr_without_empty_commit() {
  prepare_change feature
  export GH_OPEN_PR_COUNT=1
  first=$("$FINISH" sqlite '恢复 Kit 变更' "$BODY")
  head=$(git -C "$WORKTREE" rev-parse HEAD)
  second=$("$FINISH" sqlite '恢复 Kit 变更' "$BODY")
  assert_contains "$first" 'PR_URL=https://github.com/example/repo/pull/1'
  assert_contains "$second" 'PR_URL=https://github.com/example/repo/pull/1'
  assert_eq "$(git -C "$WORKTREE" rev-parse HEAD)" "$head"
  test ! -s "$GH_CREATE_LOG" || fail 'created a duplicate PR'
}

run_finish_tests() {
  run_case 'finish runs local gates and creates a PR' test_finish_runs_local_gates_and_creates_pr
  run_case 'finish rejects dirty worktrees and invalid PRs' test_finish_rejects_dirty_boundary_and_invalid_pr
  run_case 'finish reuses an open PR safely' test_finish_reuses_open_pr_without_empty_commit
}
