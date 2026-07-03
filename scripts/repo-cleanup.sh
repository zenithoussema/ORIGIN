#!/bin/bash
# ================================
# ORIGIN — Repository Cleanup Script
# Run from the project root
# ================================

set -euo pipefail

echo "=== 1. Delete dev artifacts ==="
rm -f build_err.txt build_out.txt dev.log dev-server.log dev-combined.log tsconfig.tsbuildinfo
rm -rf logs/

echo "=== 2. Delete auto-generated next-env.d.ts ==="
rm -f next-env.d.ts

echo "=== 3. Verify .env files are NOT tracked ==="
git ls-files --error-unmatch .env .env.local 2>/dev/null && {
  echo "ERROR: .env files are tracked! Removing from index..."
  git rm --cached .env .env.local
} || echo "OK: .env files are not tracked"

echo "=== 4. Stage all files (respecting .gitignore) ==="
git add .

echo "=== 5. Verify what will be committed ==="
echo ""
echo "=== STAGED FILES ==="
git diff --cached --name-only

echo ""
echo "=== VERIFICATION: Check no secrets are staged ==="
git diff --cached --name-only | grep -E '\.env$|\.env\.local$|\.pem$|\.key$|\.cert$' && {
  echo "WARNING: Sensitive files found in staging!"
  exit 1
} || echo "OK: No sensitive files staged"

echo ""
echo "=== VERIFICATION: Check no large files ==="
git diff --cached --stat | grep -E 'node_modules|\.next|tsbuildinfo' && {
  echo "WARNING: Generated files found in staging!"
  exit 1
} || echo "OK: No generated files staged"

echo ""
echo "=== 6. Create .env.example ==="
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# NextAuth
NEXTAUTH_SECRET=your-secret-here-at-least-16-chars
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false
PWA_ENABLED=false

# Stripe (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Sentry (optional)
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Upstash Redis (optional — app works without it)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email (optional)
RESEND_API_KEY=
EMAIL_FROM=
ADMIN_EMAIL=
EOF
git add .env.example

echo ""
echo "=== 7. Commit ==="
git commit -m "feat: initial commit — complete project setup

- Next.js 15 App Router + React 19 + TypeScript
- Prisma 6 with PostgreSQL (Neon)
- NextAuth 5 beta (credentials provider)
- Stripe payments integration
- Sentry error monitoring
- Docker multi-stage build (app + postgres + redis)
- GitHub Actions CI/CD (validate → migrate → build → deploy)
- PWA support (manifest + service worker)
- Tailwind CSS 4 + custom theme
- Rate limiting (Upstash Redis, fallback to in-memory)
- i18n support (English + Arabic + French)
- Admin dashboard with full CRUD"

echo ""
echo "=== DONE ==="
echo "Repository is clean and ready for GitHub."
echo ""
echo "Next steps:"
echo "  1. Create a .env file with your actual secrets"
echo "  2. Run: npm install"
echo "  3. Run: npx prisma generate"
echo "  4. Run: npm run dev"
echo ""
echo "To push to GitHub:"
echo "  git remote add origin https://github.com/YOUR_ORG/origin.git"
echo "  git push -u origin main"
