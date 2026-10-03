import { getAllBlogs } from "@/lib/blogs";
import BlogPageClient from "./BlogPageClient";

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getAllBlogs();
  return <BlogPageClient initialPosts={posts} />;
}
