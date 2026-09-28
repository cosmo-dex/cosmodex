"use client";

import { useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/landing/Footer";
import { motion, AnimatePresence } from "framer-motion";
import CourseCard, { CourseData } from "@/components/learn/CourseCard";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import RisingStars from "@/components/RisingStar";

// ── 1. SVG Pixel Art Banners ──
const PythonPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="pythonSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="60%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#bae6fd" />
      </linearGradient>
      <linearGradient id="snakeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#pythonSky)" />
    <rect x="30" y="20" width="50" height="12" fill="#ffffff" opacity="0.9" rx="2" />
    <rect x="40" y="14" width="30" height="12" fill="#ffffff" opacity="0.9" rx="2" />
    <rect x="220" y="30" width="70" height="14" fill="#ffffff" opacity="0.8" rx="2" />
    <rect x="240" y="22" width="40" height="14" fill="#ffffff" opacity="0.8" rx="2" />
    <path d="M0,130 L60,80 L120,130 L190,70 L260,130 L340,65 L400,130 L400,200 L0,200 Z" fill="#22c55e" opacity="0.6" />
    <rect x="70" y="35" width="45" height="12" fill="#4ade80" rx="3" />
    <rect x="75" y="47" width="35" height="8" fill="#15803d" rx="2" />
    <rect x="260" y="40" width="55" height="14" fill="#4ade80" rx="3" />
    <rect x="268" y="54" width="40" height="8" fill="#15803d" rx="2" />
    <path d="M-20,140 Q80,110 180,140 T380,130 T420,160 L420,200 L-20,200 Z" fill="#16a34a" />
    <path
      d="M140,160 Q130,100 170,80 Q210,60 220,110 Q230,160 180,170 Q140,175 140,120 Q140,80 180,75 Q210,75 220,100"
      fill="none"
      stroke="url(#snakeGrad)"
      strokeWidth="22"
      strokeLinecap="round"
    />
    <circle cx="222" cy="100" r="3" fill="#ef4444" />
    <rect x="45" y="100" width="8" height="50" fill="#854d0e" rx="1" />
    <circle cx="35" cy="98" r="14" fill="#15803d" />
    <circle cx="60" cy="98" r="14" fill="#16a34a" />
    <circle cx="48" cy="88" r="16" fill="#22c55e" />
    <rect x="330" y="95" width="10" height="60" fill="#854d0e" rx="1" />
    <circle cx="318" cy="90" r="16" fill="#15803d" />
    <circle cx="348" cy="90" r="16" fill="#16a34a" />
    <circle cx="334" cy="78" r="18" fill="#22c55e" />
    <rect x="0" y="180" width="400" height="20" fill="#14532d" />
  </svg>
);

const IntermediatePythonPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="interSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#interSky)" />
    <polygon points="40,110 110,40 180,110" fill="#4338ca" />
    <polygon points="110,40 125,55 110,65 95,55" fill="#ffffff" />
    <polygon points="140,110 230,25 320,110" fill="#3730a3" />
    <polygon points="230,25 250,45 230,60 210,45" fill="#ffffff" />
    <polygon points="280,110 340,55 400,110" fill="#312e81" />
    <rect x="0" y="110" width="400" height="90" fill="url(#waterGrad)" />
    <polygon points="140,110 230,175 320,110" fill="#4338ca" opacity="0.25" />
  </svg>
);

const NumPyPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="numpySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#090514" />
        <stop offset="40%" stopColor="#2e1065" />
        <stop offset="80%" stopColor="#701a75" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#numpySky)" />
    <circle cx="200" cy="140" r="50" fill="#f43f5e" opacity="0.9" />
    <polygon points="0,150 50,120 100,160 160,110 220,165 300,105 360,150 400,125 400,200 0,200" fill="#090514" />
  </svg>
);

const HTMLPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="htmlSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="50%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fdba74" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#htmlSky)" />
    <circle cx="200" cy="120" r="45" fill="#fff7ed" />
    <path d="M0,140 Q100,125 200,140 T400,135 L400,200 L0,200 Z" fill="#9a3412" />
  </svg>
);

const CSSPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="cssSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="60%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#cssSky)" />
    <polygon points="0,130 80,70 160,130 240,60 320,130 400,80 400,200 0,200" fill="#0369a1" />
  </svg>
);

const JSPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="jsSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ca8a04" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#jsSky)" />
    <rect x="70" y="50" width="55" height="150" fill="#a16207" />
    <rect x="200" y="40" width="60" height="160" fill="#a16207" />
  </svg>
);

const JavaPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="javaSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7c2d12" />
        <stop offset="60%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#ffedd5" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#javaSky)" />
    <polygon points="50,140 130,50 210,140" fill="#9a3412" />
    <polygon points="180,140 270,40 360,140" fill="#7c2d12" />
  </svg>
);

const CppPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="cppSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="60%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#d1fae5" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#cppSky)" />
    <polygon points="0,130 90,60 180,130 270,40 360,130 400,80 400,200 0,200" fill="#065f46" />
  </svg>
);

// ── 9. SVG Pixel Art Banner for React (Atomic Cyan Orbit) ──
const ReactPixelBanner = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="reactSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#082f49" />
        <stop offset="50%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <rect width="400" height="200" fill="url(#reactSky)" />
    <circle cx="200" cy="100" r="18" fill="#38bdf8" />
    <ellipse cx="200" cy="100" rx="75" ry="24" fill="none" stroke="#7dd3fc" strokeWidth="4" transform="rotate(-30 200 100)" />
    <ellipse cx="200" cy="100" rx="75" ry="24" fill="none" stroke="#7dd3fc" strokeWidth="4" transform="rotate(30 200 100)" />
    <ellipse cx="200" cy="100" rx="75" ry="24" fill="none" stroke="#7dd3fc" strokeWidth="4" transform="rotate(90 200 100)" />
    <polygon points="0,160 100,130 200,170 300,135 400,165 400,200 0,200" fill="#0c4a6e" />
  </svg>
);

// ── TRACK DATASETS ──
const WEBDEV_COURSES: CourseData[] = [
  {
    id: "web-1",
    courseNumber: "COURSE 1",
    title: "HTML",
    description:
      "Learn the basic building blocks of the web and structure your first web pages with semantic tags.",
    level: "BEGINNER",
    thumbnail: "",
    pixelArtBanner: <HTMLPixelBanner />,
    isLive: true,
  },
  {
    id: "web-2",
    courseNumber: "COURSE 2",
    title: "CSS",
    description:
      "Style your web pages with vibrant colors, modern layouts, flexbox, grid, and smooth animations.",
    level: "BEGINNER",
    thumbnail: "",
    pixelArtBanner: <CSSPixelBanner />,
    isLive: false,
  },
  {
    id: "web-3",
    courseNumber: "COURSE 3",
    title: "JavaScript",
    description:
      "Add interactive behavior, dynamic DOM manipulation, events, and logic to modern web applications.",
    level: "INTERMEDIATE",
    thumbnail: "",
    pixelArtBanner: <JSPixelBanner />,
    isLive: false,
  },
  {
    id: "web-4",
    courseNumber: "COURSE 4",
    title: "React",
    description:
      "Build modern, fast, component-driven user interfaces and dynamic single-page web applications with React.",
    level: "INTERMEDIATE",
    thumbnail: "",
    pixelArtBanner: <ReactPixelBanner />,
    isLive: false,
  },
];

const PYTHON_COURSES: CourseData[] = [
  {
    id: "py-1",
    courseNumber: "COURSE 1",
    title: "Python",
    description:
      "Learn programming fundamentals such as variables, control flow, and loops with the most versatile language.",
    level: "BEGINNER",
    thumbnail: "",
    pixelArtBanner: <PythonPixelBanner />,
    isLive: true,
  },
  {
    id: "py-2",
    courseNumber: "COURSE 2",
    title: "Intermediate Python",
    description:
      "Begin learning intermediate Python with data structures, object-oriented programming, and modules.",
    level: "INTERMEDIATE",
    thumbnail: "",
    pixelArtBanner: <IntermediatePythonPixelBanner />,
    isLive: false,
  },
  {
    id: "py-3",
    courseNumber: "COURSE 3",
    title: "NumPy",
    description:
      "Learn the fundamentals of data manipulation using NumPy! Learn to code with arrays and math vectors.",
    level: "INTERMEDIATE",
    thumbnail: "",
    pixelArtBanner: <NumPyPixelBanner />,
    isLive: false,
  },
];

const OOP_COURSES: CourseData[] = [
  {
    id: "oop-1",
    courseNumber: "COURSE 1",
    title: "Java",
    description:
      "Learn core Java concepts, object-oriented programming principles, classes, and robust software design.",
    level: "BEGINNER",
    thumbnail: "",
    pixelArtBanner: <JavaPixelBanner />,
    isLive: false,
  },
  {
    id: "oop-2",
    courseNumber: "COURSE 2",
    title: "C++",
    description:
      "Master high-performance programming, low-level memory management, pointers, and data structures.",
    level: "INTERMEDIATE",
    thumbnail: "",
    pixelArtBanner: <CppPixelBanner />,
    isLive: false,
  },
];

