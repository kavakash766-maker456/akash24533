# 🚀 TaskEarn Pro — Complete VPS Deployment Guide

This guide takes you from a blank VPS to a fully running, production-ready TaskEarn Pro instance.
Written for complete beginners. Every command is explained.

---

## 📋 What You Need Before Starting

| Item | Where to Get It | Cost |
|---|---|---|
| VPS Server | Hetzner, DigitalOcean, Contabo, Vultr | $5–$15/month |
| Domain Name | Namecheap, GoDaddy, Porkbun | $10–$15/year |
| Stripe Account | stripe.com | Free |
| Cloudinary Account | cloudinary.com | Free tier |
| Gmail (for emails) | gmail.com | Free |

**Minimum VPS specs:** 2 GB RAM, 2 vCPU, 40 GB SSD (Ubuntu 22.04)
**Recommended:** 4 GB RAM, 2 vCPU, 80 GB SSD

---

## PART 1 — Get Your VPS

### Option A: Hetzner (cheapest, recommended)
1. Go to https://hetzner.com/cloud
2. Create account → New Project → Add Server
3. Choose: **Ubuntu 22.04**, CX21 (2 vCPU, 4GB RAM) = ~€5/month
4. Add your SSH key (or use password — explained below)
5. Click Create Server → copy the **IP address**

### Option B: DigitalOcean
1. Go to https://digitalocean.com
2. Create Droplet → Ubuntu 22.04 → Basic → $12/month (2GB)
3. Copy the IP address from dashboard

---

## PART 2 — Connect to Your VPS

Open a terminal on your computer:

**Mac/Linux:**
```bash
ssh root@YOUR_SERVER_IP
# Example: ssh root@123.45.67.89
```

**Windows:** Download **PuTTY** from putty.org, enter your IP, click Open.

When prompted "Are you sure you want to continue?" → type `yes` and press Enter.

---

## PART 3 — Server Initial Setup

Run these commands **one by one** after connecting:

### 3.1 — Update the server
```bash
apt update && apt upgrade -y
```
*This downloads all security patches. Takes 2-3 minutes.*

### 3.2 — Install required software
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Git, Nginx, Certbot, and other tools
apt install -y git nginx certbot python3-certbot-nginx ufw fail2ban

# Install Docker
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
node --version    # Should show v20.x.x
docker --version  # Should show Docker version 24.x
```

### 3.3 — Create a non-root user (more secure)
```bash
adduser deploy
# Enter a password when prompted, press Enter for all other fields

usermod -aG sudo deploy
usermod -aG docker deploy

# Switch to the new user for the rest of setup
su - deploy
```

### 3.4 — Set up firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
# Type "y" when asked to confirm
```

---

## PART 4 — Point Your Domain to Your Server

1. Log in to your domain registrar (Namecheap, GoDaddy, etc.)
2. Find **DNS Settings** for your domain
3. Add these DNS records:

| Type | Name | Value |
|---|---|---|
| A | @ | YOUR_SERVER_IP |
| A | www | YOUR_SERVER_IP |
| A | api | YOUR_SERVER_IP |

*Example: if domain is `taskearnpro.com`, this creates `taskearnpro.com`, `www.taskearnpro.com`, and `api.taskearnpro.com`*

**Wait 5-30 minutes for DNS to propagate.**

Test it: `ping yourdomain.com` — should show your server IP.

---

## PART 5 — Upload Your Code to the Server

### 5.1 — Push code to GitHub first (on your local computer)
```bash
# On YOUR computer (not the server):
cd taskearn-pro
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/taskearn-pro.git
git push -u origin main
```

### 5.2 — Clone code on the server
```bash
# On the SERVER:
cd /home/deploy
git clone https://github.com/YOUR_USERNAME/taskearn-pro.git
cd taskearn-pro
```

---

## PART 6 — Configure Environment Variables

```bash
cp .env.example .env
nano .env
```

Fill in every value. Here's what each one means:

