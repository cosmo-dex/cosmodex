/**
 * ─── Learn Lessons ────────────────────────────────────────────────────────────
 *
 * Each lesson powers an interactive code-editor page at /learn/<lessonId>.
 *
 * Two kinds of lessons are supported:
 *
 *   kind: "canvas"   → a single JavaScript file that paints on a sandboxed
 *                      640×400 canvas. Two hooks are available:
 *                        setup(canvas, ctx) → runs once
 *                        draw(canvas, ctx)  → runs every frame (optional)
 *
 *   kind: "webpage"  → a full HTML/CSS/JS document rendered in the sandboxed
 *                      preview. The editor exposes one tab per file and the
 *                      preview combines them into a real web page.
 */

export type LessonKind = "canvas" | "webpage";

export interface LessonFile {
  /** File name shown on the editor tab, e.g. "main.js", "index.html" */
  name: string;
  /** Monaco language id for this file */
  language: string;
  /** Starter content */
  content: string;
}

export interface LessonStep {
  title: string;
  body: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  courseTitle: string;
  track: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  steps: LessonStep[];
  tips: string[];
  expected: string;
  kind: LessonKind;
  files: LessonFile[];
}

const CANVAS_COMMENT = `// This file paints on a sandboxed 640×400 canvas.
// Use the two hooks the lesson gives you:
//   setup(canvas, ctx) → runs once
//   draw(canvas, ctx)  → runs every frame (optional)`;