const ALL_COURSES: CourseData[] = [
  ...WEBDEV_COURSES,
  ...PYTHON_COURSES,
  ...OOP_COURSES,
];

// ── REUSABLE TRACK SECTION WITH ARROW PAGINATION BUTTONS IN FRONT OF HEADING ──
interface TrackSectionProps {
  id?: string;
  title: string;
  subtext: string;
  courses: CourseData[];
  itemsPerPage?: number;
}

function TrackSection({
  id,
  title,
  subtext,
  courses,
  itemsPerPage = 3,
}: TrackSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const visibleCourses = courses.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <section id={id} className="space-y-6 scroll-mt-28">
      {/* Header Row: Title & Subtext on Left, Arrow Navigation Buttons directly on Right */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div className="space-y-1 text-left">
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] font-sans">
            {subtext}
          </p>
        </div>

        {/* Left & Right Arrow Pagination Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`p-2.5 rounded-xl border transition-all ${currentPage === 0
              ? "bg-[#131d31]/40 border-[#22314e]/30 text-white/20 cursor-not-allowed"
              : "bg-[#131d31] border-[#22314e] text-white hover:border-[#E873C3] hover:text-[#E873C3] hover:shadow-[0_0_12px_rgba(232,115,195,0.3)] active:scale-95"
              }`}
            aria-label="Previous Courses"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-mono text-[#94a3b8] px-1 hidden sm:inline">
            {currentPage + 1}/{totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className={`p-2.5 rounded-xl border transition-all ${currentPage >= totalPages - 1
              ? "bg-[#131d31]/40 border-[#22314e]/30 text-white/20 cursor-not-allowed"
              : "bg-[#131d31] border-[#22314e] text-white hover:border-[#E873C3] hover:text-[#E873C3] hover:shadow-[0_0_12px_rgba(232,115,195,0.3)] active:scale-95"
              }`}
            aria-label="Next Courses"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-2"
        >
          {visibleCourses.map((course, idx) => (
            <CourseCard key={course.id} course={course} index={idx} />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [allCoursesPage, setAllCoursesPage] = useState(0);

  const categories = ["ALL", "WEB DEV", "PYTHON", "JAVA & C++"];
  const itemsPerPageAll = 6;

  const filteredCourses = ALL_COURSES.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.level.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === "ALL") return matchesSearch;
    if (selectedCategory === "WEB DEV")
      return matchesSearch && ["web-1", "web-2", "web-3", "web-4"].includes(course.id);
    if (selectedCategory === "PYTHON")
      return matchesSearch && ["py-1", "py-2", "py-3"].includes(course.id);
    if (selectedCategory === "JAVA & C++")
      return matchesSearch && ["oop-1", "oop-2"].includes(course.id);
    return matchesSearch;
  });

  const totalPagesAll = Math.ceil(filteredCourses.length / itemsPerPageAll);
  const visibleAllCourses = filteredCourses.slice(
    allCoursesPage * itemsPerPageAll,
    (allCoursesPage + 1) * itemsPerPageAll
  );

  return (
    <main className="min-h-screen bg-[#05030a] text-white relative overflow-x-hidden font-sans">
      <Navbar />

      {/* ── Battle-style Deep Space Background FX with Falling / Shooting Stars ── */}
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

      {/* ── Top Edge-to-Edge Full Width Hero Banner ── */}
      <div className="relative z-10 pt-16 w-full mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full h-80 sm:h-[460px] lg:h-[520px] overflow-hidden border-b border-purple-500/20 shadow-[0_20px_60px_rgba(15,3,35,0.9)] bg-[#070312]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/space-hero-banner.webp"
            alt="CosmoDeX Space Banner"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
          />
          <div className="absolute inset-0 bg-black/55 pointer-events-none z-10" />

          <div className="relative z-20 h-full w-full flex flex-col items-center justify-center text-center px-4">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-wider text-white filter drop-shadow-[0_0_30px_rgba(232,115,195,0.4)]"
            >
              Cosmo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E873C3] via-[#C453D6] to-[#8D37D6]">DeX</span>
            </motion.h1>
            <p className="text-xs sm:text-sm md:text-base font-sans text-white/80 tracking-widest uppercase mt-3 font-semibold drop-shadow-md">
              Coding Expedition Platform
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 pb-20 px-4 sm:px-8 max-w-[1140px] mx-auto space-y-16">
        {/* ── Main Page Heading Section ── */}
        <div className="text-left border-b border-white/10 pb-6">
          <h1 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight mb-2">
            Learn with CosmoDeX
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] font-sans leading-relaxed">
            Explore interactive courses and master programming step by step.
          </p>
        </div>

        {/* ── TRACK 1: WEB DEVELOPMENT (With Arrow Pagination) ── */}
        <TrackSection
          id="webdev"
          title="Web Development"
          subtext="Master the foundational technologies of the web with HTML, CSS, and JavaScript."
          courses={WEBDEV_COURSES}
        />

        {/* ── TRACK 2: PYTHON (With Arrow Pagination) ── */}
        <TrackSection
          id="python"
          title="Python"
          subtext="Advance your journey with python"
          courses={PYTHON_COURSES}
        />

        {/* ── TRACK 3: JAVA & C++ (With Arrow Pagination) ── */}
        <div id="cpp" className="scroll-mt-28">
          <div id="java" className="scroll-mt-28">
            <TrackSection
              id="java-cpp"
              title="Java & C++"
              subtext="Master object-oriented programming principles and low-level systems programming."
              courses={OOP_COURSES}
            />
          </div>
        </div>

        {/* ── SECTION 4: SEARCH & EXPLORE ALL COURSES ── */}
        <section className="space-y-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
                Explore All Courses
              </h2>
              <p className="text-xs sm:text-sm text-[#94a3b8] font-sans leading-relaxed">
                Search and filter through our complete library of interactive programming courses.
              </p>
            </div>

            {/* Left & Right Pagination Arrow Controls in Front of Heading */}
            {totalPagesAll > 1 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setAllCoursesPage((prev) => Math.max(0, prev - 1))}
                  disabled={allCoursesPage === 0}
                  className={`p-2.5 rounded-xl border transition-all ${allCoursesPage === 0
                      ? "bg-[#131d31]/40 border-[#22314e]/30 text-white/20 cursor-not-allowed"
                      : "bg-[#131d31] border-[#22314e] text-white hover:border-[#E873C3] hover:text-[#E873C3] hover:shadow-[0_0_12px_rgba(232,115,195,0.3)] active:scale-95"
                    }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-mono text-[#94a3b8] px-1 hidden sm:inline">
                  {allCoursesPage + 1}/{totalPagesAll}
                </span>
                <button
                  onClick={() => setAllCoursesPage((prev) => Math.min(totalPagesAll - 1, prev + 1))}
                  disabled={allCoursesPage >= totalPagesAll - 1}
                  className={`p-2.5 rounded-xl border transition-all ${allCoursesPage >= totalPagesAll - 1
                      ? "bg-[#131d31]/40 border-[#22314e]/30 text-white/20 cursor-not-allowed"
                      : "bg-[#131d31] border-[#22314e] text-white hover:border-[#E873C3] hover:text-[#E873C3] hover:shadow-[0_0_12px_rgba(232,115,195,0.3)] active:scale-95"
                    }`}
                  aria-label="Next Page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Search Controls Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#090e1a] p-4 rounded-xl border border-[#1b263b]">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setAllCoursesPage(0);
                }}
                placeholder="Search courses (e.g. Python, HTML, flexbox)..."
                className="w-full bg-[#131d31] border border-[#22314e] focus:border-[#E873C3] rounded-lg pl-10 pr-9 py-2.5 text-sm text-white placeholder-[#64748b] outline-none transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setAllCoursesPage(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setAllCoursesPage(0);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all border ${selectedCategory === cat
                      ? "bg-[#E873C3] text-black border-[#E873C3] shadow-[0_0_15px_rgba(232,115,195,0.4)]"
                      : "bg-[#131d31] text-[#94a3b8] border-[#22314e] hover:border-white/40 hover:text-white"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid or Empty State */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-2">
              {visibleAllCourses.map((course, idx) => (
                <CourseCard key={`all-${course.id}`} course={course} index={idx} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#090e1a] rounded-2xl border border-[#1b263b] space-y-4">
              <p className="text-lg font-sans text-white/80">
                No courses found matching &quot;<span className="text-[#E873C3]">{searchQuery}</span>&quot;
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                  setAllCoursesPage(0);
                }}
                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition-all"
              >
                Clear Search & Filters
              </button>
              </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
