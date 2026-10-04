# Middleware Quick Reference Card

## 🚀 Quick Start

### Check if Middleware is Working
```bash
# Method 1: File exists?
ls src/middleware.ts

# Method 2: Test in browser (without login)
# Open: http://localhost:3000/dashboard
# Should redirect to: /onboarding?mode=login&next=/dashboard
```

---

## 📋 Common Commands

### Git Recovery (If Deleted Again)
```bash
# Find when it was deleted
git log --all --full-history --diff-filter=D -- "*middleware*"

# View file from a specific commit
git show COMMIT_HASH:src/middleware.ts

# Restore from history
git show COMMIT_HASH:src/middleware.ts > src/middleware.ts

# Or checkout directly
git checkout COMMIT_HASH -- src/middleware.ts
```

### Testing Commands
```bash
# Test protected route (should return 302)
curl -I http://localhost:3000/dashboard

# Test API route (should return 401)
curl http://localhost:3000/api/user/profile

# Test public route (should return 200)
curl -I http://localhost:3000
```

---

## 🛡️ Protected Routes List

### User Routes (Require Login)
```
/dashboard
/learn
/battle
/coding
/events
/leaderboard
/profile
/victory
```

### API Routes (Require Login)
```
/api/user/*
/api/battle/*
```

### Admin Routes (Require Admin Role)
```
/super-admin        → super_admin
/learning-admin     → super_admin, learning_admin
/arena-admin        → super_admin, arena_admin
/battle-admin       → super_admin, arena_admin
/api/admin/*        → any admin role
```

---

## 🔍 Debug Checklist

### Issue: Page loads without login

```
☐ 1. Check file exists
   $ ls src/middleware.ts
   
☐ 2. Check file is not empty
   $ cat src/middleware.ts
   
☐ 3. Restart dev server
   $ npm run dev (or pnpm dev)
   
☐ 4. Clear browser cache
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or: Open DevTools → Network → Disable cache
   
☐ 5. Check console for errors
   - Open DevTools → Console
   - Look for middleware errors
   
☐ 6. Verify session cookie exists
   - DevTools → Application → Cookies
   - Look for 'cosmo_session'
   
☐ 7. Check if route is in PROTECTED_USER_ROUTES
   - Open src/middleware.ts
   - Verify route is listed in the array
```

### Issue: Logged in but still redirected

```
☐ 1. Check session cookie is valid
   - DevTools → Application → Cookies → cosmo_session
   - Should not be expired
   
☐ 2. Check session verification
   - Add console.log in verifySession()
   - See if token is being validated
   
☐ 3. Verify JWT secret is set
   - Check .env file
   - SESSION_SECRET or NEXTAUTH_SECRET should exist
   
☐ 4. Check user object structure
   - console.log(user) in middleware
   - Should have userId property
```

---

## 💻 Code Snippets

### Add New Protected Route
```typescript
// In src/middleware.ts

const PROTECTED_USER_ROUTES = [
  '/dashboard',
  '/learn',
  '/battle',
  '/your-new-route', // ← Add here
];
```

### Add New Admin Route
```typescript
// In src/middleware.ts

const ADMIN_ROLE_ROUTES: Record<string, string[]> = {
  '/super-admin': ['super_admin'],
  '/your-admin-page': ['super_admin', 'your_role'], // ← Add here
};
```

### Protect API Route
```typescript
// In src/middleware.ts

const PROTECTED_API_PREFIXES = [
  '/api/user',
  '/api/battle',
  '/api/your-api', // ← Add here
];
```

### Add Logging (Debug)
```typescript
// In src/middleware.ts

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ADD THIS for debugging
  console.log('🔍 Middleware:', pathname);
  
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  let user = null;

  if (sessionCookie?.value) {
    try {
      user = await verifySession(sessionCookie.value);
      console.log('✅ User:', user?.userId); // ADD THIS
    } catch (error) {
      console.log('❌ Session invalid:', error); // ADD THIS
      user = null;
    }
  }
  
  // ... rest of code
}
```

---

## 🔐 Security Best Practices