export const LESSONS: Lesson[] = [
  {
    id: "01-your-first-canvas",
    courseId: "web-1",
    courseTitle: "Web Development",
    track: "WEB DEV",
    number: 1,
    title: "Your First Canvas",
    subtitle: "Draw your first shape on an HTML5 canvas",
    description:
      "The HTML5 <canvas> element is a blank digital canvas you can paint on with JavaScript. In this lesson you'll grab the 2D drawing context and fill in your very first rectangle.",
    objectives: [
      "Understand what an HTML5 canvas is and how to get its 2D context",
      "Set a fill color with the fillStyle property",
      "Draw rectangles with fillRect(x, y, width, height)",
    ],
    steps: [
      {
        title: "Pick a color",
        body: "Assign a color string to ctx.fillStyle — anything CSS understands works: \"#E873C3\", \"hotpink\", \"rgba(...)\", etc.",
      },
      {
        title: "Draw a rectangle",
        body: "Call ctx.fillRect(x, y, width, height). The canvas is 640×400, so try starting at (50, 50) with a size of 200×120.",
      },
      {
        title: "Run it",
        body: "Hit the Run button (or press Ctrl/Cmd + Enter) and watch the preview panel paint your shape.",
      },
    ],
    tips: [
      "Coordinates start at the top-left corner: x grows right, y grows down.",
      "The setup(canvas, ctx) hook runs once — perfect for static drawings.",
      "Change the color and re-run to see the rectangle repaint instantly.",
    ],
    expected: "A solid pink rectangle painted in the middle-left of the preview.",
    kind: "canvas",
    files: [
      {
        name: "main.js",
        language: "javascript",
        content: `${CANVAS_COMMENT}

function setup(canvas, ctx) {
  // 1. Pick a color
  ctx.fillStyle = "#E873C3";

  // 2. Draw a rectangle (x, y, width, height)
  ctx.fillRect(50, 50, 200, 120);
}
`,
      },
    ],
  },
  {
    id: "02-drawing-shapes",
    courseId: "web-1",
    courseTitle: "Web Development",
    track: "WEB DEV",
    number: 2,
    title: "Drawing Shapes",
    subtitle: "Circles, lines and paths on the canvas",
    description:
      "Rectangles are just the start. In this lesson you'll draw circles with arcs and connect points with lines to build a tiny sunset scene.",
    objectives: [
      "Draw circles with ctx.arc() and ctx.fill()",
      "Stroke lines with ctx.beginPath() and ctx.stroke()",
      "Layer shapes to compose a small scene",
    ],
    steps: [
      {
        title: "Draw the sun",
        body: "Use ctx.beginPath(), then ctx.arc(cx, cy, radius, 0, Math.PI * 2) and finish with ctx.fill().",
      },
      {
        title: "Add a horizon line",
        body: "Stroke a line with ctx.moveTo(x1, y1) → ctx.lineTo(x2, y2) → ctx.stroke(). Pick a bright color for the strokeStyle.",
      },
      {
        title: "Keep it layered",
        body: "Draw the sky first, then the sun, then the horizon — later shapes paint on top of earlier ones.",
      },
    ],
    tips: [
      "Forget ctx.beginPath() before a new shape and you'll get unexpected connections between points.",
      "ctx.strokeStyle sets line color, ctx.lineWidth sets its thickness.",
      "arc() angles are measured in radians: 0 to Math.PI * 2 is a full circle.",
    ],
    expected: "A sun (filled circle) above a straight horizon line, with the sky behind them.",
    kind: "canvas",
    files: [
      {
        name: "main.js",
        language: "javascript",
        content: `${CANVAS_COMMENT}

function setup(canvas, ctx) {
  // Sky
  ctx.fillStyle = "#14102a";
  ctx.fillRect(0, 0, 640, 400);

  // Sun — a filled circle
  ctx.beginPath();
  ctx.arc(480, 130, 60, 0, Math.PI * 2);
  ctx.fillStyle = "#F5C842";
  ctx.fill();

  // Horizon line
  ctx.beginPath();
  ctx.moveTo(40, 260);
  ctx.lineTo(600, 260);
  ctx.strokeStyle = "#E873C3";
  ctx.lineWidth = 4;
  ctx.stroke();
}
`,
      },
    ],
  },
  {
    id: "03-colors-and-gradients",
    courseId: "web-1",
    courseTitle: "Web Development",
    track: "WEB DEV",
    number: 3,
    title: "Colors & Gradients",
    subtitle: "Blend colors with linear gradients",
    description:
      "Flat fills are nice, but gradients give drawings depth. You'll build a linear gradient with createLinearGradient() and paint it across the whole canvas.",
    objectives: [
      "Create gradients with ctx.createLinearGradient()",
      "Add color stops with addColorStop()",
      "Fill the full canvas with a smooth blend",
    ],
    steps: [
      {
        title: "Build the gradient",
        body: "ctx.createLinearGradient(x0, y0, x1, y1) defines a gradient that blends from point (x0, y0) to (x1, y1).",
      },
      {
        title: "Add color stops",
        body: "Each addColorStop(offset, color) pins a color at a position from 0 to 1 along the gradient.",
      },
      {
        title: "Fill the sky",
        body: "Assign the gradient to ctx.fillStyle, then fillRect over the entire canvas (0, 0, 640, 400).",
      },
    ],
    tips: [
      "Stops at 0 and 1 cover the full gradient; extra stops create richer bands of color.",
      "Try the CosmoDeX brand colors: #E873C3 → #C453D6 → #8D37D6.",
      "Add a second gradient for the ground to make a full cosmic scene.",
    ],
    expected: "The canvas filled with a smooth vertical blend between two or more colors.",
    kind: "canvas",
    files: [
      {
        name: "main.js",
        language: "javascript",
        content: `${CANVAS_COMMENT}

function setup(canvas, ctx) {
  // A vertical gradient from top (0) to bottom (400)
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, "#E873C3");
  sky.addColorStop(0.55, "#C453D6");
  sky.addColorStop(1, "#8D37D6");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 640, 400);

  // A little planet to show off the blend
  ctx.beginPath();
  ctx.arc(480, 120, 42, 0, Math.PI * 2);
  ctx.fillStyle = "#00FFE9";
  ctx.fill();
}
`,
      },
    ],
  },
  {
    id: "04-make-it-move",
    courseId: "web-1",
    courseTitle: "Web Development",
    track: "WEB DEV",
    number: 4,
    title: "Make It Move",
    subtitle: "Animate with requestAnimationFrame",
    description:
      "Static drawings are cool — animated ones are better. The preview supports a draw() hook that runs every frame, so you can build a bouncing ball with just a little math.",
    objectives: [
      "Use the draw(canvas, ctx) hook that runs every animation frame",
      "Track position in variables and update it each frame",
      "Bounce the ball off the canvas edges",
    ],
    steps: [
      {
        title: "Remember state between frames",
        body: "Declare position and velocity variables outside draw() so they survive from frame to frame.",
      },
      {
        title: "Clear, then draw",
        body: "Each frame starts by clearing the canvas with ctx.clearRect(0, 0, 640, 400), then you redraw the ball at its new position.",
      },
      {
        title: "Bounce off the edges",
        body: "When the ball hits an edge (x < 0 or x > 640 - radius), flip the velocity sign to send it back the other way.",
      },
    ],
    tips: [
      "Any variable you want to persist must live outside the draw() function.",
      "Negative velocity moves left/up; positive moves right/down.",
      "Slow down a jittery ball by multiplying velocity by 0.99 — a little damping goes a long way.",
    ],
    expected: "A glowing ball moving smoothly across the canvas and bouncing off all four edges.",
    kind: "canvas",
    files: [
      {
        name: "main.js",
        language: "javascript",
        content: `${CANVAS_COMMENT}

// State that survives between frames lives OUTSIDE draw()
let x = 90;
let y = 200;
let vx = 3.2;
let vy = 2.4;
const radius = 24;

function draw(canvas, ctx) {
  // Clear the previous frame
  ctx.clearRect(0, 0, 640, 400);

  // Bounce off the walls
  if (x - radius < 0 || x + radius > 640) vx = -vx;
  if (y - radius < 0 || y + radius > 400) vy = -vy;

  // Move
  x += vx;
  y += vy;

  // Paint the ball
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#00FFE9";
  ctx.fill();
}
`,
      },
    ],
  },
  {
    id: "05-your-first-webpage",
    courseId: "web-1",
    courseTitle: "Web Development",
    track: "WEB DEV",
    number: 5,
    title: "Your First Web Page",
    subtitle: "Structure, style and script a full page",
    description:
      "Time to leave the canvas behind. In this lesson you'll build a real web page from three files: index.html for structure, style.css for the look, and script.js for interactivity. The preview renders them together as one page.",
    objectives: [
      "Structure a page with semantic HTML: headings, paragraphs, buttons",
      "Style layout and colors with CSS",
      "Add interactivity with a DOM click handler",
    ],
    steps: [
      {
        title: "Build the structure",
        body: "In index.html, write the card markup — an avatar, a title, a short bio and a button. Give the button an id like launch-btn so JavaScript can find it.",
      },
      {
        title: "Make it pretty",
        body: "In style.css, center the card with flexbox, choose your colors, and give the button a glowing gradient so it begs to be clicked.",
      },
      {
        title: "Wire it up",
        body: "In script.js, grab the button with getElementById, listen for clicks with addEventListener, and update the page — plus a console.log for good measure.",
      },
    ],
    tips: [
      "Keep structure in HTML, styling in CSS, and behavior in JS — that separation is the core idea of the web.",
      "An id in your HTML is how JavaScript finds an element: getElementById(\"launch-btn\").",
      "display:flex with align-items:center and justify-content:center is the easiest way to center anything.",
    ],
    expected: "A glowing card with a Launch button — clicking it counts launches on the page and logs each one to the console.",
    kind: "webpage",
    files: [
      {
        name: "index.html",
        language: "html",
        content: `<!-- index.html — the structure of your page -->
<div class="card">
  <div class="avatar">🚀</div>
  <h1>Cosmo Cadet</h1>
  <p class="bio">Learning to build for the web, one expedition at a time.</p>
  <button id="launch-btn">Launch 🚀</button>
  <p id="launch-count" class="count">0 launches</p>
</div>
`,
      },
      {
        name: "style.css",
        language: "css",
        content: `/* style.css — the look of your page */
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #090214;
  font-family: "Fira Code", monospace;
}

.card {
  width: 320px;
  padding: 32px;
  text-align: center;
  background: #13111c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(217, 95, 209, 0.25);
}

.avatar {
  font-size: 56px;
}

h1 {
  margin: 12px 0 4px;
  color: #fff;
  letter-spacing: 0.04em;
}

.bio {
  color: #a9a8be;
  font-size: 13px;
}

button {
  margin-top: 16px;
  padding: 10px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #E873C3, #8D37D6);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  filter: brightness(1.15);
}

.count {
  margin-top: 12px;
  color: #f5c842;
  font-size: 12px;
}
`,
      },
      {
        name: "script.js",
        language: "javascript",
        content: `// script.js — the behavior of your page
const button = document.getElementById("launch-btn");
const countEl = document.getElementById("launch-count");

let launches = 0;

button.addEventListener("click", () => {
  launches += 1;
  countEl.textContent = launches + (launches === 1 ? " launch" : " launches");
  console.log("🚀 Liftoff #" + launches);
});
`,
      },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonIndex(id: string): number {
  return LESSONS.findIndex((l) => l.id === id);
}

export function getPrevLesson(id: string): Lesson | undefined {
  const idx = getLessonIndex(id);
  return idx > 0 ? LESSONS[idx - 1] : undefined;
}

export function getNextLesson(id: string): Lesson | undefined {
  const idx = getLessonIndex(id);
  return idx >= 0 && idx < LESSONS.length - 1 ? LESSONS[idx + 1] : undefined;
}
