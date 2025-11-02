# Quick Start - Deploy to Vercel

## One-Time Setup (5 minutes)

### 1. Create Vercel Account
Visit [vercel.com/signup](https://vercel.com/signup)

### 2. Get Your Credentials

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Get your credentials (save these!)
vercel projects list
```

### 3. Configure GitHub Secrets

Go to: `GitHub Repo → Settings → Secrets → Actions`

Add these 3 secrets:
- `VERCEL_TOKEN` - From [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` - From Vercel CLI output above
- `VERCEL_PROJECT_ID` - From Vercel CLI output above

## Deploy Now

### Option 1: Automatic (Recommended)
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```
✅ Done! Check GitHub Actions for deployment status

### Option 2: Manual Deploy
```bash
# Deploy to preview
./deploy.sh

# Deploy to production
./deploy.sh --prod
```

### Option 3: Vercel CLI
```bash
# Preview
vercel

# Production
vercel --prod
```

## Check Deployment

1. **GitHub Actions**: Repository → Actions tab
2. **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
3. **Your Site**: `https://your-project.vercel.app`

## Need Help?

- See full guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)

## Common Commands

```bash
# Run tests
npm test

# Build locally
npm run build

# Preview build
npm run preview

# Deploy preview
vercel

# Deploy production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---
That's it! Your app is now deployed 🎉
