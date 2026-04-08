import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked, type Tokens } from "marked";

type PostHeading = {
  depth: number;
  slug: string;
  text: string;
};

export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  createTime: string;
  formattedDate: string;
}

export interface PostEntry extends PostSummary {
  headings: PostHeading[];
  html: string;
}

const postsDirectory = path.join(process.cwd(), "src", "content", "posts");

marked.use({
  gfm: true,
});

const normalizeDateValue = (value: string | Date) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toISOString().slice(0, 10);
  }

  const source = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(source)) {
    return source.slice(0, 10);
  }

  const date = new Date(source);

  if (Number.isNaN(date.getTime())) {
    return source;
  }

  return date.toISOString().slice(0, 10);
};

const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildExcerpt = (markdown: string) => {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((item) => stripMarkdown(item))
    .filter(Boolean);

  const summary = paragraphs[1] ?? paragraphs[0] ?? "";

  if (summary.length <= 86) {
    return summary;
  }

  return `${summary.slice(0, 86).trim()}...`;
};

const resolveTimestamp = (value: string) => {
  const timestamp = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const extractHeadings = (tokens: Tokens.Generic[]): PostHeading[] =>
  tokens.flatMap((token) => {
    if (token.type === "heading") {
      return [
        {
          depth: token.depth,
          slug: "",
          text: token.text.trim(),
        },
      ];
    }

    if ("tokens" in token && Array.isArray(token.tokens)) {
      return extractHeadings(token.tokens as Tokens.Generic[]);
    }

    return [];
  });

const listPostFiles = async () => {
  const entries = await readdir(postsDirectory, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name);
};

const readPostFile = async (fileName: string): Promise<PostEntry> => {
  const filePath = path.join(postsDirectory, fileName);
  const source = await readFile(filePath, "utf8");
  const { content, data } = matter(source);
  const tokens = marked.lexer(content);
  const headings = extractHeadings(tokens as Tokens.Generic[]);
  const frontmatter = data as {
    create_time?: string | Date;
    name?: string;
    tags?: unknown;
    title?: string;
  };
  const title = headings.find((heading) => heading.depth === 1)?.text?.trim();
  const slug = frontmatter.name?.trim() || path.basename(fileName, ".md");
  const createTime = normalizeDateValue(frontmatter.create_time ?? "");
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const html = await marked.parse(content);

  return {
    slug,
    title: title || frontmatter.title || slug,
    excerpt: buildExcerpt(content),
    tags,
    createTime,
    formattedDate: createTime,
    headings: headings.filter((heading) => heading.depth >= 2),
    html,
  };
};

export const getAllPosts = async () => {
  const fileNames = await listPostFiles();
  const posts = await Promise.all(fileNames.map(readPostFile));

  return posts.sort(
    (left, right) => resolveTimestamp(right.createTime) - resolveTimestamp(left.createTime),
  );
};

export const getPostBySlug = async (slug: string) => {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
};