```bash
# ── App ────────────────────────────────────────────────────────
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com        # ← your real domain

# ── Database ────────────────────────────────────────────────────
# Leave as-is if using Docker (we'll use Docker)
DATABASE_URL=postgresql://postgres:CHANGE_THIS_PASSWORD@postgres:5432/taskearn

# ── Redis ───────────────────────────────────────────────────────
REDIS_URL=redis://redis:6379

# ── JWT Secrets ─────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=paste_64_random_characters_here
JWT_REFRESH_SECRET=paste_different_64_random_characters_here

# ── Cloudinary ─────────────────────────────────────────────────
# Sign up free at cloudinary.com → Dashboard → copy these values
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# ── Stripe ─────────────────────────────────────────────────────
# dashboard.stripe.com → Developers → API Keys
# Use LIVE keys for production (not test keys!)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx

# ── Email (Gmail) ───────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
# For Gmail: Go to Google Account → Security → App Passwords
# Create an "App Password" for "Mail" — use that 16-char password here
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="TaskEarn Pro <noreply@yourdomain.com>"

# ── Platform Config ─────────────────────────────────────────────
PLATFORM_COMMISSION_PERCENT=10
WITHDRAWAL_FEE_PERCENT=2
MIN_WITHDRAWAL_AMOUNT=5

# ── Frontend ────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXTAUTH_SECRET=paste_another_random_string_here
NEXTAUTH_URL=https://yourdomain.com
```

Save with: **Ctrl+X → Y → Enter**

---

## PART 7 — Update Docker Compose for Production

```bash
nano docker-compose.yml
```

Update the `api` environment section:
```yaml
api:
  environment:
    DATABASE_URL: postgresql://postgres:CHANGE_THIS_PASSWORD@postgres:5432/taskearn
    REDIS_URL: redis://redis:6379
    NODE_ENV: production

web:
  environment:
    NEXT_PUBLIC_API_URL: https://api.yourdomain.com/api/v1
    NEXTAUTH_URL: https://yourdomain.com
```

Also update postgres password to match:
```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: CHANGE_THIS_PASSWORD   # must match DATABASE_URL above
```

---

## PART 8 — Start Everything with Docker

```bash
# Build and start all services
docker-compose up -d --build

# Watch the logs to check everything started correctly
docker-compose logs -f
# Press Ctrl+C to stop watching logs

# Check all containers are running
docker-compose ps
```

You should see 4 containers all with status "Up":
- `taskearn_postgres`
- `taskearn_redis`
- `taskearn_api`
- `taskearn_web`

### 8.1 — Run database migrations and seed
```bash
# Run migrations (creates all tables)
docker-compose exec api npx prisma migrate deploy

# Seed the database (creates admin user + categories)
docker-compose exec api npx ts-node prisma/seed.ts
```

---

## PART 9 — Set Up Nginx (Web Server / Reverse Proxy)

Nginx sits in front of your app and handles HTTPS, routes requests to the right service.

```bash
sudo nano /etc/nginx/sites-available/taskearn
```

Paste this entire block (replace `yourdomain.com` with your real domain):

```nginx
# Frontend — serves the Next.js app
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API — serves the Express backend
server {
    listen 80;
    server_name api.yourdomain.com;

    # Allow large file uploads (for proof images)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Save, then enable:
```bash
sudo ln -s /etc/nginx/sites-available/taskearn /etc/nginx/sites-enabled/
sudo nginx -t           # test config — should say "syntax is ok"
sudo systemctl reload nginx
```

---

## PART 10 — Install SSL Certificate (Free HTTPS)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Follow prompts:
# Enter your email address
# Agree to terms → A
# Share email with EFF → N (optional)
```

Certbot automatically:
- Gets a free SSL certificate from Let's Encrypt
- Updates your Nginx config for HTTPS
- Sets up auto-renewal

**Test it:** Open `https://yourdomain.com` in your browser — you should see the TaskEarn Pro landing page!

---

## PART 11 — Test Everything Works

Open these URLs in your browser:

| URL | Expected Result |
|---|---|
| `https://yourdomain.com` | Landing page |
| `https://yourdomain.com/login` | Login page |
| `https://yourdomain.com/register` | Registration page |
| `https://api.yourdomain.com/health` | `{"status":"ok"}` |
| `https://api.yourdomain.com/api/docs` | Swagger API docs |

**Test admin login:**
1. Go to `https://yourdomain.com/login`
2. Email: `admin@taskearnpro.com`
3. Password: `Admin@123456`
4. ⚠️ Immediately change this password in Settings!

---

## PART 12 — Set Up Stripe Webhook