### ✅ DO
- Use `verifySession()` to validate tokens
- Always check `user.userId` exists
- Return proper HTTP status codes (401, 403)
- Log authentication failures
- Keep SESSION_SECRET secure and random
- Set appropriate cookie expiration

### ❌ DON'T
- Use `JSON.parse()` on session tokens
- Trust cookies without verification
- Hardcode secrets in code
- Skip authentication checks
- Expose user data in error messages
- Store passwords in cookies

---

## 📊 HTTP Status Codes

```
200 OK                  → Request successful
302 Found               → Redirect (used for login redirect)
401 Unauthorized        → No valid session (need to login)
403 Forbidden           → Logged in but insufficient permissions
404 Not Found           → Page doesn't exist
500 Internal Error      → Server error (check logs)
```

---

## 🧪 Testing Scenarios

### Manual Testing
```
1. Incognito Mode (no login)
   → Access /dashboard
   → Should redirect to /onboarding
   
2. Login with Google
   → Should create session
   → Access /dashboard
   → Should load successfully
   
3. Delete session cookie
   → Access /dashboard
   → Should redirect to login
   
4. Regular user → /super-admin
   → Should redirect to /admin or show 403
```

### Automated Testing (Example)
```typescript
// Example test you could add
describe('Middleware', () => {
  it('redirects to login for protected routes', async () => {
    const response = await fetch('http://localhost:3000/dashboard');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toContain('/onboarding');
  });

  it('allows access to public routes', async () => {
    const response = await fetch('http://localhost:3000');
    expect(response.status).toBe(200);
  });
});
```

---

## 🚨 Emergency Fixes

### If Middleware is Deleted/Broken

**Option 1: Restore from Git**
```bash
git checkout origin/main -- src/middleware.ts
```

**Option 2: Restore from This PR**
```bash
git checkout fix/restore-authentication-middleware -- src/middleware.ts
```

**Option 3: Copy from Backup**
```bash
# If you have backup
cp backup/middleware.ts src/middleware.ts
```

**Option 4: Recreate from Template**
See `fixing-authentication-middleware.md` for complete code.

---

## 📞 Who to Contact

If middleware is broken and you can't fix it:

1. **Check Git History**: Someone may have deleted it accidentally
2. **Check Recent PRs**: Recent merges may have caused conflicts
3. **Check CI/CD Logs**: Build errors might show the issue
4. **Ask Team**: Post in #dev-help or #security channel

---

## 📚 Related Files

```
src/middleware.ts           ← Main file (THIS IS CRITICAL!)
src/lib/session.ts          ← Session verification logic
src/lib/auth.ts             ← NextAuth configuration
.env                        ← Environment variables (secrets)
next.config.ts              ← Next.js configuration
```

---

## ⚡ Performance Notes

### Middleware Runs on EVERY Request
- Keep it fast (< 10ms typical)
- Avoid heavy database queries
- Cache session validation if possible
- Use proper matcher config to skip static files

### What's Excluded (Won't Run Middleware)
```
/_next/static/*    → Next.js static files
/_next/image/*     → Next.js image optimization
/favicon.ico       → Favicon
/*.svg|png|jpg     → Images
/*.css|js          → Stylesheets and scripts
```

---

## 🎯 Success Criteria

Your middleware is working correctly if:

- ✅ Protected pages redirect to login when not authenticated
- ✅ Logged-in users can access protected pages
- ✅ Admin pages check user roles
- ✅ API routes return 401 for unauthenticated requests
- ✅ Public pages are accessible to everyone
- ✅ Session cookies are properly verified
- ✅ No console errors related to authentication

---

## 📖 Additional Documentation

- **Full Guide**: `fixing-authentication-middleware.md`
- **Visual Diagrams**: `authentication-flow-diagram.md`
- **Next.js Docs**: https://nextjs.org/docs/app/building-your-application/routing/middleware

---

**Last Updated**: January 2027  
**Version**: 1.0  
**Maintained By**: CosmoDex Team

---

*Print this and keep it handy! 📄*
