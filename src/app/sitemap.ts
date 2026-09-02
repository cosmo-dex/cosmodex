import { MetadataRoute } from 'next';
import { getAllBlogs } from '@/lib/blogs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cosmodex.in';
  const currentDate = new Date();

  // Primary public routes and special AI / documentation discovery routes
  const staticRoutes = [
    { path: '', priority: 1.0, changefreq: 'daily' as const },
    { path: '/learn', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/battle', priority: 0.9, changefreq: 'weekly' as const },
    { path: '/leaderboard', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/events', priority: 0.8, changefreq: 'weekly' as const },
    { path: '/blog', priority: 0.9, changefreq: 'daily' as const },
    { path: '/onboarding', priority: 0.8, changefreq: 'monthly' as const },
    { path: '/llms.txt', priority: 0.7, changefreq: 'weekly' as const },
    { path: '/llms-full.txt', priority: 0.7, changefreq: 'weekly' as const },
  ];

  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));

  try {
    const blogs = await getAllBlogs();
    const blogSitemap = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.publishedAt ? new Date(blog.publishedAt) : currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticSitemap, ...blogSitemap];
  } catch (err) {
    console.error('Error generating dynamic blog sitemap:', err);
    return staticSitemap;
  }
}
