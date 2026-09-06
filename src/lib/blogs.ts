import prisma from '@/lib/prisma';

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Engineering' | 'Product' | 'Tutorials' | 'News' | string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  coverImage: string;
  readTime: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface RawDbBlog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  cover_image: string;
  read_time: string;
  published_at: string;
  featured: boolean;
  tags: string[];
  created_at?: Date;
  updated_at?: Date;
}

export function getValidImageUrl(
  url?: string | null,
  fallback = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop'
): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function mapDbToBlogPost(row: RawDbBlog): BlogPostItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    author: {
      name: row.author_name,
      role: row.author_role,
      avatar: getValidImageUrl(row.author_avatar, '/images/avatars/nebula.webp'),
    },
    coverImage: getValidImageUrl(row.cover_image),
    readTime: row.read_time,
    publishedAt: row.published_at,
    featured: Boolean(row.featured),
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

let tableEnsured = false;

export async function ensureTableAndSeed() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Engineering',
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL,
        author_avatar TEXT NOT NULL,
        cover_image TEXT NOT NULL,
        read_time TEXT NOT NULL,
        published_at TEXT NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT false,
        tags TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    tableEnsured = true;
  } catch (err) {
    console.error('[blogs] ensureTable error:', err);
  }
}

export async function getAllBlogs(): Promise<BlogPostItem[]> {
  try {
    await ensureTableAndSeed();
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT * FROM blogs ORDER BY created_at DESC;'
    )) as RawDbBlog[];
    if (rows && rows.length > 0) {
      return rows.map(mapDbToBlogPost);
    }
  } catch (err) {
    console.error('[getAllBlogs] error:', err);
  }
  return [];
}

export async function getBlogBySlug(slug: string): Promise<BlogPostItem | null> {
  try {
    await ensureTableAndSeed();
    const rows = (await prisma.$queryRawUnsafe(
      'SELECT * FROM blogs WHERE slug = $1 LIMIT 1;',
      slug
    )) as RawDbBlog[];
    if (rows && rows.length > 0) {
      return mapDbToBlogPost(rows[0]);
    }
  } catch (err) {
    console.error('[getBlogBySlug] error:', err);
  }
  return null;
}
