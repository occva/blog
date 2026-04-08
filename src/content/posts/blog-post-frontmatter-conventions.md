---
tags:
  - 写作规范
  - Markdown
  - Front Matter
  - 博客系统
name: blog-post-frontmatter-conventions
create_time: 2026-04-06
---

# 博客文章 Front Matter 约定

文章系统接通之后，最重要的不是先加更多字段，而是先把最基础的写作约定定清楚。字段越少，后面批量写文章、做归档和调试详情页就越省事。

## 推荐使用的 Front Matter

每篇文章都至少带上下面 3 个字段：

```yaml
---
tags:
  - 开发工具
  - 开源工具
  - 效率工具
  - 网络安全
name: deploy-gemma-4-on-oracle-arm-instance-with-llama-dot-cpp
create_time: 2026-04-08
---
```

## 这三个字段分别做什么

- `tags`
  用来做文章卡片上的标签展示，也能继续扩展到标签页或筛选功能。
- `name`
  作为文章的访问 slug，也就是 URL 最后那一段英文路径。
- `create_time`
  用来做归档排序和详情页时间展示。

## 一个简单但很重要的约定

正文标题直接使用 Markdown 一级标题，例如：

```md
# 把 Astro 博客部署到 Cloudflare Pages 的完整流程
```

这样文章标题由正文自己表达，Front Matter 里只保留展示和路由真正需要的最小字段集，结构会更清晰。

## 为什么先坚持极简字段

如果一开始就把阅读时长、封面图、摘要、作者、SEO 信息全塞进 Front Matter，短期看起来完整，长期却更容易出现漏填和不一致。

现阶段更合适的做法是：

- 先保证 `tags`、`name`、`create_time` 每篇都稳定可用
- 先把首页、归档、详情页完整跑通
- 等文章数量上来后，再决定要不要加封面、摘要或系列字段

这个约定本身就是这轮前端构建的一部分，因为它直接决定文章卡片怎么显示、详情页怎么取路径、归档页怎么排序。
