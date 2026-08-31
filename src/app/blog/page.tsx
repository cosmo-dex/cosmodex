"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import RisingStars from "@/component/RisingStar";
import { BLOG_POSTS, BlogPost } from "@/data/blogData";
import { getAvatarUrl } from "@/lib/avatar";
import {
  Search,
  Sparkles,
  Clock,
  ArrowRight,
  BookOpen,
  X,
  Compass,
  Zap,
} from "lucide-react";

const CATEGORIES = ["All", "Engineering", "Tutorials", "Product", "News"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  }, []);

  const gridPosts = useMemo(() => {
    if (searchQuery || selectedCategory !== "All") {
      return filteredPosts;
    }
    return BLOG_POSTS.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, searchQuery, selectedCategory, featuredPost]);

  return (
    <main className="min-h-screen bg-[#05030a] text-white relative overflow-x-hidden font-sans">
      <Navbar />

      {/* ── Battle-style Deep Space Background FX with Falling / Shooting Stars (Matching Course List Page) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(124,58,237,0.22)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(232,115,195,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(141,55,214,0.08)_0%,transparent_70%)]" />

        {/* Dashboard Shooting / Falling Stars Animations */}
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ width: "150px", rotate: -35, top: "10%", right: "-10%" }}
          animate={{ x: [0, -1200], y: [0, 800], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#00FFE9] to-transparent shadow-[0_0_10px_rgba(0,255,233,0.8)]"
          style={{ width: "120px", rotate: -35, top: "35%", right: "-5%" }}
          animate={{ x: [0, -1100], y: [0, 750], opacity: [0, 0.8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 7, ease: "linear" }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-[#E873C3] to-transparent shadow-[0_0_10px_rgba(232,115,195,0.9)]"
          style={{ width: "180px", rotate: -35, top: "-5%", right: "25%" }}
          animate={{ x: [0, -1400], y: [0, 950], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 10, ease: "linear" }}
        />
        <motion.div
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.9)]"
          style={{ width: "160px", rotate: -35, top: "60%", right: "-10%" }}
          animate={{ x: [0, -1300], y: [0, 850], opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 6, ease: "linear" }}
        />
        <RisingStars />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 pt-28 pb-24 px-4 sm:px-8 max-w-[1140px] mx-auto space-y-12">
        {/* ── Main Page Heading Section (Matching Course List Page Header) ── */}
        {/* ── Main Page Heading Section (Big Centered Half-Gradient Heading like Course Page) ── */}
        <div className="text-center border-b border-white/10 pb-8 space-y-3">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-wider text-white filter drop-shadow-[0_0_30px_rgba(232,115,195,0.4)]">
            Cosmo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6]">Blog</span>
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] font-sans leading-relaxed max-w-xl mx-auto">
            Deep dives into real-time system design, database performance, learning mechanics, and platform updates.
          </p>
        </div>

        {/* ── Featured Hero Article (Matching Course Card Aesthetic) ── */}
        {!searchQuery && selectedCategory === "All" && featuredPost && (
          <section className="space-y-3">
            <span className="text-[11px] font-sans font-bold tracking-widest text-[#38bdf8] uppercase block">
              FEATURED DISPATCH
            </span>

            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="group relative flex flex-col lg:flex-row overflow-hidden bg-[#090e1a] border border-white/80 border-l-3 border-b-3 rounded-[8px] cursor-pointer transition-colors duration-150 shadow-xl"
              >
                <div className="relative w-full lg:w-3/5 h-64 sm:h-80 bg-[#0b1220] border-b lg:border-b-0 lg:border-r border-[#1b263b] overflow-hidden">
                  <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-transparent to-transparent opacity-60" />
                  
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#131d31] border border-[#22314e] text-[11px] font-sans font-bold tracking-wider text-[#38bdf8] uppercase">
                    {featuredPost.category}
                  </span>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-[#090e1a]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-sans text-[#64748b]">
                      <Clock size={13} className="text-[#38bdf8]" />
                      <span>{featuredPost.readTime}</span>
                      <span>•</span>
                      <span>{featuredPost.publishedAt}</span>
                    </div>

                    <h2 className="text-2xl font-bold font-sans text-white group-hover:text-[#38bdf8] transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>

                    <p className="text-sm text-[#94a3b8] font-sans leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  {/* Author Avatar Badge */}
                  <div className="pt-6 border-t border-[#1b263b] flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#38bdf8]/40 bg-[#131d31]">
                        <Image
                          src={getAvatarUrl(featuredPost.author.avatar)}
                          alt={featuredPost.author.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-sans">
                          {featuredPost.author.name}
                        </p>
                        <p className="text-[11px] text-[#64748b] font-sans">
                          {featuredPost.author.role}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#38bdf8] group-hover:translate-x-1 transition-transform">
                      Read Dispatch <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </section>
        )}

        {/* ── Article Grid Section (With Search & Category Controls Right Above Cards) ── */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1b263b] pb-4 gap-4">
            <h3 className="text-lg font-bold font-sans text-white flex items-center gap-2">
              <BookOpen size={18} className="text-[#38bdf8]" />
              <span>
                {searchQuery
                  ? `Search Results (${filteredPosts.length})`
                  : selectedCategory !== "All"
                  ? `${selectedCategory} Articles (${filteredPosts.length})`
                  : "All Articles"}
              </span>
            </h3>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-8 py-2 rounded-[8px] bg-[#090e1a] border border-[#1b263b] text-white text-xs font-sans placeholder-[#64748b] focus:outline-none focus:border-[#38bdf8] transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills Above Cards */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#38bdf8] text-[#090e1a] shadow-md shadow-cyan-500/20"
                      : "bg-[#090e1a] text-[#94a3b8] hover:bg-[#131d31] hover:text-white border border-[#1b263b]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {gridPosts.length === 0 ? (
            <div className="text-center py-16 bg-[#090e1a] rounded-[8px] border border-[#1b263b] space-y-3">
              <Compass size={40} className="mx-auto text-[#64748b]" />
              <h4 className="text-base font-bold text-white font-sans">No Articles Found</h4>
              <p className="text-xs text-[#94a3b8] max-w-xs mx-auto font-sans">
                Try searching for different keywords or select another category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {gridPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <Link href={`/blog/${post.slug}`} className="block group h-full">
                      {/* Exact CourseCard Styling */}
                      <article className="group relative flex flex-col h-full overflow-hidden bg-[#090e1a] border border-white/80 border-l-3 border-b-3 rounded-[8px] cursor-pointer transition-colors duration-150 shadow-md">
                        {/* Highlight Overlay */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30" />

                        {/* Banner Image */}
                        <div className="relative w-full h-44 overflow-hidden bg-[#0b1220] border-b border-[#1b263b]">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-transparent to-transparent opacity-50" />

                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#131d31] border border-[#22314e] text-[10px] font-sans font-bold tracking-wider text-[#38bdf8] uppercase">
                            {post.category}
                          </span>
                        </div>

                        {/* Content Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between bg-[#090e1a]">
                          <div>
                            <div className="flex items-center gap-2 text-[11px] font-sans text-[#64748b] mb-2">
                              <Clock size={12} className="text-[#38bdf8]" />
                              <span>{post.readTime}</span>
                              <span>•</span>
                              <span>{post.publishedAt}</span>
                            </div>

                            <h4 className="text-base font-bold text-white font-sans mb-2 group-hover:text-[#38bdf8] transition-colors leading-snug line-clamp-2">
                              {post.title}
                            </h4>

                            <p className="text-xs text-[#94a3b8] font-sans leading-relaxed line-clamp-3 mb-4">
                              {post.excerpt}
                            </p>
                          </div>

                          {/* Author Avatar Footer */}
                          <div className="pt-3 border-t border-[#1b263b] flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#38bdf8]/40 bg-[#131d31]">
                                <Image
                                  src={getAvatarUrl(post.author.avatar)}
                                  alt={post.author.name}
                                  fill
                                  sizes="28px"
                                  className="object-cover"
                                />
                              </div>
                              <span className="text-xs font-sans font-bold text-white">
                                {post.author.name}
                              </span>
                            </div>

                            <ArrowRight
                              size={14}
                              className="text-[#38bdf8] group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
