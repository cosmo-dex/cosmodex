# Authentication Flow Diagram

## Visual Guide to How Authentication Works in CosmoDex

### 🔐 Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS A PAGE                           │
│                  (e.g., /dashboard)                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE.TS                               │
│              (Security Guard - Runs First!)                     │
│                                                                 │
│  1. Check for 'cosmo_session' cookie                           │
│  2. Verify JWT signature using verifySession()                 │
│  3. Check if route requires authentication                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
              ┌────────┴────────┐
              │  Has Valid      │
              │  Session?       │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
        YES                        NO
          │                         │
          ▼                         ▼
┌──────────────────┐      ┌──────────────────────┐
│  ALLOW ACCESS    │      │  REDIRECT TO LOGIN   │
│                  │      │                      │
│  User sees the   │      │  /onboarding?        │
│  requested page  │      │  mode=login&         │
│  ✅              │      │  next=/dashboard     │
└──────────────────┘      └──────────────────────┘
```

---

### 🚫 What Happened When Middleware Was Missing

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS A PAGE                           │
│                  (e.g., /dashboard)                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  MIDDLEWARE.TS MISSING! │
         │   ❌ NO SECURITY CHECK  │
         └─────────────┬───────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              PAGE LOADS DIRECTLY - NO CHECK!                    │
│                                                                 │
│  Everyone can see:                                              │
│  ❌ /dashboard (should be protected)                           │
│  ❌ /profile (should be protected)                             │
│  ❌ /learn (should be protected)                               │
│  ❌ /events (should be protected)                              │
│  ❌ /battle (should be protected)                              │
│                                                                 │
│  🔓 SECURITY BREACH - Anyone can access everything!            │
└─────────────────────────────────────────────────────────────────┘
```

---

### 🔄 Authentication Methods Supported

```
┌──────────────────────────────────────────────────────────────┐
│                    LOGIN OPTIONS                             │
└──────────────────┬───────────────────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│  Google  │ │  GitHub  │ │Email/Password│
│  OAuth   │ │  OAuth   │ │   (Custom)   │
└────┬─────┘ └────┬─────┘ └──────┬───────┘
     │            │               │
     └────────────┴───────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │   NextAuth Handler   │
       │   (lib/auth.ts)      │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │   Create Session     │
       │   Sign JWT Token     │
       │   (lib/session.ts)   │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │  Store in Cookie     │
       │  'cosmo_session'     │
       │  (Expires: 7 days)   │
       └──────────────────────┘
```

---

