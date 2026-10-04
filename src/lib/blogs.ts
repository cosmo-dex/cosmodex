// COST OPTIMIZATION: Database calls commented out, using static data
// import prisma from '@/lib/prisma';

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

// STATIC DATA for cost optimization - replace with database when needed
const STATIC_BLOG_POSTS: BlogPostItem[] = [
  {
    id: '1',
    slug: 'introducing-cosmodex-2024',
    title: 'Introducing CosmoDex: The Future of Coding Education',
    excerpt: 'Discover how CosmoDex is revolutionizing coding education with gamified learning, real-time battles, and an immersive space-themed experience.',
    content: `# Welcome to the Future of Coding Education

CosmoDex represents a paradigm shift in how we approach programming education. By combining gamification, real-time competition, and an immersive space-themed experience, we're making coding more engaging and effective than ever before.

## Why CosmoDex?

Traditional coding education often lacks engagement and real-world application. CosmoDex addresses these challenges by:

- **Gamified Learning**: Progress through space stations, earn XP, and unlock achievements
- **Real-time Battles**: Test your skills against other developers in live coding challenges  
- **Comprehensive Curriculum**: From Python basics to advanced algorithms
- **Community-Driven**: Learn alongside a community of passionate developers

## What's Coming Next

We're constantly evolving our platform with new features:

- Advanced AI-powered code review
- Mobile learning experiences
- Enterprise training programs
- Global coding tournaments

Join us on this journey to transform coding education for the digital age.`,
    category: 'Product',
    author: {
      name: 'CosmoDex Team',
      role: 'Product Team',
      avatar: '/images/avatars/nebula.webp'
    },
    coverImage: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?q=80&w=1200&auto=format&fit=crop',
    readTime: '5 min read',
    publishedAt: new Date('2024-01-15').toISOString(),
    featured: true,
    tags: ['Product', 'Launch', 'Education', 'Gaming'],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    slug: 'mastering-python-fundamentals',
    title: 'Mastering Python Fundamentals Through Space Adventures',
    excerpt: 'Learn Python programming fundamentals through our immersive space-themed curriculum designed for beginners and intermediate developers.',
    content: `# Python Fundamentals in the Cosmos

Python is one of the most popular programming languages, and for good reason. Its clean syntax and powerful capabilities make it perfect for beginners and experts alike.

## Our Approach to Python Education

At CosmoDex, we teach Python through:

**Interactive Stations**: Each concept is presented as a space station to explore
**Hands-on Labs**: Practice coding with real-time feedback
**Progressive Challenges**: Build complexity as you advance through the galaxy

## Key Topics Covered

- Variables and Data Types
- Control Flow and Loops  
- Functions and Modules
- Object-Oriented Programming
- File I/O and Error Handling
- APIs and Web Development

Start your Python journey today and code your way through the cosmos!`,
    category: 'Tutorials',
    author: {
      name: 'Alex Chen',
      role: 'Lead Instructor',
      avatar: '/images/avatars/stellar.webp'
    },
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
    readTime: '8 min read',
    publishedAt: new Date('2024-01-10').toISOString(),
    featured: false,
    tags: ['Python', 'Tutorial', 'Beginner', 'Programming'],
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '3',
    slug: 'battle-arena-strategies',
    title: 'Advanced Strategies for Coding Battle Arena',
    excerpt: 'Master the art of competitive programming with our guide to battle arena strategies, algorithm optimization, and real-time problem solving.',
    content: `# Dominating the Battle Arena

The Battle Arena is where coding skills meet competitive strategy. Success requires more than just knowing how to code - you need to think fast, optimize efficiently, and stay calm under pressure.

## Essential Strategies

**Time Management**: Allocate your time wisely between understanding, coding, and testing
**Algorithm Selection**: Choose the right algorithm for the problem constraints
**Code Optimization**: Write clean, efficient code that handles edge cases
**Testing Approach**: Develop a systematic approach to validating your solutions

## Common Pitfalls to Avoid

- Rushing through problem analysis
- Not considering time/space complexity
- Ignoring edge cases and boundary conditions
- Over-optimizing before getting a working solution

## Practice Makes Perfect

The best way to improve is through consistent practice. Use our training modules to sharpen your skills before entering live battles.

Ready to climb the leaderboard? Your next victory awaits!`,
    category: 'Engineering',
    author: {
      name: 'Maria Rodriguez',
      role: 'Competitive Programming Expert',
      avatar: '/images/avatars/cosmic.webp'
    },
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2e88?q=80&w=1200&auto=format&fit=crop',
    readTime: '6 min read',
    publishedAt: new Date('2024-01-05').toISOString(),
    featured: false,
    tags: ['Battle Arena', 'Strategy', 'Competitive Programming', 'Tips'],
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-05').toISOString(),
  }
];

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
  // COST OPTIMIZATION: Commented out database table creation
  /*
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
  */
}

export async function getAllBlogs(): Promise<BlogPostItem[]> {
  // COST OPTIMIZATION: Return static data instead of database query
  return STATIC_BLOG_POSTS;
  
  /*
  // DATABASE VERSION - Uncomment to reactivate
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
  */
}

export async function getBlogBySlug(slug: string): Promise<BlogPostItem | null> {
  // COST OPTIMIZATION: Return static data instead of database query
  const post = STATIC_BLOG_POSTS.find(p => p.slug === slug);
  return post || null;
  
  /*
  // DATABASE VERSION - Uncomment to reactivate
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
  */
}
