import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cosmodex-theta.vercel.app';
  const currentDate = new Date();

  // Primary public routes and special AI / documentation discovery routes
  const routes = [
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

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}
