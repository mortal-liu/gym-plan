# UI 设计规范

## 核心理念

Apple 极简风：少即是多，用留白、圆角、微妙阴影营造品质感。

## 色彩

| 用途 | 色值 | Tailwind |
|------|------|----------|
| 页面背景 | #f0f7f4 | `bg-brand-50` |
| 卡片背景 | #ffffff | `bg-white` |
| 主色调(按钮/强调) | #339166 | `bg-brand-500` |
| 主色调 hover | #23764f | `bg-brand-600` |
| 文字主色 | #1a1a1a | `text-gray-900` |
| 文字辅色 | #888888 | `text-gray-500` |
| 边框/分割线 | rgba(0,0,0,0.06) | — |

## 圆角

| 元素 | 值 | Tailwind |
|------|-----|----------|
| 大卡片(首页选择) | 20px | `rounded-apple` |
| 中卡片(动作卡片) | 14px | `rounded-apple-sm` |
| 小元素(按钮/输入框) | 10px | `rounded-apple-xs` |

## 阴影

| 场景 | Tailwind |
|------|----------|
| 卡片常态 | `shadow-apple` |
| 卡片 hover | `shadow-apple-hover` |

## 间距

使用 Tailwind 默认间距体系（4px 基准）：
- 页面内边距：`p-4` 或 `p-5` (16-20px)
- 卡片之间：`gap-3` 或 `gap-4` (12-16px)
- 元素内部：`p-4` (16px)

## 字体

使用系统字体栈：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`

| 层级 | 大小 | 粗细 |
|------|------|------|
| 页面标题 | 28px | 600 |
| 卡片标题 | 18-20px | 500 |
| 正文 | 15-16px | 400 |
| 辅助文字 | 13px | 400 |

## 动效

- 按钮 hover：轻微放大 + 阴影加深 `transition-all duration-200`
- 卡片点击：轻微下压(scale 0.98)
- 页面切换：淡入淡出
- 折叠展开：自然的高度过渡