### 🛡️ Middleware Protection Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: Public Routes (No Auth Required)
┌─────────────────────────────────────────┐
│  ✅ /                  (Landing page)   │
│  ✅ /onboarding        (Login/Signup)   │
│  ✅ /api/auth/*        (Auth endpoints) │
│  ✅ Static files       (images, css)    │
└─────────────────────────────────────────┘

LAYER 2: Protected User Routes (Auth Required)
┌─────────────────────────────────────────┐
│  🔒 /dashboard                          │
│  🔒 /learn                              │
│  🔒 /battle                             │
│  🔒 /events                             │
│  🔒 /profile                            │
│  🔒 /leaderboard                        │
│  🔒 /victory                            │
└─────────────────────────────────────────┘
         │
         ▼
   Check: user.userId exists?
         │
    ┌────┴────┐
   YES        NO
    │          │
    ✅         ❌ Redirect to login

LAYER 3: Protected API Routes (Auth Required)
┌─────────────────────────────────────────┐
│  🔒 /api/user/*                         │
│  🔒 /api/battle/*                       │
└─────────────────────────────────────────┘
         │
         ▼
   Check: user.userId exists?
         │
    ┌────┴────┐
   YES        NO
    │          │
    ✅         ❌ Return 401 Unauthorized

LAYER 4: Admin Routes (Role Check Required)
┌─────────────────────────────────────────┐
│  👑 /super-admin      (super_admin)     │
│  📚 /learning-admin   (learning_admin)  │
│  ⚔️  /arena-admin     (arena_admin)     │
│  🔒 /api/admin/*      (any admin)       │
└─────────────────────────────────────────┘
         │
         ▼
   Check: user.role in allowed roles?
         │
    ┌────┴────┐
   YES        NO
    │          │
    ✅         ❌ Return 403 Forbidden
```

---

### 🔍 Session Verification Process

```
┌──────────────────────────────────────────────────────────────┐
│              USER HAS 'cosmo_session' COOKIE                 │
│         Value: "eyJhbGc...xyz123" (JWT Token)                │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  verifySession()     │
              │  (lib/session.ts)    │
              └──────────┬───────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
           ▼                           ▼
    ┌──────────────┐          ┌──────────────┐
    │  1. Decode   │          │  2. Verify   │
    │     JWT      │   ───→   │   Signature  │
    └──────┬───────┘          └──────┬───────┘
           │                         │
           ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │  3. Check    │          │  4. Extract  │
    │  Expiration  │   ───→   │  User Data   │
    └──────┬───────┘          └──────┬───────┘
           │                         │
           └─────────────┬───────────┘
                         │
                    ┌────┴────┐
                    │  Valid? │
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │                     │
            YES                    NO
              │                     │
              ▼                     ▼
      ┌───────────────┐     ┌──────────────┐
      │  Return User  │     │ Return null  │
      │  {            │     │              │
      │   userId,     │     │  Session is  │
      │   username,   │     │  invalid!    │
      │   email,      │     └──────────────┘
      │   role        │
      │  }            │
      └───────────────┘
```

---

### 📊 Request Flow Comparison

#### ✅ WITH MIDDLEWARE (Secure)

```
Browser Request
      │
      ▼
┌──────────────┐
│  Middleware  │ ◄── Checks authentication FIRST
└──────┬───────┘
       │
   ┌───┴───┐
  YES     NO
   │       │
   ▼       ▼
 Allow  Redirect
 Access  to Login
   │
   ▼
┌──────────────┐
│     Page     │
│   Renders    │
└──────────────┘
```

#### ❌ WITHOUT MIDDLEWARE (Insecure)

```
Browser Request
      │
      ▼
┌──────────────┐
│     Page     │ ◄── NO CHECKS! Page loads directly
│   Renders    │
│              │
│  🚨 ANYONE   │
│  CAN ACCESS  │
└──────────────┘
```

---

### 🔧 How We Fixed It

```
Step 1: IDENTIFY
┌────────────────────────────┐
│  Pages accessible without  │
│  login - middleware missing│
└────────────┬───────────────┘
             │
             ▼
Step 2: INVESTIGATE
┌────────────────────────────┐
│  Check git history:        │
│  git log --all --full-     │
│  history --diff-filter=D   │
└────────────┬───────────────┘
             │
             ▼
Step 3: DISCOVER
┌────────────────────────────┐
│  Found: Deleted in commit  │
│  c7e4e817 (Sept 11)        │
│  During "Revert seo" PR    │
└────────────┬───────────────┘
             │
             ▼
Step 4: RECOVER
┌────────────────────────────┐
│  Restore from commit       │
│  95d61435 (Aug 15)         │
│  git show 95d61435:src/    │
│  middleware.ts             │
└────────────┬───────────────┘
             │
             ▼
Step 5: IMPROVE
┌────────────────────────────┐
│  Change JSON.parse()       │
│  to verifySession()        │
│  (Proper JWT verification) │
└────────────┬───────────────┘
             │
             ▼
Step 6: COMMIT & PUSH
┌────────────────────────────┐
│  Create PR:                │
│  fix/restore-              │
│  authentication-middleware │
└────────────────────────────┘
```

---

### 🎯 Testing Checklist

```
Test Case 1: Anonymous User
┌─────────────────────────────────────┐
│  Navigate to /dashboard             │
│           │                         │
│           ▼                         │
│  Expected: 302 Redirect             │
│  To: /onboarding?mode=login&        │
│      next=/dashboard                │
│           │                         │
│           ▼                         │
│  Result: ✅ PASS                    │
└─────────────────────────────────────┘

Test Case 2: Logged In User
┌─────────────────────────────────────┐
│  Login with Google/GitHub           │
│           │                         │
│           ▼                         │
│  Navigate to /dashboard             │
│           │                         │
│           ▼                         │
│  Expected: 200 OK                   │
│  Page loads successfully            │
│           │                         │
│           ▼                         │
│  Result: ✅ PASS                    │
└─────────────────────────────────────┘

Test Case 3: Invalid Session
┌─────────────────────────────────────┐
│  Manually edit session cookie       │
│  to invalid value                   │
│           │                         │
│           ▼                         │
│  Navigate to /dashboard             │
│           │                         │
│           ▼                         │
│  Expected: 302 Redirect to login    │
│  (Invalid token rejected)           │
│           │                         │
│           ▼                         │
│  Result: ✅ PASS                    │
└─────────────────────────────────────┘

Test Case 4: Admin Access
┌─────────────────────────────────────┐
│  Login as regular user (student)    │
│           │                         │
│           ▼                         │
│  Navigate to /super-admin           │
│           │                         │
│           ▼                         │
│  Expected: 302 Redirect to /admin   │
│  (Insufficient permissions)         │
│           │                         │
│           ▼                         │
│  Result: ✅ PASS                    │
└─────────────────────────────────────┘
```

---

### 📝 Key Files and Their Roles

```
Project Structure (Authentication Related)
│
├── src/middleware.ts ⭐ CRITICAL
│   └── Purpose: Guards all routes, checks auth before loading pages
│   └── Runs: On every request
│   └── Returns: Allow access OR redirect to login
│
├── src/lib/auth.ts
│   └── Purpose: NextAuth configuration for OAuth
│   └── Handles: Google & GitHub login
│   └── Creates: User sessions in database
│
├── src/lib/session.ts
│   └── Purpose: JWT token creation and verification
│   └── Functions: signSession(), verifySession()
│   └── Uses: Web Crypto API for signing
│
├── src/context/AuthContext.tsx
│   └── Purpose: Client-side auth state management
│   └── Provides: User info to React components
│   └── Updates: When session changes
│
└── src/app/api/auth/[...nextauth]/route.ts
    └── Purpose: API endpoints for OAuth
    └── Handles: Login, logout, callback URLs
```

---

### 💡 Remember

**The middleware is like a bouncer at a club:**
- Checks ID (session token) at the door
- Allows entry only to authorized guests
- Redirects others to the ticket booth (login page)

**Without the bouncer (middleware):**
- Anyone can walk in
- No security checks
- Total chaos! 🚨

---

*This diagram is for educational purposes. Refer to the codebase for exact implementation details.*
