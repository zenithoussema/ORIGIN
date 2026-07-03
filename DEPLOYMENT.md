# ORIGIN — Production Deployment Guide

## Quick Start

```bash
# 1. Clone and configure
git clone https://github.com/your-org/origin.git
cd origin
cp .env.example .env

# 2. Edit .env with your values
nano .env

# 3. Start with Docker
docker compose up -d

# 4. Run migrations
docker compose run --rm app npx prisma migrate deploy

# 5. Verify
curl http://localhost:3000/api/health
```

## Environment Variables

### Required (app won't start without these)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js (min 16 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical URL of the site | `https://origin.sa` |
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SENTRY_DSN` | Sentry error tracking DSN | — |
| `SENTRY_ORG` | Sentry organization slug | — |
| `SENTRY_PROJECT` | Sentry project slug | — |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | — |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | — |
| `ADMIN_EMAIL` | Admin alert email | — |
| `RESEND_API_KEY` | Resend email API key | — |
| `EMAIL_FROM` | Sender email address | — |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |
| `BACKUP_S3_BUCKET` | S3 bucket for backups | — |
| `LOG_LEVEL` | Logging level | `info` |
| `ANALYZE` | Bundle analysis | `false` |

## Docker

### Build and Run

```bash
# Build image
docker build -t origin .

# Start all services
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

### Services

- **app** — Next.js application (port 3000)
- **postgres** — PostgreSQL 16 (port 5432)
- **redis** — Redis 7 (port 6379)

### Health Check

```bash
curl http://localhost:3000/api/health
```

## CI/CD Pipeline

### GitHub Actions Workflow

On push to `main`:

1. **Validate** — TypeScript check, ESLint, build
2. **Migrate** — Run Prisma migrations on test DB
3. **Build** — Build and push Docker image to GHCR
4. **Deploy** — Deploy to production server via SSH
5. **Verify** — Health check after deployment

### Required Secrets

Set these in GitHub repository settings:

- `DATABASE_URL` — Production database URL
- `NEXTAUTH_SECRET` — NextAuth secret
- `NEXTAUTH_URL` — Production URL
- `STRIPE_SECRET_KEY` — Stripe key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook secret
- `SERVER_HOST` — Server IP/hostname
- `SERVER_USER` — SSH username
- `SERVER_SSH_KEY` — SSH private key

## Database Migrations

### Strategy

- **Never** run migrations manually in production
- Migrations run automatically in CI/CD pipeline
- Only additive changes (no destructive migrations in production)

### Manual Migration (Emergency)

```bash
# Connect to server
ssh deploy@your-server

# Run migration
cd /opt/origin
docker compose run --rm app npx prisma migrate deploy

# Check status
docker compose run --rm app npx prisma migrate status
```

### Rollback

```bash
# Create down migration locally
npx prisma migrate dev --create-only

# Apply in production (only if safe)
docker compose run --rm app npx prisma migrate deploy
```

## Backups

### Automated

Daily backups run at 2 AM UTC:

```bash
# Manual backup
docker compose exec postgres pg_dump -U origin origin_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip -c backup_20240101.sql.gz | docker compose exec -T postgres psql -U origin origin_db
```

### Cloud Backups

Configure `BACKUP_S3_BUCKET` for automatic S3/R2 uploads.

## Monitoring

### Health Endpoints

- `GET /api/health` — Full health check (DB, Redis, memory, alerts)
- `GET /api/ready` — Readiness probe

### Sentry

Error tracking and performance monitoring via `@sentry/nextjs`.

### Logs

Structured logging to `logs/` directory in production.

## SSL/TLS

### Recommended Setup

Use a reverse proxy (Nginx/Caddy) with auto-SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name origin.sa;

    ssl_certificate /etc/letsencrypt/live/origin.sa/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/origin.sa/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Production Checklist

- [ ] All required environment variables set
- [ ] Stripe webhooks configured (`/api/webhooks/stripe`)
- [ ] Sentry DSN added and tested
- [ ] Database backups enabled (daily)
- [ ] Health check endpoint responding (`/api/health`)
- [ ] SSL certificate active and valid
- [ ] DNS configured correctly
- [ ] Admin email set for alerts
- [ ] Redis connected (or gracefully degraded)
- [ ] Email service configured (Resend/SMTP)
- [ ] Cloudinary configured for image uploads
- [ ] Monitoring alerts set up
- [ ] Backup restoration tested
- [ ] Rate limiting verified
- [ ] Security headers verified (CSP, HSTS, etc.)
- [ ] CORS configured for production domain
- [ ] Error pages working (404, 500)
- [ ] Maintenance mode tested

## Troubleshooting

### App Won't Start

```bash
# Check environment validation
docker compose run --rm app node -e "require('./src/lib/env').validateEnvOnStartup()"

# Check database connection
docker compose run --rm app npx prisma db push

# View logs
docker compose logs app
```

### Database Issues

```bash
# Check migration status
docker compose run --rm app npx prisma migrate status

# Reset database (DANGER: destroys data)
docker compose run --rm app npx prisma migrate reset
```

### Performance

```bash
# Run bundle analysis
ANALYZE=true npm run build

# Check slow queries
curl http://localhost:3000/api/health | jq '.database.queries'
```
