import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for HTML course...');

  // 1. Seed Languages
  const htmlLang = await prisma.languages.upsert({
    where: { code: 'html' },
    update: {
      name: 'HTML',
      is_active: true,
      display_order: 1,
    },
    create: {
      code: 'html',
      name: 'HTML',
      icon_url: '/images/html.svg',
      is_active: true,
      display_order: 1,
    },
  });

  const pythonLang = await prisma.languages.upsert({
    where: { code: 'python' },
    update: {
      name: 'Python',
      is_active: true,
      display_order: 0,
    },
    create: {
      code: 'python',
      name: 'Python',
      icon_url: '/images/python.svg',
      is_active: true,
      display_order: 0,
    },
  });

  console.log('✅ Languages verified:', htmlLang.code, pythonLang.code);

  // 2. Comprehensive HTML Course Data
  const htmlModulesData = [
    {
      module_number: 1,
      title: 'HTML5 Architecture & Semantic Landmarks',
      description: 'Master document layout, DOCTYPE declarations, head metadata, and landmark elements (<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>) for SEO & AI parsing.',
      icon_svg: 'green-crater',
      topicTitle: 'HTML5 Architecture & Semantic Landmarks',
      theoryLessonId: 'ch-1',
      xpValue: 50,
      sections: [
        {
          heading: 'Modern Document Boilerplate, DOCTYPE & Meta Headers',
          content: [
            'Every modern web document must begin with the `<!DOCTYPE html>` declaration placed on line 1. This case-insensitive tag informs web browser rendering engines to operate in standard HTML5 mode rather than legacy quirks mode.',
            'The `<html>` root element encloses all document nodes and must declare the primary document language via the `lang` attribute (e.g. `<html lang="en">`). Screen readers and search engine indexing bots rely on this attribute to select appropriate text-to-speech voices and regional indexing strategies.',
            'Inside the `<head>` element, critical document metadata is defined before page rendering begins. `<meta charset="UTF-8">` guarantees support for international character sets, symbols, and emojis. The viewport configuration `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is mandatory for responsive design, instructing mobile browsers to map page width to device screen width at a 1:1 scale.',
            'Step 1: Always include `<!DOCTYPE html>` as the absolute first line of your markup file.',
            'Step 2: Add `<html lang="en">` with proper language codes to support global accessibility.',
            'Step 3: Define `<meta charset="UTF-8">` and the responsive viewport `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside `<head>`.',
          ],
          bulletPoints: [
            '`<!DOCTYPE html>` forces standards mode rendering across all modern browsers.',
            '`<html lang="en">` enables assistive technologies to synthesize accurate text-to-speech pronunciations.',
            'Viewport meta tag prevents unwanted mobile zoom scaling and enables media query responsiveness.',
            '`<title>` tags set the window title bar text and serve as the primary link header on search engine result pages (SERPs).',
          ],
        },
        {
          heading: 'Semantic Landmarks vs Generic Containers ("Div Soup")',
          content: [
            'In legacy web design, developers frequently built pages using generic `<div>` elements wrapped inside other `<div>` elements—a anti-pattern known as "Div Soup". This approach strips semantic meaning from document structure, rendering the page inaccessible to screen readers and difficult for web crawlers to analyze.',
            'HTML5 introduced dedicated landmark elements that specify the structural role of every container on the page:',
            '• `<header>`: Represents introductory content, site branding, logos, or primary hero banners.',
            '• `<nav>`: Designates major navigation blocks containing links to other pages or document sections.',
            '• `<main>`: Encloses the unique, central content of the document. Crucial Rule: A page MUST contain only ONE visible `<main>` landmark.',
            '• `<article>`: Encapsulates standalone, self-contained content intended for independent syndication (blog posts, news items, forum cards, user comments).',
            '• `<section>`: Groups logically related content under a specific heading subject.',
            '• `<aside>`: Encloses content tangentially related to the main article (sidebars, callout boxes, advertisements, author bios).',
            '• `<footer>`: Houses copyright disclaimers, legal links, author credits, and sitemap navigation.',
          ],
          bulletPoints: [
            'Landmarks enable screen reader users to jump directly to specific page regions using keyboard shortcuts.',
            'Search engine crawlers weigh text inside `<main>` and `<article>` tags higher than sidebar or footer text.',
            'Never replace semantic buttons or links with generic `<div onclick="...">` handlers.',
          ],
        },
        {
          heading: 'Document Outline & Accessibility Tree Architecture',
          content: [
            'When a web browser parses HTML markup, it builds two parallel tree representations in memory: the Document Object Model (DOM) for visual rendering and the Accessibility Object Model (AOM) for assistive devices.',
            'Semantic landmark elements map directly to standard ARIA landmark roles in the AOM (e.g. `<main>` maps to `role="main"`, `<nav>` maps to `role="navigation"`). Using native HTML5 landmarks builds an accessible tree automatically without requiring custom ARIA attributes.',
          ],
          bulletPoints: [
            'AOM nodes inform screen readers how to announce page sections to visually impaired users.',
            'Native HTML5 tags automatically assign accessibility roles without cluttering markup with manual ARIA tags.',
          ],
        },
      ],
      codeExamples: [
        {
          title: 'Production HTML5 Semantic Document Blueprint',
          input: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CosmoDex Expedition - Station 01</title>
</head>
<body>
  <header>
    <h1>CosmoDex Orbital Command</h1>
    <nav aria-label="Primary Site Navigation">
      <ul>
        <li><a href="#expeditions">Expeditions</a></li>
        <li><a href="#telemetry">Telemetry</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article id="expeditions">
      <h2>Station 01: Semantic Landmarks</h2>
      <p>Semantic markup provides structural meaning for search engines and assistive devices.</p>
    </article>

    <aside>
      <h3>Orbital Tip</h3>
      <p>Screen reader users rely on &lt;main&gt; landmarks to skip header navigation directly.</p>
    </aside>
  </main>

  <footer>
    <p>&copy; 2026 CosmoDex Deep Space Academy. All rights reserved.</p>
  </footer>
</body>
</html>`,
          output: 'Renders complete semantic document layout with accessible landmarks and navigation structure.',
          explanation: '<!DOCTYPE html> enforces standards mode, <head> sets responsive viewport metadata, and landmark elements (<header>, <nav>, <main>, <article>, <aside>, <footer>) structure document layout.',
        },
      ],
      practiceQuestion: {
        title: 'Primary Landmark Identification',
        description: 'Construct a semantic content wrapper using the single correct HTML5 landmark element intended to wrap the central unique content of a web page.',
        input: `<main>
  <h2>Mission Control Dashboard</h2>
  <p>Live telemetry data stream actively connected.</p>
</main>`,
        output: 'Renders primary content block with main landmark semantics.',
        explanation: '<main> specifies the dominant content unique to the document and must only appear once per page.',
      },
      mcqs: [
        {
          question: 'Which declaration informs web browsers to render the document in modern HTML5 standard mode rather than legacy quirks mode?',
          codeSnippet: '<!DOCTYPE html>',
          options: ['<!DOCTYPE html>', '<html version="5.0">', '<meta mode="standards">', '<doctype html5>'],
          correctAnswerIndex: 0,
          explanation: '<!DOCTYPE html> is the mandatory, case-insensitive HTML5 document type declaration.',
        },
        {
          question: 'Which HTML5 landmark element should be used strictly ONCE per document to wrap unique main page content?',
          options: ['<main>', '<header>', '<article>', '<section>'],
          correctAnswerIndex: 0,
          explanation: '<main> encloses the unique central content of the document.',
        },
        {
          question: 'What is the primary accessibility drawback of relying on "Div Soup" (nesting generic <div> tags for layout)?',
          options: [
            'Screen readers cannot parse document landmarks or offer keyboard section jumping',
            'Browsers refuse to render pages containing more than 10 divs',
            'CSS styles cannot be applied to div elements',
            'Images loaded inside divs load twice as slowly',
          ],
          correctAnswerIndex: 0,
          explanation: 'Generic <div> elements lack accessibility roles in the Accessibility Object Model (AOM).',
        },
        {
          question: 'Which element is ideal for wrapping a self-contained blog post or syndicatable content card?',
          options: ['<article>', '<aside>', '<nav>', '<div>'],
          correctAnswerIndex: 0,
          explanation: '<article> represents self-contained content intended for independent reuse or syndication.',
        },
      ],
    },
    {
      module_number: 2,
      title: 'Typography, Heading Hierarchy & Text Semantics',
      description: 'Structure text content logically with strict heading tags (<h1>-<h6>), paragraphs, code snippets, and inline semantic tags (<strong>, <em>, <mark>, <code>, <kbd>, <time>).',
      icon_svg: 'swirl',
      topicTitle: 'Typography, Heading Hierarchy & Text Semantics',
      theoryLessonId: 'ch-2',
      xpValue: 55,
      sections: [
        {
          heading: 'Strict Heading Hierarchy Rules (<h1> through <h6>)',
          content: [
            'Headings provide an organized document outline for users scanning a web page, search engine crawlers evaluating page topics, and screen readers building page jump menus.',
            'Golden Rule 1: Always include exactly ONE `<h1>` tag per page representing the overall document title or page topic.',
            'Golden Rule 2: Maintain strict sequential hierarchy (`<h1>` -> `<h2>` -> `<h3>`). Never skip heading levels (e.g. jumping directly from `<h1>` to `<h4>` for visual styling). Headings indicate document structure, NOT font sizes.',
            'Use `<h2>` tags for major page sections. If a section contains sub-topics, organize them under `<h3>` tags. Headings `<h4>` through `<h6>` are reserved for deeper nested sub-sections.',
            'Step 1: Define the single `<h1>` for your page title.',
            'Step 2: Divide page content into major topic sections marked by `<h2>`.',
            'Step 3: Use `<h3>` tags inside `<h2>` blocks for sub-topics.',
          ],
          bulletPoints: [
            'Heading tags establish structural relationship, not typography size. Use CSS `font-size` for visual presentation.',
            'Skipping heading levels confuses assistive device navigation trees.',
            'Search engine crawlers weigh keywords in `<h1>` and `<h2>` headings heavily for SERP ranking.',
          ],
        },
        {
          heading: 'Paragraphs, Blockquotes & Line Break Semantics',
          content: [
            'The `<p>` element represents a paragraph of text. Browsers automatically apply top and bottom margins to separate consecutive paragraphs visually.',
            'The `<br>` tag inserts a single line break. Warning: Never use `<br>` to create spacing between paragraphs or layout blocks—always use CSS margin or padding instead.',
            'The `<hr>` element represents a thematic break between paragraphs or sections, rendered as a horizontal divider.',
            'The `<blockquote>` element encloses multi-line quoted text from another source. Use the `cite` attribute to store the source URL (e.g. `<blockquote cite="https://w3.org">`). For short inline quotations, use the `<q>` element.',
            'The `<pre>` tag displays preformatted text exactly as typed in the code, preserving whitespace, tabs, and line breaks.',
          ],
          bulletPoints: [
            'Use `<p>` for standard body copy text.',
            'Reserve `<br>` exclusively for content where line breaks are part of the text itself (such as postal addresses or poetry).',
            '`<blockquote>` should contain enclosed paragraph elements for semantic quotes.',
          ],
        },
        {
          heading: 'Inline Semantic Elements & Text Micro-Formatting',
          content: [
            'Inline text formatting tags give nuanced meaning to specific words or phrases inside body paragraphs:',
            '• `<strong>`: Marks text of strong importance, seriousness, or urgency (rendered bold by default).',
            '• `<em>`: Marks text with emphatic stress that alters the spoken tone or meaning of the sentence (rendered italic by default).',
            '• `<b>`: Draws visual attention to text without conveying extra importance or stress (rendered bold).',
            '• `<i>`: Highlights text in an alternate voice or mood, such as technical terms, foreign phrases, or book titles (rendered italic).',
            '• `<code>`: Represents a fragment of computer code (e.g. `<code>const x = 10;</code>`).',
            '• `<kbd>`: Denotes user keyboard key inputs or shortcut key combinations (e.g. `<kbd>Ctrl</kbd> + <kbd>C</kbd>`).',
            '• `<mark>`: Highlights text for reference or search hit relevance.',
            '• `<time datetime="2026-09-14">`: Formats dates and times with a machine-readable ISO string for search engines and calendars.',
            '• `<sub>` & `<sup>`: Formats subscript (H<sub>2</sub>O) and superscript (E = mc<sup>2</sup>) notation.',
          ],
          bulletPoints: [
            '`<strong>` conveys semantic importance; `<b>` is purely visual attention.',
            '`<em>` changes verbal emphasis; `<i>` denotes alternate voice or technical terms.',
            '`<time datetime="YYYY-MM-DD">` turns human date text into machine-actionable data.',
          ],
        },
      ],
      codeExamples: [
        {
          title: 'Semantic Typography & Micro-Formatting Blueprint',
          input: `<h1>CosmoDex Technical Documentation</h1>

<section>
  <h2>System Diagnostics</h2>
  <p>Published on <time datetime="2026-09-14T09:00">September 14, 2026 at 09:00 AM</time>.</p>
  
  <p>To abort the launch sequence immediately, press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Esc</kbd>.</p>
  
  <blockquote cite="https://cosmodex.in/specs">
    <p>Warning: <strong>All propulsion values must be verified</strong> prior to ignition.</p>
  </blockquote>
  
  <p>Execute the inline command <code>npm run telemetry</code> to view <em>live orbital metrics</em>.</p>
</section>`,
          output: 'Renders structured document with strict headings, machine-readable date, styled keyboard shortcuts, quote block, and inline code.',
          explanation: '<time datetime="..."> provides ISO dates, <kbd> formats shortcut keys, <strong> adds urgency, and <code> formats inline command snippets.',
        },
      ],
      practiceQuestion: {
        title: 'Machine-Readable Time & Keyboard Formatting',
        description: 'Format a paragraph containing a keyboard shortcut using <kbd> and a machine-readable date using <time datetime="...">.',
        input: `<p>Updated on <time datetime="2026-09-14">Sept 14, 2026</time>. Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>`,
        output: 'Renders formatted text with ISO date metadata and keyboard badges.',
        explanation: '<time datetime="YYYY-MM-DD"> provides structured date parsing, while <kbd> represents key combinations.',
      },
      mcqs: [
        {
          question: 'How many <h1> tags should a standard web document contain for optimal SEO and heading hierarchy?',
          options: ['Exactly 1', 'As many as needed per section', 'Up to 3', 'None'],
          correctAnswerIndex: 0,
          explanation: 'A document should contain exactly one <h1> tag representing the primary page subject.',
        },
        {
          question: 'Which inline tag should be used to format keyboard shortcuts or user input keys?',
          codeSnippet: '<kbd>Ctrl</kbd> + <kbd>C</kbd>',
          options: ['<kbd>', '<code>', '<key>', '<input>'],
          correctAnswerIndex: 0,
          explanation: '<kbd> represents keyboard inputs or system shortcuts.',
        },
        {
          question: 'What is the semantic difference between <strong> and <b> in HTML5?',
          options: [
            '<strong> conveys structural urgency/importance, while <b> is purely visual bold text',
            '<b> is modern HTML5, while <strong> is deprecated',
            '<strong> can only be used inside headings',
            '<b> renders text larger than <strong>',
          ],
          correctAnswerIndex: 0,
          explanation: '<strong> communicates strong semantic importance, whereas <b> draws visual attention without extra semantic weight.',
        },
        {
          question: 'Which attribute on the <time> tag provides the machine-readable ISO date string for search engines?',
          options: ['datetime', 'iso', 'time-value', 'date'],
          correctAnswerIndex: 0,
          explanation: 'The datetime attribute contains the standardized ISO format (e.g. "2026-09-14").',
        },
      ],
    },
    {
      module_number: 3,
      title: 'Hyperlinks, Media Elements & Responsive Images',
      description: 'Build secure navigation with <a>, lazy-load responsive images with <img> and <picture>, and embed audio/video with native media controls.',
      icon_svg: 'striped-banded',
      topicTitle: 'Hyperlinks, Media Elements & Responsive Images',
      theoryLessonId: 'ch-3',
      xpValue: 60,
      sections: [
        {
          heading: 'Hyperlink Mechanics & Critical Security Best Practices',
          content: [
            'The anchor element `<a>` connects web documents across the Internet via the `href` (hypertext reference) attribute.',
            'Anchor links support multiple protocol formats:',
            '• Absolute URLs: `<a href="https://cosmodex.in">CosmoDex</a>` links to external web destinations.',
            '• Relative Paths: `<a href="/about">About Us</a>` links to local site pages.',
            '• Section Anchor Jump Links: `<a href="#telemetry">Jump to Telemetry</a>` smooth scrolls to an element with `id="telemetry"`.',
            '• Email & Phone Protocols: `<a href="mailto:support@cosmodex.in">Email Us</a>` and `<a href="tel:+15550199">Call Support</a>`.',
            'CRITICAL SECURITY REQUIREMENT: When opening external links in a new tab using `target="_blank"`, you MUST ALWAYS add `rel="noopener noreferrer"`. Failing to include `rel="noopener"` allows the opened page to access `window.opener` and execute reverse tab-nabbing phishing attacks on your users.',
            'Step 1: Always specify descriptive link text (avoid generic "click here" text for screen reader accessibility).',
            'Step 2: Add `target="_blank"` for external destinations.',
            'Step 3: Append `rel="noopener noreferrer"` to protect against tab-nabbing security vulnerabilities.',
          ],
          bulletPoints: [
            'Never use `target="_blank"` without `rel="noopener noreferrer"`.',
            'Descriptive link anchor text improves SEO rankings and screen reader usability.',
            'Anchor jump links require a matching `id="..."` attribute on the target container element.',
          ],
        },
        {
          heading: 'Responsive Images (`<img>`) & Performance Optimization',
          content: [
            'The `<img>` tag embeds visual media into a page. Accessibility Mandatory Rule: Every `<img>` tag MUST include an `alt="..."` attribute providing descriptive alternative text for visually impaired users and broken image fallbacks.',
            'Performance Optimization Rules:',
            '• Deferred Lazy Loading: Add `loading="lazy"` to defer downloading offscreen images until the user scrolls near them, reducing initial page load times and bandwidth consumption.',
            '• Layout Shift Prevention: Always declare explicit `width` and `height` attributes on `<img>` tags. This reserves layout space before image assets download, preventing layout jank (Cumulative Layout Shift / CLS).',
            '• Responsive Resolution Switching: Use `srcset` and `sizes` attributes to serve high-density 2x images to Retina displays while serving compressed 1x images to standard mobile screens.',
          ],
          bulletPoints: [
            'Empty `alt=""` should only be used on purely decorative graphics so screen readers skip them.',
            '`loading="lazy"` boosts Core Web Vitals performance scores.',
            'Explicit width and height dimensions eliminate Cumulative Layout Shift (CLS).',
          ],
        },
        {
          heading: 'Art Direction with `<picture>` & Native Audio/Video Embedding',
          content: [
            'The `<picture>` element enables art direction—serving completely different image crops or next-gen file formats (WebP, AVIF) based on browser support and media query screen widths.',
            'Inside `<picture>`, place `<source media="(max-width: 768px)" srcset="mobile.webp">` tags followed by a fallback `<img>` element at the bottom.',
            'Native Media Embedding: `<video>` and `<audio>` elements allow playing rich media directly in the browser without third-party plugins. Always include the `controls` attribute to give users play, pause, and volume controls.',
          ],
          bulletPoints: [
            '`<picture>` evaluates `<source>` tags top-to-bottom and picks the first matching criteria.',
            'Always supply WebP/AVIF sources with legacy PNG/JPG fallbacks.',
            '`<video>` controls attribute is mandatory for web accessibility compliance.',
          ],
        },
      ],
      codeExamples: [
        {
          title: 'Secure Link & Responsive Art Direction Blueprint',
          input: `<!-- Secure External Hyperlink -->
<p>Visit the <a href="https://cosmodex.in" target="_blank" rel="noopener noreferrer">CosmoDex Deep Space Portal</a>.</p>

<!-- Art Direction Responsive Image -->
<picture>
  <source media="(max-width: 600px)" srcset="/images/station-mobile.webp" type="image/webp">
  <source media="(min-width: 601px)" srcset="/images/station-desktop.webp" type="image/webp">
  <img src="/images/station-fallback.jpg" alt="Orbital Station 03 view" width="1200" height="600" loading="lazy">
</picture>

<!-- Native HTML5 Video Player -->
<video controls poster="/images/video-poster.jpg" width="800">
  <source src="/media/telemetry.mp4" type="video/mp4">
  <p>Your browser does not support HTML5 video playback.</p>
</video>`,
          output: 'Renders secure external hyperlink, responsive art-directed image, and native video player.',
          explanation: 'rel="noopener noreferrer" secures target="_blank" links. <picture> selects optimal webp images per screen size, and <video controls> provides native video playback.',
        },
      ],
      practiceQuestion: {
        title: 'External Link Protection',
        description: 'Write an external anchor tag pointing to https://example.com opening in a new tab with security attributes enabled.',
        input: `<a href="https://example.com" target="_blank" rel="noopener noreferrer">Explore Deep Space</a>`,
        output: 'Renders secure external hyperlink.',
        explanation: 'target="_blank" combined with rel="noopener noreferrer" prevents reverse tab-nabbing security exploits.',
      },
      mcqs: [
        {
          question: 'Which attribute combination MUST accompany target="_blank" to protect against reverse tab-nabbing security attacks?',
          options: ['rel="noopener noreferrer"', 'security="strict"', 'type="external"', 'sandbox="allow-same-origin"'],
          correctAnswerIndex: 0,
          explanation: 'rel="noopener noreferrer" prevents the new tab from referencing window.opener.',
        },
        {
          question: 'Which image attribute defers loading of offscreen images until the user scrolls near them?',
          options: ['loading="lazy"', 'defer="true"', 'async="true"', 'scroll="auto"'],
          correctAnswerIndex: 0,
          explanation: 'loading="lazy" optimizes initial page load speed by deferring offscreen media downloads.',
        },
        {
          question: 'What is the main advantage of using the <picture> element over a standard <img> tag?',
          options: [
            'It enables art direction by serving different image formats and crops based on media queries',
            'It automatically compresses images on the server',
            'It eliminates the need for alt text',
            'It forces videos to play in fullscreen mode',
          ],
          correctAnswerIndex: 0,
          explanation: '<picture> allows declaring multiple <source> elements for media query art direction and next-gen format fallbacks.',
        },
        {
          question: 'Why should you always include explicit width and height attributes on <img> elements?',
          options: [
            'To reserve layout space and prevent Cumulative Layout Shift (CLS)',
            'To make the image load faster over slow networks',
            'To convert JPG images into WebP automatically',
            'To enable screen reader text-to-speech',
          ],
          correctAnswerIndex: 0,
          explanation: 'Explicit dimensions allow the browser to compute aspect ratio placeholders, eliminating sudden page jumps during loading.',
        },
      ],
    },
    {
      module_number: 4,
      title: 'Interactive Web Forms & Native Browser Validation',
      description: 'Construct accessible forms with <form>, <label>, input types (email, password, number, date, color, file), <select>, <textarea>, fieldsets, and HTML5 validation attributes.',
      icon_svg: 'saturn-ring',
      topicTitle: 'Interactive Web Forms & Native Validation',
      theoryLessonId: 'ch-4',
      xpValue: 65,
      sections: [
        {
          heading: 'Form Architecture & Accessible Label Binding',
          content: [
            'Web forms collect structured user inputs for authentication, user profiles, search queries, and payment processing using the `<form action="/submit-endpoint" method="POST">` tag.',
            'Accessibility Mandatory Rule: Every input control MUST be explicitly bound to a `<label>` element. Set the label\'s `for` attribute to match the input control\'s `id` attribute (e.g. `<label for="user-email">` and `<input id="user-email">`). When bound correctly, clicking the text label automatically focuses the corresponding input field.',
            'Group related input fields together visually and semantically using `<fieldset>` containers, accompanied by a `<legend>` element providing the section title.',
            'Step 1: Define `<form action="..." method="POST">`.',
            'Step 2: Group field groups with `<fieldset>` and `<legend>`.',
            'Step 3: Pair every `<input id="x">` with a `<label for="x">`.',
          ],
          bulletPoints: [
            'Explicit `<label for="id">` binding expands the clickable touch target area for mobile users.',
            '`<fieldset>` and `<legend>` provide essential context for screen readers navigating complex multi-part forms.',
            'Always specify `name="..."` attributes on input elements so form data key-value pairs are transmitted upon submit.',
          ],
        },
        {
          heading: 'Modern Input Types & Virtual Keyboard Optimization',
          content: [
            'HTML5 introduced specialized `type` attributes for the `<input>` element that adapt mobile virtual keyboards automatically:',
            '• `type="email"`: Shows `@` and `.com` key shortcuts on mobile keyboards.',
            '• `type="tel"`: Displays a numeric phone dialpad keyboard.',
            '• `type="number"`: Opens a numeric keypad with optional `min`, `max`, and `step` constraints.',
            '• `type="url"`: Displays slashes and `.com` keyboard shortcuts.',
            '• `type="date"`: Triggers the browser\'s native interactive date picker widget.',
            '• `type="password"`: Masks input characters securely.',
            '• `type="checkbox"` & `type="radio"`: Allows single or multi-option choices (grouped by identical `name` attributes).',
            'Use `<select>` with `<option>` for dropdown lists and `<textarea>` for multi-line text input fields.',
          ],
          bulletPoints: [
            'Choosing the correct input type drastically improves mobile user conversion rates.',
            'Radio buttons must share the same `name` attribute to operate as a mutually exclusive choice group.',
          ],
        },
        {
          heading: 'Native HTML5 Validation Attributes (Zero JavaScript)',
          content: [
            'Modern browsers provide powerful built-in form validation out of the box without requiring custom JavaScript code:',
            '• `required`: Prevents form submission until the field is populated.',
            '• `minlength="8"` & `maxlength="64"`: Enforces character count constraints.',
            '• `min="1"` & `max="100"`: Validates numeric ranges on `type="number"`.',
            '• `pattern="[A-Z]{3}-[0-9]{4}"`: Enforces custom regular expression formatting (e.g. license plate or promo codes).',
            '• `autocomplete="current-password"`: Enables browser password managers to autofill saved credentials.',
          ],
          bulletPoints: [
            'Native browser validation tooltips are translated automatically based on user locale settings.',
            'CSS `:invalid` and `:user-invalid` pseudo-classes allow custom styling of invalid form inputs.',
          ],
        },
      ],
      codeExamples: [
        {
          title: 'Accessible Validated Registration Form Blueprint',
          input: `<form action="/api/register" method="POST">
  <fieldset>
    <legend>Account Credentials</legend>
    
    <div className="form-group">
      <label for="reg-email">Email Address:</label>
      <input 
        type="email" 
        id="reg-email" 
        name="email" 
        required 
        placeholder="cadet@cosmodex.in"
        autocomplete="email"
      />
    </div>

    <div className="form-group">
      <label for="reg-pass">Password (min 8 chars):</label>
      <input 
        type="password" 
        id="reg-pass" 
        name="password" 
        required 
        minlength="8"
        autocomplete="new-password"
      />
    </div>
  </fieldset>

  <fieldset>
    <legend>Station Allocation</legend>
    <label for="station-select">Choose Station:</label>
    <select id="station-select" name="station" required>
      <option value="">-- Select Orbit --</option>
      <option value="alpha">Alpha Base</option>
      <option value="beta">Beta Terminal</option>
    </select>
  </fieldset>

  <button type="submit">Deploy Cadet Profile</button>
</form>`,
          output: 'Renders structured accessible registration form with native browser validation and grouped fieldsets.',
          explanation: '<label for="id"> binds labels to inputs, required enforces field entry, minlength="8" validates password length, and <fieldset> groups related inputs.',
        },
      ],
      practiceQuestion: {
        title: 'Accessible Label & Input Association',
        description: 'Bind a label element to a text input field using the correct matching id and for attributes.',
        input: `<label for="cadet-callsign">Cadet Callsign</label>
<input type="text" id="cadet-callsign" name="callsign" required>`,
        output: 'Renders accessible label bound to text input field.',
        explanation: 'The label for attribute must exactly match the input id attribute for screen reader focus binding.',
      },
      mcqs: [
        {
          question: 'How do you explicitly bind a <label> element to an <input> element for screen reader accessibility?',
          options: [
            'Set the label for attribute to match the input id attribute',
            'Place the input and label in the same div container',
            'Give the label and input the exact same name attribute',
            'Wrap the label in an aria-label tag',
          ],
          correctAnswerIndex: 0,
          explanation: 'Matching label `for` with input `id` creates an explicit accessibility binding.',
        },
        {
          question: 'Which input validation attribute enforces a minimum character length before submission?',
          options: ['minlength', 'min', 'length', 'validate-min'],
          correctAnswerIndex: 0,
          explanation: 'minlength specifies the minimum required number of text characters.',
        },
        {
          question: 'What is the purpose of the <fieldset> and <legend> elements in web forms?',
          options: [
            'To group related form controls together semantically with a section caption',
            'To create animated submit buttons',
            'To encrypt form values before network transmission',
            'To automatically clear form fields after submission',
          ],
          correctAnswerIndex: 0,
          explanation: '<fieldset> groups related input controls and <legend> provides the group header caption.',
        },
        {
          question: 'Which modern input type opens a dedicated phone dialpad on mobile devices?',
          options: ['type="tel"', 'type="phone"', 'type="number"', 'type="dial"'],
          correctAnswerIndex: 0,
          explanation: 'type="tel" triggers the telephone dialpad keyboard layout on mobile operating systems.',
        },
      ],
    },
    {
      module_number: 5,
      title: 'Data Structuring with Tables & Nested Lists',
      description: 'Organize data using unordered <ul>, ordered <ol>, description <dl> lists, and accessible data tables (<table>, <thead>, <tbody>, <tfoot>, <th>, <td>, scope).',
      icon_svg: 'moon-crater',
      topicTitle: 'Data Structuring with Tables & Nested Lists',
      theoryLessonId: 'ch-5',
      xpValue: 70,
      sections: [
        {
          heading: 'Lists Architecture: <ul>, <ol>, and <dl> Description Glossaries',
          content: [
            'HTML provides three list elements for structuring sequential or unordered data:',
            '• Unordered Lists (`<ul>`): Used when list items have no required sequential order. Items are wrapped in `<li>` (list item) tags.',
            '• Ordered Lists (`<ol>`): Used for sequential step-by-step procedures or rankings. Supports `type="1|a|A|i|I"`, `start="5"`, and `reversed` attributes.',
            '• Description Lists (`<dl>`): Used for key-value pairs, metadata summaries, or glossaries. Uses `<dt>` (description term) and `<dd>` (description details).',
            'Crucial Nesting Rule: When nesting lists inside lists, the child `<ul>` or `<ol>` MUST be placed directly inside a parent `<li>` element.',
          ],
          bulletPoints: [
            'Use `<ol>` for algorithms, recipes, and ranked leaderboards.',
            'Use `<dl>` for key-value specs, term glossaries, and metadata cards.',
            'Never place bare text or nested `<ul>` tags as direct children of `<ul>`—all direct children must be `<li>` elements.',
          ],
        },
        {
          heading: 'Accessible Tabular Data Architecture (`<table>`)',
          content: [
            'Data tables present multi-dimensional information across structured rows and columns. Warning: Tables should NEVER be used for page layout structure—use CSS Grid or Flexbox instead.',
            'Complete Accessible Table Anatomy:',
            '• `<caption>`: Mandatory table title tag placed immediately after opening `<table>`. Screen readers read this caption first.',
            '• `<thead>`: Encloses column header rows (`<tr>`).',
            '• `<tbody>`: Encloses the primary data rows.',
            '• `<tfoot>`: Houses summary totals or calculation rows.',
            '• `<th>` vs `<td>`: Use `<th>` for header cells and `<td>` for standard data cells.',
            'Accessibility Requirement: Always add `scope="col"` to column headers and `scope="row"` to row headers so assistive technologies announce column/row context when navigating individual cells.',
          ],
          bulletPoints: [
            'Always use `<caption>` to title tabular data for assistive device users.',
            '`scope="col"` and `scope="row"` provide essential context for screen reader table navigation.',
            'Use `colspan` and `rowspan` to merge adjacent table cells for multi-row headers.',
          ],
        },
      ],
      codeExamples: [
        {
          title: 'Accessible Financial Table & Description List Blueprint',
          input: `<!-- Accessible Data Table -->
<table>
  <caption>Orbital Fleet Resource Ledger</caption>
  <thead>
    <tr>
      <th scope="col">Vessel Class</th>
      <th scope="col">Fuel Reserve</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Falcon-9</th>
      <td>94%</td>
      <td>Ready</td>
    </tr>
    <tr>
      <th scope="row">Starship</th>
      <td>88%</td>
      <td>Refueling</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row" colspan="2">Total Fleet Readiness</th>
      <td>91% Average</td>
    </tr>
  </tfoot>
</table>

<!-- Key-Value Description List -->
<dl>
  <dt>Orbital Velocity</dt>
  <dd>7.8 kilometers per second in Low Earth Orbit.</dd>
  <dt>Atmospheric Entry Angle</dt>
  <dd>Optimal vector between 5.5° and 7.0°.</dd>
</dl>`,
          output: 'Renders accessible data table with column headers, row headers, merged footer, and key-value description list.',
          explanation: 'scope="col" and scope="row" provide context for screen readers. <dl>, <dt>, and <dd> structure key-value pair metadata.',
        },
      ],
      practiceQuestion: {
        title: 'Table Header Accessibility Scoping',
        description: 'Add appropriate scope attributes to table header elements for a column header and a row header cell.',
        input: `<thead>
  <tr><th scope="col">Cadet Name</th><th scope="col">XP Score</th></tr>
</thead>
<tbody>
  <tr><th scope="row">Cadet Orion</th><td>1,250 XP</td></tr>
</tbody>`,
        output: 'Renders accessible table structure.',
        explanation: 'scope="col" defines column headers, while scope="row" defines row header cells.',
      },
      mcqs: [
        {
          question: 'Which attribute on a <th> tag informs screen readers whether the header cell applies to a column or a row?',
          options: ['scope', 'direction', 'role', 'header-type'],
          correctAnswerIndex: 0,
          explanation: 'scope="col" and scope="row" specify table header orientation for screen reader navigation.',
        },
        {
          question: 'Which element pair is used inside a description list (<dl>) to specify terms and their corresponding definitions?',
          options: ['<dt> and <dd>', '<li> and <item>', '<term> and <def>', '<key> and <value>'],
          correctAnswerIndex: 0,
          explanation: '<dt> defines the term, and <dd> defines the definition details.',
        },
        {
          question: 'What is the primary role of the <caption> element in an HTML table?',
          options: [
            'To provide a visible and screen-reader accessible title for the table',
            'To center table text on screen',
            'To sort table rows alphabetically',
            'To add borders around table cells',
          ],
          correctAnswerIndex: 0,
          explanation: '<caption> provides an accessible title summarizing the table purpose.',
        },
      ],
    },
    {
      module_number: 6,
      title: 'Web Accessibility (a11y), ARIA Roles & Structured Data',
      description: 'Implement WCAG 2.2 accessibility standards, ARIA landmark roles, keyboard navigation focus, Open Graph meta tags, and JSON-LD schema markup.',
      icon_svg: 'grid-web',
      topicTitle: 'Web Accessibility (a11y), ARIA Roles & Structured Data',
      theoryLessonId: 'ch-6',
      xpValue: 80,
      sections: [
        {
          heading: 'WCAG 2.2 Core Principles & The Five Rules of ARIA',
          content: [
            'Web Accessibility (a11y) ensures web applications are usable by everyone, including people with visual, auditory, motor, or cognitive impairments. The Web Content Accessibility Guidelines (WCAG 2.2) rest on four core principles (POUR):',
            '• Perceivable: Information and UI components must be presented in ways users can perceive (text alternatives, alt text, color contrast).',
            '• Operable: Navigation and UI controls must be keyboard operable without trapping focus.',
            '• Understandable: Text must be readable and UI interactions predictable.',
            '• Robust: Content must remain compatible with current and future user agents and assistive tools.',
            'The First Rule of ARIA: "If you can use a native HTML element or attribute with the semantics you require, DO NOT use ARIA."',
            'Essential ARIA Attributes when building dynamic widgets:',
            '• `aria-label="..."`: Provides an accessible text string when no visible text exists (e.g. icon-only close buttons).',
            '• `aria-labelledby="element-id"`: References an existing DOM element text as the label source.',
            '• `aria-expanded="true|false"`: Communicates collapsible menu or dropdown open/closed state.',
            '• `aria-live="polite|assertive"`: Instructs screen readers to announce dynamic content updates (notifications, live chat).',
          ],
          bulletPoints: [
            'First Rule of ARIA: Always prefer native HTML tags (`<button>`, `<input>`) over ARIA div hacks.',
            'Use `aria-live="polite"` for non-disruptive notifications.',
            'Focus management: Ensure key interactive elements have visible `:focus-visible` outlines.',
          ],
        },
        {
          heading: 'Open Graph Social Metadata & JSON-LD Structured Data',
          content: [
            'Open Graph (OG) meta tags optimize how web links appear when shared across social platforms like Discord, Twitter/X, LinkedIn, and WhatsApp.',
            'Core OG Meta Tags inside `<head>`:',
            '• `<meta property="og:title" content="...">`: Sets the preview headline.',
            '• `<meta property="og:description" content="...">`: Provides summary copy.',
            '• `<meta property="og:image" content="...">`: Points to the 1200x630px thumbnail preview image.',
            '• `<meta property="og:url" content="...">`: Canonical page link.',
            'JSON-LD Structured Data: Embed `<script type="application/ld+json">` containing Schema.org JSON graph data to qualify for Google Search rich snippet result cards (courses, articles, FAQs).',
          ],
          bulletPoints: [
            'OG image dimensions should be 1200x630 pixels for crisp social previews.',
            'JSON-LD allows search engines to display star ratings, course prices, and FAQs directly in search results.',
          ],
        },
      ],
      codeExamples: [
        {
          title: 'Accessible ARIA Dialog & Social Metadata Blueprint',
          input: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CosmoDex Security Vault</title>
  
  <!-- Open Graph Social Tags -->
  <meta property="og:title" content="CosmoDex Security Vault">
  <meta property="og:description" content="Master web accessibility and social metadata.">
  <meta property="og:image" content="https://cosmodex.in/og-vault.png">

  <!-- Schema.org JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "HTML5 Web Expedition",
    "provider": {
      "@type": "Organization",
      "name": "CosmoDex Academy"
    }
  }
  </script>
</head>
<body>
  <!-- Accessible ARIA Modal Dialog -->
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Access Authorization Required</h2>
    <p>Please re-authenticate your orbital credentials.</p>
    <button type="button" aria-label="Close Authorization Dialog">&times;</button>
  </div>
</body>
</html>`,
          output: 'Renders social meta tags, JSON-LD structured data, and accessible modal dialog with ARIA semantics.',
          explanation: 'og:tags generate rich social share previews. JSON-LD qualifies page for search engine rich results. role="dialog" and aria-modal="true" structure accessible modals.',
        },
      ],
      practiceQuestion: {
        title: 'ARIA Expanded Toggle State',
        description: 'Add the proper ARIA attribute to a navigation toggle button communicating to screen readers that the menu is expanded.',
        input: `<button type="button" aria-expanded="true" aria-label="Toggle Main Navigation">
  ☰ Menu
</button>`,
        output: 'Renders accessible toggle button with expanded state attribute.',
        explanation: 'aria-expanded="true" informs assistive tools that the dropdown container is open.',
      },
      mcqs: [
        {
          question: 'What is the First Rule of ARIA in modern web development?',
          options: [
            'Always use native HTML elements first before adding custom ARIA roles',
            'Add ARIA attributes to every div tag on the page',
            'Replace native buttons with clickable ARIA divs',
            'Use ARIA exclusively for mobile browsers',
          ],
          correctAnswerIndex: 0,
          explanation: 'Native HTML tags provide inherent accessibility and should always be preferred over custom ARIA hacks.',
        },
        {
          question: 'Which ARIA attribute communicates to screen readers that a collapsible accordion or dropdown menu is open?',
          options: ['aria-expanded="true"', 'aria-open="true"', 'aria-visible="true"', 'aria-state="active"'],
          correctAnswerIndex: 0,
          explanation: 'aria-expanded="true|false" reflects the expansion state of collapsible containers.',
        },
        {
          question: 'Which script type is used to embed Schema.org structured data graph markup for search engine rich snippets?',
          options: ['type="application/ld+json"', 'type="text/schema"', 'type="application/og+xml"', 'type="text/json"'],
          correctAnswerIndex: 0,
          explanation: '<script type="application/ld+json"> is the standard format for embedding JSON-LD schema metadata.',
        },
      ],
    },
    {
      module_number: 7,
      title: 'Milestone: Production Portfolio Web Page',
      description: 'Synthesize all HTML5 principles into a complete, accessible, SEO-optimized portfolio project with semantic layout, responsive media, contact form, and structured schema.',
      icon_svg: 'grid-web',
      topicTitle: 'Milestone Portfolio Project',
      theoryLessonId: 'milestone-1',
      xpValue: 120,
      sections: [
        {
          heading: 'Capstone Architecture & HTML5 Portfolio Blueprint',
          content: [
            'Congratulations on reaching the HTML5 Galaxy Checkpoint! In this capstone milestone, you will synthesize everything learned across the preceding 6 stations to build a production-ready, accessible, SEO-optimized personal developer portfolio page.',
            'Production Requirements Checklist:',
            '1. Standards Boilerplate: `<!DOCTYPE html>`, `<html lang="en">`, `<meta charset="UTF-8">`, and responsive viewport headers.',
            '2. Social & Search Metadata: Open Graph meta tags and Schema.org JSON-LD entity graph.',
            '3. Accessible Skip Link: `<a href="#main-content">Skip to Main Content</a>` for keyboard users.',
            '4. Landmark Structure: `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, and `<footer>`.',
            '5. Strict Heading Tree: Single `<h1>` title with sequential `<h2>` sections.',
            '6. Art-Directed Responsive Media: `<picture>` element with `<source>` options, lazy loading, and explicit width/height dimensions.',
            '7. Accessible Contact Form: `<form>` with `<fieldset>`, `<legend>`, explicit `<label for="...">` bindings, modern input types (`type="email"`), and native validation attributes (`required`).',
          ],
          bulletPoints: [
            'Verify markup through the W3C Markup Validation Service before deployment.',
            'Target a 100/100 score on Google Lighthouse for Accessibility, Best Practices, and SEO.',
          ],
        },
      ],
      codeExamples: [
        {
          title: 'Complete Production Developer Portfolio Blueprint',
          input: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Rivera | Senior Web Engineer</title>
  
  <!-- Open Graph Metadata -->
  <meta property="og:title" content="Alex Rivera | Web Engineer Portfolio">
  <meta property="og:description" content="Specializing in accessible HTML5, React, and web architecture.">
  <meta property="og:image" content="https://cosmodex.in/alex-og.png">
</head>
<body>
  <!-- Accessibility Skip Link -->
  <a href="#main-content" className="sr-only">Skip to main content</a>

  <header>
    <h1>Alex Rivera</h1>
    <p>Senior Web Engineer &amp; Orbital Systems Architect</p>
    <nav aria-label="Main Portfolio Navigation">
      <ul>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <section id="projects">
      <h2>Featured Orbital Projects</h2>
      <article>
        <h3>CosmoDex Expedition Platform</h3>
        <p>Built responsive, accessible learning interfaces using modern HTML5 landmarks and React.</p>
      </article>
    </section>

    <section id="skills">
      <h2>Technical Stack</h2>
      <dl>
        <dt>Frontend Architecture</dt>
        <dd>HTML5, CSS3, TypeScript, React, Next.js</dd>
        <dt>Accessibility (a11y)</dt>
        <dd>WCAG 2.2 AAA Compliance, ARIA Authoring Practices</dd>
      </dl>
    </section>

    <section id="contact">
      <h2>Contact Mission Control</h2>
      <form action="/api/contact" method="POST">
        <fieldset>
          <legend>Send Direct Message</legend>
          
          <label for="contact-name">Full Name:</label>
          <input type="text" id="contact-name" name="name" required>

          <label for="contact-email">Email Address:</label>
          <input type="email" id="contact-email" name="email" required>

          <label for="contact-msg">Message:</label>
          <textarea id="contact-msg" name="message" required minlength="20"></textarea>

          <button type="submit">Transmit Transmission</button>
        </fieldset>
      </form>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 Alex Rivera. Built with clean HTML5 &amp; Web Standards.</p>
  </footer>
</body>
</html>`,
          output: 'Renders complete production developer portfolio web page with full HTML5 standards compliance.',
          explanation: 'Integrates DOCTYPE, head metadata, skip link, header navigation, main section landmark, responsive project grid, key-value skills description list, validated form, and footer.',
        },
      ],
      practiceQuestion: {
        title: 'Full Capstone Structure',
        description: 'Construct a complete semantic web page skeleton containing a header, skip link, main landmark with section, and footer.',
        input: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cadet Portfolio</title>
</head>
<body>
  <header><h1>Cadet Portfolio</h1></header>
  <main id="main-content">
    <section><h2>Mission Objective</h2></section>
  </main>
  <footer><p>&copy; 2026 CosmoDex</p></footer>
</body>
</html>`,
        output: 'Renders clean semantic portfolio layout.',
        explanation: 'Uses standard HTML5 landmark elements and heading tree.',
      },
      mcqs: [
        {
          question: 'Which element should wrap the primary content of a web page to allow screen reader users to skip header navigation links?',
          options: ['<main>', '<header>', '<article>', '<div>'],
          correctAnswerIndex: 0,
          explanation: '<main> defines the central unique content container on a web page.',
        },
        {
          question: 'What is the purpose of adding a "Skip to Main Content" link at the very top of an HTML document body?',
          options: [
            'To allow keyboard and screen reader users to skip repeating header navigation links',
            'To reload the page faster',
            'To submit forms automatically',
            'To hide the navigation bar on mobile devices',
          ],
          correctAnswerIndex: 0,
          explanation: 'Skip links are an essential accessibility feature for keyboard users navigating long header menus.',
        },
      ],
    },
  ];

  for (const mData of htmlModulesData) {
    const existingMod = await prisma.modules.findFirst({
      where: {
        language_id: htmlLang.id,
        module_number: mData.module_number,
      },
    });

    let modId: string;
    if (existingMod) {
      const updatedMod = await prisma.modules.update({
        where: { id: existingMod.id },
        data: {
          title: mData.title,
          description: mData.description,
          icon_svg: mData.icon_svg,
          is_published: true,
        },
      });
      modId = updatedMod.id;
    } else {
      const createdMod = await prisma.modules.create({
        data: {
          language_id: htmlLang.id,
          module_number: mData.module_number,
          title: mData.title,
          description: mData.description,
          icon_svg: mData.icon_svg,
          is_published: true,
        },
      });
      modId = createdMod.id;
    }

    const existingTopic = await prisma.topics.findFirst({
      where: { module_id: modId },
    });

    const contentJson = {
      theoryLessonId: mData.theoryLessonId,
      xpValue: mData.xpValue,
      sections: mData.sections,
      codeExamples: mData.codeExamples || [],
      practiceQuestion: mData.practiceQuestion,
      mcqs: mData.mcqs || [],
    };

    if (existingTopic) {
      await prisma.topics.update({
        where: { id: existingTopic.id },
        data: {
          title: mData.topicTitle,
          content_json: contentJson,
          is_published: true,
        },
      });
    } else {
      await prisma.topics.create({
        data: {
          module_id: modId,
          title: mData.topicTitle,
          content_json: contentJson,
          is_published: true,
          display_order: 1,
        },
      });
    }

    // Seed questions table with MCQs for this module
    if (mData.mcqs && mData.mcqs.length > 0) {
      for (let qIdx = 0; qIdx < mData.mcqs.length; qIdx++) {
        const mcq = mData.mcqs[qIdx];
        const existingQ = await prisma.questions.findFirst({
          where: {
            module_id: modId,
            display_order: qIdx + 1,
          },
        });

        const testCasesJson = {
          codeSnippet: mcq.codeSnippet || '',
          options: mcq.options,
          correctAnswerIndex: mcq.correctAnswerIndex,
          explanation: mcq.explanation,
        };

        if (existingQ) {
          await prisma.questions.update({
            where: { id: existingQ.id },
            data: {
              problem_text: mcq.question,
              test_cases_json: testCasesJson,
              question_type: 'mcq',
              xp_reward: 15,
            },
          });
        } else {
          await prisma.questions.create({
            data: {
              module_id: modId,
              problem_text: mcq.question,
              test_cases_json: testCasesJson,
              question_type: 'mcq',
              difficulty: 'Beginner',
              xp_reward: 15,
              display_order: qIdx + 1,
            },
          });
        }
      }
    }
  }

  console.log('✅ HTML curriculum modules, topics, code examples, & MCQs successfully seeded with rich content!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
