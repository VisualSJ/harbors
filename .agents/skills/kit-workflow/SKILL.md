---
name: kit-workflow
description: Use when starting, continuing, or finishing an independently developed Harbors Kit change in the harbors monorepo.
---

# Kit Workflow

Every Kit change follows one Task from isolated development to an open PR. Kit source lives at `main:kits/<kit>`; `main` is the only long-lived development branch.

| Intent | Action | Success evidence |
| --- | --- | --- |
| Start | `scripts/start-kit-change.sh <kit> <type> <slug>` | `TARGET_BRANCH=main`, branch, worktree, locked `BASE_COMMIT`, `TASK_ID=`, `TASK_DIR=` |
| Finish | `scripts/finish-kit-change.sh <kit> <summary> <body-file>` | Verified open PR targeting `main` and `PR_URL=` |

## Workflow

1. **需求确认与分类**：先确认背景、目标、范围、非目标、验收、约束，再分类为 `feature`/`bug`/`optimize`/`docs`/`refactor`/`test`/`chore`；提交标签依次对应 `[Feature]`、`[Bug]`、`[Optimize]`、`[Docs]`、`[Refactor]`、`[Test]`、`[Chore]`。
2. **Task 建档**：从 primary worktree 运行 start。它锁定已 fetch 的 `origin/main`、创建 `.worktrees/kit-<kit>-<type>-<slug>`、运行根 `npm ci` 并自动 init Task。进入输出的 worktree 后立即填写 `task.md`。首次创建 Kit 必须使用 `feature`；已有 Kit 会校验其描述文件。截止时间、负责人授权和已投入时间都不是跳过 Task 的例外。
3. **设计、实现与验证**：spec、plan、research 默认放在当前 Task 的 `.work/`；`.work/` 默认不提交。用 `npm run task:status -- start|complete|skip|block|resume|rewind <task-id> <stage>` 推进并保留真实测试证据。`status.json` 只由 `task:status` CLI 管理 schema 字段；主观记录写入 `.work/` 或长期文档。
4. **收口与 PR**：先完成 `summary.md`，使所有内部 stages 终态，并通过 ready gate（`--ready-for-pr`）。使用 clean linked worktree 和仓库外的 PR body，包含 `## Summary` 与 `## Testing`；传给 finish 的 summary 不带方括号标签、不带换行且末尾无句号。finish 验证 Task、boundary、目标 Kit 的本地检查和 open PR 的 base/head，再创建或恢复 PR，回写 PR 号并二次 push。审查要求实质改动时用 `rewind` 回退相应阶段后重新验证。
5. **合并确认与会话归档**：`PR_URL=` 只代表收口已提交，不代表需求完成。只有内部 stages 终态、status 有 PR 号、GitHub PR 已 merged、latest head commit 的 repository-required checks 成功、三份 Task 正式文件已在 `main`，才宣布完成并归档当前 Codex 会话；不为归档制造合并后 commit。

## Resume and boundaries

同机恢复时先读 `task.md` 和 `status.json`，再读必要的 `.work/` 记录，最后核对 Git branch/status/log/diff。三份 Task 正式档案（`task.md`、`status.json`、`summary.md`）是 boundary 允许的共享治理例外；它不授权修改其他 Task、其他 Kit 或仓库共享代码。

Do not stash, pull, merge, rebase, hard reset, force push, delete worktrees, reuse a change branch, override the `origin/main` base, or change another Kit/shared repository code. Keep worktrees and branches unless removal is explicitly requested. 用户说“完成”不授权 merge；不主动合并 PR。
