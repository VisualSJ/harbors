# 2026-08-15-agent-chat-kit

Task ID: `2026-08-15-agent-chat-kit`
Type: `feature`

## 背景与问题

仓库原有 Kit 远程发布、Registry、Release Tag、发布意图和版本递增门禁，同时维护 GitHub Actions 工作流。当前需求是将 Kit 使用方式收敛为本地开发与验证，移除这些不再需要的远程发布和自动化链路。

## 目标

移除全部 GitHub Actions 与 Kit 发布体系，同时保留从本地 `kits/` 目录发现 Kit、执行校验、打包和检查制品的开发能力。

## 范围

- 删除 GitHub Actions 工作流、Kit Registry、远程发布脚本与入口、Release Tag、release intent 和版本递增门禁。
- 将 Kit 工作流、根命令、测试和活动文档调整为本地目录发现、validate、pack 与 inspect 模型。
- 更新与上述发布体系直接耦合的测试契约和开发说明。

## 非目标

- 不实现 Kit 发布、远程部署、Registry 索引、Release Tag 或版本递增机制。
- 不新增或修改 `agent-chat` Kit；该 Kit（包括对接本机 Codex app-server 的聊天界面）延期到独立的后续 Task。
- 不修改 Framework 核心运行时或插件协议。

## 验收标准

- 仓库不再包含 GitHub Actions、Kit 发布、Registry、Release Tag 或 release intent 的实现和命令入口。
- 现有 Kit 可由 `kits/` 本地目录发现，并完成本地 validate、pack 和 inspect。
- Kit workflow、Kit check、CI 选择、文档契约和 preflight 测试通过，且差异无空白错误。
- Framework 核心运行时和插件协议没有变更。

## 约束

- 本次只清理发布与自动化体系，必须保留现有 Kit 的本地开发、校验和制品检查能力。
- 不创建、推送或维护远程 Registry、GitHub Release、Release Tag 或发布工作流。
- 变更限于本 Task 的工作树；不在本次修改 Framework 核心运行时或插件协议。

## 需求变更

本 Task 未发生需求变更。`agent-chat` Kit 的实现从本次发布体系清理中拆出，延期到独立的后续 Task。
