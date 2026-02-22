# TaskEarn Pro 🚀

A full-stack **Micro Job Marketplace** — like Fiverr + Microworkers. Built with Next.js 14, Node.js, PostgreSQL, and Redis.

---

## 🗂️ What's Inside

```
taskearn-pro/
├── apps/
│   ├── web/    → Next.js 14 frontend (TypeScript + Tailwind)
│   └── api/    → Express.js backend (TypeScript + Prisma)
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

---

## ✅ Features

| Feature | Status |
|---|---|
| JWT Auth + Refresh Tokens | ✅ |
| Google OAuth | ✅ |
| Email Verification | ✅ |
| 2FA (Google Authenticator) | ✅ |
| Role-based Access Control | ✅ |
| Job Posting with Escrow | ✅ |
| Worker Submissions + Proof Upload | ✅ |
| Automatic Escrow Release | ✅ |
| Stripe Wallet Deposits | ✅ |
| Withdrawal System | ✅ |
| Platform Commission (10%) | ✅ |
| Referral System | ✅ |
| Membership Plans | ✅ |
| Real-time Notifications (Socket.io) | ✅ |
| Support Ticket System | ✅ |
| Admin Dashboard + Analytics | ✅ |
| Docker Support | ✅ |
| CI/CD (GitHub Actions) | ✅ |

---

## 🚀 Quick Start (Beginners — Step by Step)

### Step 1: Install required software

1. Download **Node.js 20**: https://nodejs.org
2. Download **Docker Desktop**: https://docker.com/products/docker-desktop
3. Download **Git**: https://git-scm.com

### Step 2: Clone the project

Open a terminal and run:
```bash
git clone https://github.com/YOUR_USERNAME/taskearn-pro.git
cd taskearn-pro
```

### Step 3: Set up environment variables

```bash
cp .env.example .env
```

Now open `.env` in a text editor and fill in:
- `JWT_SECRET` → any random long string
- `JWT_REFRESH_SECRET` → different random string
- Leave database/redis as-is if using Docker

### Step 4: Start with Docker (easiest)

```bash
docker-compose up -d
```

Wait ~60 seconds, then:
```bash
# Run database migrations
docker-compose exec api npx prisma migrate dev --name init

# Seed the database (creates admin user + categories)
docker-compose exec api npx ts-node prisma/seed.ts
```

### Step 5: Open in browser

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin |
| API | http://localhost:5000 |
| API Docs | http://localhost:5000/api/docs |

### Default Admin Login
- **Email:** admin@taskearnpro.com
- **Password:** Admin@123456
- ⚠️ Change this password immediately!

---

## 🚀 Deploy to GitHub + Vercel (Free)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskearn-pro.git
git push -u origin main
```

### Step 2: Deploy Backend to Railway (free tier)

1. Go to https://railway.app
2. Click **New Project → Deploy from GitHub**
3. Select your repo, choose `apps/api` as root
4. Add a **PostgreSQL** and **Redis** plugin
5. Add all environment variables from `.env`
6. Deploy!

### Step 3: Deploy Frontend to Vercel (free)

1. Go to https://vercel.com
2. Click **New Project → Import from GitHub**
3. Select your repo
4. Set **Root Directory** to `apps/web`
5. Add environment variables (set `NEXT_PUBLIC_API_URL` to your Railway API URL)
6. Deploy!

---

## 🔑 GitHub Actions Secrets

For CI/CD to work, add these secrets in GitHub → Settings → Secrets:

| Secret | Value |
|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token |
| `RAILWAY_TOKEN` | Railway API token |

---

## 📚 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Cache | Redis (ioredis) |
| Auth | JWT + Refresh Tokens + Google OAuth + TOTP 2FA |
| Payments | Stripe |
| Images | Cloudinary |
| Real-time | Socket.io |
| Email | Nodemailer (SMTP) |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 🛡️ Security

- Passwords hashed with bcrypt (rounds=12)
- JWT tokens expire in 15 minutes
- Refresh tokens rotate on every use
- Rate limiting on all API routes
- Helmet security headers
- Zod input validation on all endpoints
- SQL injection protection via Prisma
- CORS configured for your domain only

---

## 📄 License

MIT — free to use for any project.
