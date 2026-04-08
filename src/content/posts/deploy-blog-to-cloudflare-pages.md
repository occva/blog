---
tags:
  - Cloudflare
  - Astro
  - 部署
  - 静态站点
name: deploy-blog-to-cloudflare-pages
create_time: 2026-04-08
---

# 把 Astro 博客部署到 Cloudflare Pages 的完整流程

这篇文章把这次博客部署到 Cloudflare Pages 的过程整理成一篇可复用的示例文。它既能作为真实文章内容，也能顺手验证博客的 Markdown 渲染、归档排序和详情页展示是否都已经接通。

## 先确认仓库里的准备项

部署前先把仓库内和构建环境强相关的文件检查一遍，避免到了 Pages 面板里才发现参数对不上。

- `.node-version`
  固定 Node.js 版本，减少构建机和本地环境不一致的问题。
- `wrangler.toml`
  用来声明 Pages 项目名、产物目录以及兼容日期。
- `package.json`
  保留 Astro 本地开发命令，同时补上 Pages 预览和部署脚本。

## Cloudflare Pages 面板的关键配置

如果项目走 Git 仓库自动部署，创建 Pages 项目时可以直接使用下面这组参数。

- Framework preset: `Astro`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

这些配置本质上就是告诉 Cloudflare 用 Astro 的静态站方式执行构建，并把最终产物从 `dist` 目录发布出去。

## 推荐使用 GitHub 自动部署

这个项目更适合直接接入 Cloudflare Pages 的 GitHub 集成，而不是额外再写一套 GitHub Actions。

接入后可以得到下面这些默认行为：

- 推送到 `main` 时自动触发生产部署
- 推送到其他分支时自动生成预览环境
- Pull Request 会自动带出预览地址和构建状态

Cloudflare 控制台里的操作路径也很直接：

1. 进入 `Workers & Pages`
2. 选择 `Create application`
3. 选择 `Pages`
4. 选择 `Connect to Git`
5. 授权 GitHub 并选中对应仓库
6. 把生产分支设置为 `main`
7. 填入上面的 Astro 构建参数并完成创建

## 本地预览 Cloudflare Pages 环境

在正式发布前，可以先用 Wrangler 模拟 Pages 环境，检查静态产物和路由是否正常。

```bash
npm run pages:preview
```

这一步特别适合在改完路由、归档或 Markdown 渲染逻辑后做一次快速确认。

## 需要直传时的命令

如果暂时不想走 Git 自动部署，也可以保留 Wrangler 作为补充方案。

第一次使用前先登录：

```bash
npx wrangler login
```

然后执行部署：

```bash
npm run pages:deploy
```

## 最后再确认这几件事

- Build system version 使用 `V3`
- Node.js 版本尽量和仓库里的 `.node-version` 保持一致
- `wrangler.toml` 里的项目名和你准备绑定的 Pages 项目保持一致

这篇示例文的意义不只是记录部署步骤，它也刚好证明了一件事：博客现在已经能把一篇带标签、日期和固定 slug 的 Markdown 文章完整展示出来了。
