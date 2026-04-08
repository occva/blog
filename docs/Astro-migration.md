# Phase 1：仅做 Astro 迁移，保证前端视觉零变化

## Summary
- 本次范围只做 `Astro` 迁移，不做内容系统、Markdown 路由、归档逻辑、文章模板、后台或任何 UI 重设计。
- 成果目标是：把当前站点从纯静态 `HTML/CSS/JS` 搬到 Astro 项目结构里，但页面效果、类名、DOM 层级、动画、交互、响应式表现保持一致。
- 构建模式固定为 `Astro static output`，确保后续可直接部署到 Vercel 和 Cloudflare Pages。

## Key Changes
- 初始化 Astro 项目，使用最轻配置：
  - `Astro + TypeScript`
  - `output: 'static'`
  - 不接 React/Vue/Svelte
  - 不接 SSR adapter
- 首页迁移方式固定为“原样搬运”：
  - 现有 `index.html` 主体内容迁入 `src/pages/index.astro`
  - 不重写 DOM 结构，不拆小组件，不调整 class，不改文案，不改层级
  - `<head>` 中字体、meta、title 保持现有行为，仅通过 Astro 页面标准方式承载
- 样式迁移方式固定为“原样保留”：
  - 现有 `style.css` 迁入 Astro 全局样式入口
  - 所有选择器、变量、媒体查询、数值、动画名称保持不变
  - 不做 CSS Modules，不做 scoped style，不做重构
- 脚本迁移方式固定为“仅改挂载方式”：
  - 现有 `script.js` 迁入 Astro 可加载的浏览器端脚本
  - 逻辑内容保持一致，只做最小路径适配
  - 仅在首页加载，不变成全站通用 hydration
- 项目结构固定为：
  - `src/pages/index.astro`
  - `src/layouts/BaseLayout.astro`
  - `src/styles/style.css`
  - `src/scripts/home.ts` 或 `src/scripts/home.js`
  - `public/` 仅放后续静态资源；本轮如果没有新增资源，可为空
- 构建与部署接口固定为：
  - `npm run dev`
  - `npm run build`
  - 输出目录 `dist`
  - 保证 Vercel / Cloudflare Pages 均可直接使用静态构建产物

## Public Interfaces / Constraints
- 本轮页面接口只有 `/`
- 本轮不新增：
  - `/posts`
  - `/archive`
  - `/about` 独立 Astro 页面
  - Markdown 内容目录
  - Content Collections
  - Mermaid
- 视觉约束固定为：
  - 样式一点都不能变
  - 交互行为不能弱化
  - 桌面端与移动端当前拆分方案必须保持
- 实现约束固定为：
  - 不为了“更 Astro”而组件化首页场景
  - 不为了“更现代”而改 CSS/JS 结构
  - 迁移优先级高于整理代码

## Test Plan
- 构建测试
  - `npm run dev` 能本地启动
  - `npm run build` 成功输出 `dist`
  - 产物为纯静态文件
- 视觉回归
  - 对比迁移前后首页桌面端截图，必须一致
  - 对比迁移前后移动端截图，必须一致
  - 重点检查风筝、人物、树、池塘、卡片、顶部导航、滚动区块位置
- 交互回归
  - reveal 动画正常
  - 鼠标靠近树和人物的交互正常
  - 点击风筝的风吹动画正常
  - 手机端与桌面端交互行为保持当前状态
- 部署验证
  - Vercel 可成功构建静态站
  - Cloudflare Pages 可成功构建静态站

## Assumptions
- 本轮“只做 Astro 迁移”意味着内容系统延后，不在这次实现。
- 为了确保视觉零变化，首页会保留为一个大页面迁移，而不是拆成多个 Astro 组件。
- 如遇 Astro 资源路径差异，只允许做最小路径修正，不允许借机改样式或重排结构。
