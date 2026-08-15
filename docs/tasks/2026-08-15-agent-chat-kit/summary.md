# 移除 Kit 发布体系实现总结

## 最终结论

仓库已移除 GitHub Actions、Kit 远程发布、Registry、Release Tag、发布意图和版本递增门禁。Kit 仍可在本地从 `kits/` 目录发现、校验、打包并检查制品。`agent-chat` Kit 未包含在本次变更，已明确延期到独立的后续 Task。

## 需求完成情况

- 删除全部 GitHub Actions workflow。
- 删除 Kit Registry 配置、发布脚本、发布辅助库、release intent 和 Release Tag 机制。
- 移除根 package scripts 中的发布入口与版本递增要求。
- 将 Kit workflow 和本地检查改为以 `kits/` 目录为唯一发现来源，保留 validate、pack、inspect。
- 同步 Kit workflow、架构、开发与制品文档，以及相应测试契约。

## 主要改动

- 删除 `.github/workflows/` 下的 CI 与 Kit 发布工作流，以及 `registry/` 中的发布策略和撤回配置。
- 删除 Kit 发布、Registry attestation、release intent 和 release 规划实现及其测试。
- 简化 Kit workflow 脚本：新 Kit 不再登记 Registry 或触发发布；收口脚本不再执行 release 相关步骤。
- 调整 Kit monorepo、check、CI 选择和文档测试，使其验证本地 Kit 目录而非发布元数据与版本递增规则。
- 更新根 README、架构和开发指南，移除活动文档中的远程发布说明。

## 关键决定

- 固定版本字段仍保留在 Kit 描述与 npm 元数据中；本次移除的是发布所需的版本递增门禁，而不是破坏这些文件格式。
- `agent-chat` 与本机 Codex app-server 对接属于新增产品能力，不与发布体系清理混在同一 PR，留待单独 Task 实现。

## 验证结果

- `npm run test:kit-workflow`：通过。
- `node --test scripts/lib/kit-monorepo.test.mjs scripts/lib/kit-docs.test.mjs`：通过。
- `npm run test:kit-check`：通过。
- `npm run test:kit-ci-selection`：通过。
- `npm run test:preflight`：通过。
- `git diff --check`：通过。

## 影响与风险

- 仓库不再提供 GitHub Actions CI 或任何 Kit 自动发布能力；需要运行检查时必须在本地执行。
- 已有或历史上的远程 Registry、GitHub Release 和 Release Tag 不再由仓库代码维护。

## 偏差与遗留

- `agent-chat` Kit 本体尚未创建；它需要以独立 Task 定义本机 Codex app-server 连接、会话协议和 Web 聊天界面。

## 后续关注

- 创建 `agent-chat` 的独立 Task 后，再实现其本地 app-server 适配器和网页对话界面。

## 相关正式文档

无。
