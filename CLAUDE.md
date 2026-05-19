# CLAUDE.md — Gym Plan 项目工作指引

## 项目简介

这是一个健身训练记录 Web 应用，帮助用户记录推/拉/蹲三类训练的组数、次数和重量。

## 关键文件路径

| 文件 | 路径 | 说明 |
|------|------|------|
| 需求文档 | [docs/requirements.md](docs/requirements.md) | 用户故事、功能范围 |
| 技术选型 | [docs/tech-stack.md](docs/tech-stack.md) | 技术栈及选型理由 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 色彩、圆角、阴影、动效标准 |
| 开发计划 | [docs/development-plan.md](docs/development-plan.md) | 分阶段执行步骤 |
| 开发日志 | [dev-journal/](dev-journal/) | 每日开发记录 |

## 日常工作流

### 每天开始开发时
1. 阅读 `docs/development-plan.md` 确认当前阶段
2. 阅读 `docs/design-spec.md` 确保 UI 符合规范

### 每天结束开发时
1. 在 `dev-journal/` 中创建当天日志文件（格式：`YYYY-MM-DD.md`）
2. 记录完成事项、待办事项、遇到的问题

### 每个阶段完成时
1. 更新 `docs/development-plan.md` 勾选已完成步骤
2. 运行 `npm run dev` 验证功能
3. 检查浏览器 console 无报错

## 技术约定

- 技术栈: React 19 + TypeScript + Vite + Tailwind CSS 3 + React Router 7
- 数据存储: localStorage（纯前端，无后端）
- 设计风格: Apple 极简风，淡绿色背景 `#f0f7f4`
- 使用 Tailwind CSS classes，不写额外 CSS 除非必要
- 所有文字使用中文
- UI 组件放在 `src/components/ui/`
- 页面组件放在 `src/pages/`
- 每次只做一个阶段，不要一次做太多
