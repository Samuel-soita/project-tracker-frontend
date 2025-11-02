# Add this section to your README.md

## Deployment

This application is configured for automatic deployment to Vercel with a complete CI/CD pipeline.

### Quick Deploy

**Option 1: Automatic (Recommended)**
```bash
git push origin main
```
GitHub Actions will automatically test, build, and deploy to production.

**Option 2: Manual Deployment**
```bash
./deploy.sh --prod
```

### Documentation

- **[Quick Start Guide](QUICK_START_DEPLOY.md)** - Get started in 5 minutes
- **[Complete Deployment Guide](DEPLOYMENT.md)** - Full documentation
- **[CI/CD Summary](CI_CD_SUMMARY.md)** - Implementation details
- **[Deployment Flow](DEPLOYMENT_FLOW.txt)** - Visual workflow diagrams

### Setup Requirements

1. Create a [Vercel account](https://vercel.com/signup)
2. Add GitHub secrets (see [Quick Start](QUICK_START_DEPLOY.md))
3. Push to main branch

### Environments

- **Production**: `https://your-project.vercel.app` (auto-deploy on push to main)
- **Preview**: Automatic preview URLs for all pull requests
- **Development**: `npm run dev` (local development)

### CI/CD Features

✅ Automated testing on every push
✅ Automated builds with caching
✅ Preview deployments for PRs
✅ Production deployments on merge
✅ Test coverage reporting
✅ One-click rollbacks

See [CI_CD_SUMMARY.md](CI_CD_SUMMARY.md) for complete details.

---