Stripe needs to send payment confirmations to your server.

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. URL: `https://api.yourdomain.com/api/v1/wallet/deposit/webhook`
4. Events to listen to: `payment_intent.succeeded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update your `.env` file: `STRIPE_WEBHOOK_SECRET=whsec_...`
8. Restart API: `docker-compose restart api`

---

## PART 13 — Keep Your App Running (Auto-restart)

Docker already restarts containers automatically (`restart: unless-stopped`).

But you need Docker to start on server reboot:
```bash
sudo systemctl enable docker
```

To set up auto-updates for your app when you push new code:
```bash
# Create a deploy script
nano /home/deploy/deploy.sh
```

Paste:
```bash
#!/bin/bash
cd /home/deploy/taskearn-pro
git pull origin main
docker-compose up -d --build
docker-compose exec api npx prisma migrate deploy
echo "✅ Deploy complete: $(date)"
```

```bash
chmod +x /home/deploy/deploy.sh
```

Now whenever you update code, just SSH into the server and run:
```bash
./deploy.sh
```

---

## PART 14 — Monitor Your App

### View live logs
```bash
# All services
docker-compose logs -f

# Just API
docker-compose logs -f api

# Just the web frontend
docker-compose logs -f web
```

### Check resource usage
```bash
# See CPU, memory, disk usage
docker stats

# Disk usage
df -h

# RAM usage
free -h
```

### Restart services
```bash
# Restart everything
docker-compose restart

# Restart just the API
docker-compose restart api
```

---

## PART 15 — Backups (Important!)

### Automatic daily database backup
```bash
nano /home/deploy/backup.sh
```

Paste:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p $BACKUP_DIR

# Dump database
docker-compose exec -T postgres pg_dump -U postgres taskearn > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup complete: db_$DATE.sql"
```

```bash
chmod +x /home/deploy/backup.sh

# Schedule it to run every day at 2 AM
crontab -e
# Add this line at the bottom:
0 2 * * * /home/deploy/backup.sh >> /home/deploy/backup.log 2>&1
```

---

## 🔒 Security Checklist

Run this after deployment:

```bash
# ✅ Change admin password (in the web app settings)
# ✅ Verify firewall is active
sudo ufw status

# ✅ Check fail2ban is protecting against brute force
sudo systemctl status fail2ban

# ✅ Verify SSL is working
curl -I https://yourdomain.com | grep -i "strict-transport"

# ✅ Check no sensitive ports are exposed
sudo ss -tulpn | grep LISTEN
# Should NOT see 5432 (postgres) or 6379 (redis) on 0.0.0.0
# They should only be on 127.0.0.1 or inside Docker network
```

---

## 🔧 Troubleshooting

### "502 Bad Gateway" in browser
```bash
docker-compose ps         # check all containers are "Up"
docker-compose logs api   # look for error messages
sudo systemctl status nginx
```

### App won't start — database connection error
```bash
# Check postgres is running
docker-compose ps postgres
# Check DATABASE_URL in .env matches docker-compose.yml postgres password
cat .env | grep DATABASE_URL
```

### Email not sending
```bash
# Test SMTP
docker-compose exec api node -e "
const n = require('nodemailer');
const t = n.createTransport({ host: 'smtp.gmail.com', port: 587, auth: { user: 'YOUR_EMAIL', pass: 'YOUR_APP_PASS' } });
t.verify().then(() => console.log('SMTP OK')).catch(console.error);
"
```

### Out of disk space
```bash
# Clean up unused Docker images
docker system prune -a
# Check what's using space
du -sh /var/lib/docker
```

### "Connection refused" to API
```bash
# Check API is listening
docker-compose logs api | tail -20
# Restart API
docker-compose restart api
```

---

## 📊 VPS Specs vs. Traffic

| Users | RAM | CPU | Monthly Cost |
|---|---|---|---|
| 0–500 | 2 GB | 1 vCPU | ~$6 (Hetzner CX11) |
| 500–2,000 | 4 GB | 2 vCPU | ~$15 (Hetzner CX21) |
| 2,000–10,000 | 8 GB | 4 vCPU | ~$30 (Hetzner CX31) |
| 10,000+ | Separate DB server | 8+ vCPU | $80+ |

**Upgrade tip:** When RAM usage consistently hits 80%+, it's time to upgrade.
Check with: `free -h`

---

## ✅ Final Checklist

- [ ] VPS created and accessible via SSH
- [ ] Domain pointing to server IP
- [ ] Code cloned and `.env` configured
- [ ] Docker running all 4 containers
- [ ] Database migrations applied and seeded
- [ ] Nginx configured for both domains
- [ ] SSL certificates installed (HTTPS working)
- [ ] Stripe webhook configured
- [ ] Admin password changed from default
- [ ] Firewall enabled
- [ ] Backups scheduled

**Your TaskEarn Pro marketplace is live! 🎉**

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f api`
2. Google the exact error message
3. Ask on Stack Overflow with tag `docker` + `nextjs`
4. Open a support ticket in your own app (good test!)
