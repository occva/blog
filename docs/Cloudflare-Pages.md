# Cloudflare Pages 部署说明

这个项目已经按 Cloudflare Pages 的 Astro 静态站方式准备好了。

## 仓库内已准备内容

- `.node-version`
  - 固定 Node.js 为 `22.16.0`，避免 Pages 构建环境版本漂移。
- `wrangler.toml`
  - 已声明 Pages 项目名、构建产物目录和兼容日期。
- `package.json`
  - 保留 Astro 本地开发命令。
  - 新增 `pages:preview` 和 `pages:deploy`，方便用 Wrangler 本地预览或直传。

## 在 Cloudflare Pages 面板里这样填

如果你是接 Git 仓库自动部署，创建 Pages 项目时使用下面这组配置：

- Framework preset: `Astro`
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

## GitHub 自动部署

推荐直接使用 Cloudflare Pages 的 GitHub 集成，不需要额外新增 GitHub Actions 工作流。

接入后行为是：

- 推送到 `main` 会自动触发生产部署
- 推送到其他分支会自动生成预览部署
- Pull Request 会显示预览地址和构建状态

在 Cloudflare 里操作路径：

1. 进入 `Workers & Pages`
2. 选择 `Create application`
3. 选择 `Pages`
4. 选择 `Connect to Git`
5. 授权 GitHub，并选择这个仓库
6. 把生产分支设为 `main`
7. 使用上面的 Astro 构建参数完成创建

如果你后面不想每次 push 都自动部署，可以在 Pages 项目的分支控制里关闭自动部署。

## 建议同时确认的设置

- Build system version: `V3`
- Node.js version:
  - 推荐直接使用仓库里的 `.node-version`
  - 如果你项目是旧的 Pages 配置，也可以在面板环境变量里显式设置 `NODE_VERSION=22.16.0`

## 本地预览 Cloudflare Pages 环境

```bash
npm run pages:preview
```

## 命令行直传部署

第一次使用前先登录：

```bash
npx wrangler login
```

然后部署：

```bash
npm run pages:deploy
```

## 注意

- GitHub 自动部署和 Wrangler 直传是两套模式：
  - 日常推荐：使用 Cloudflare Pages 的 GitHub 集成，push 后自动部署
  - 本地或特殊场景：保留 `wrangler` 命令作为预览/直传补充
- `wrangler.toml` 里的 `name = "blog"` 是 Pages 项目名。
- 如果你想用别的项目名或别的 `*.pages.dev` 子域名，先改这个值，再去创建或绑定项目。
