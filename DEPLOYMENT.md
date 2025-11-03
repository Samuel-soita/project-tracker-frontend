# Deployment Guide

This guide covers deploying the application to Vercel with CI/CD automation using GitHub Actions.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Vercel Setup](#vercel-setup)
- [GitHub Actions Setup](#github-actions-setup)
- [Environment Variables](#environment-variables)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:
- A [Vercel account](https://vercel.com/signup)
- A GitHub repository with your code
- Node.js 18.x or higher installed locally
- Vercel CLI installed (optional): `npm install -g vercel`

## Vercel Setup

### 1. Create a New Project on Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (if your frontend is in a subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Navigate to your project directory
cd /path/to/your/project

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 2. Get Your Vercel Credentials

You'll need these for GitHub Actions:

1. **Vercel Token**:
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Click "Create Token"
   - Name it (e.g., "GitHub Actions")
   - Copy the token (you won't see it again!)

2. **Vercel Organization ID**:
   ```bash
   # Using Vercel CLI
   vercel projects list
   ```
   Or find it in your Vercel dashboard URL: `vercel.com/[org-id]`

3. **Vercel Project ID**:
   - Go to Project Settings → General
   - Find "Project ID" near the bottom
   - Or run: `cat .vercel/project.json` (after first deployment)

## GitHub Actions Setup

### 1. Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret" and add:

   | Secret Name | Description | Example |
   |-------------|-------------|---------|
   | `VERCEL_TOKEN` | Your Vercel authentication token | `abc123...` |
   | `VERCEL_ORG_ID` | Your Vercel organization/team ID | `team_abc123` |
   | `VERCEL_PROJECT_ID` | Your Vercel project ID | `prj_abc123` |

### 2. Workflow Files

Two GitHub Actions workflows are configured:

#### `ci.yml` - Main CI/CD Pipeline
- Runs on: Push to main/master/develop, Pull Requests
- Jobs:
  - **Test**: Runs tests on Node.js 18.x and 20.x
  - **Build**: Creates production build
  - **Deploy Preview**: Deploys PR previews to Vercel
  - **Deploy Production**: Deploys to Vercel production (main/master only)

#### `vercel-deploy.yml` - Vercel Deployment
- Runs on: Push to main/master
- Uses Vercel CLI for deployment
- Optimized for production deployments

### 3. Workflow Triggers

**Automatic Deployment:**
- Push to `main` or `master` → Production deployment
- Pull Request → Preview deployment
- Push to `develop` → Run tests and build (no deployment)

**Manual Deployment:**
You can trigger workflows manually from the Actions tab in GitHub.

## Environment Variables

### For Local Development

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Your App Name
```

### For Vercel Deployment

Add environment variables in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add variables for each environment:
   - Production
   - Preview
   - Development

Example variables:
```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Your App Name
```

**Note**: Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client.

## Deployment Process

### Automatic Deployment (Recommended)

1. **Production Deployment**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
   - GitHub Actions will automatically:
     - Run tests
     - Build the application
     - Deploy to Vercel production

2. **Preview Deployment**:
   ```bash
   git checkout -b feature/new-feature
   # Make your changes
   git push origin feature/new-feature
   # Create Pull Request on GitHub
   ```
   - GitHub Actions will:
     - Run tests
     - Build the application
     - Deploy a preview to Vercel
     - Comment PR with preview URL

### Manual Deployment

#### Using Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Using npm scripts (if configured):

```bash
# Build locally
npm run build

# Preview build
npm run preview
```

## Build Configuration

### Vercel Configuration (`vercel.json`)

The project includes a `vercel.json` file with:
- Build settings
- Routing rules for SPA
- Environment configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/assets/(.*)", "dest": "/assets/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## Monitoring Deployments

### Vercel Dashboard
- View deployment status: [Vercel Dashboard](https://vercel.com/dashboard)
- Check build logs
- Monitor performance analytics
- View deployment history

### GitHub Actions
- View workflow runs: Repository → Actions tab
- Check build logs
- Monitor test results
- View deployment status

## Troubleshooting

### Common Issues

#### 1. Build Fails on Vercel

**Problem**: Build fails with module not found errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Environment Variables Not Working

**Problem**: Environment variables are undefined in production

**Solution**:
- Ensure variables are prefixed with `VITE_`
- Add variables in Vercel Dashboard → Project Settings → Environment Variables
- Redeploy after adding variables

#### 3. 404 Errors on Refresh

**Problem**: Page not found when refreshing on routes other than `/`

**Solution**:
- Ensure `vercel.json` includes proper routing rules
- Verify SPA fallback to `index.html` is configured

#### 4. GitHub Actions Deployment Fails

**Problem**: Workflow fails with authentication errors

**Solution**:
- Verify all three secrets are set correctly in GitHub:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- Check token hasn't expired
- Ensure token has correct permissions

#### 5. Tests Fail in CI

**Problem**: Tests pass locally but fail in CI

**Solution**:
```bash
# Run tests exactly as CI does
npm run test:ci

# Check for:
# - Missing dependencies
# - Environment-specific issues
# - Timing issues in tests
```

### Debug Mode

Enable verbose logging in GitHub Actions:

```yaml
- name: Deploy to Vercel
  run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --debug
```

## Performance Optimization

### Build Optimization

1. **Enable caching in GitHub Actions** (already configured):
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'
   ```

2. **Optimize bundle size**:
   ```bash
   # Analyze bundle
   npm run build -- --mode production
   ```

3. **Enable compression** (Vercel does this automatically)

### Deployment Speed

- Use `npm ci` instead of `npm install` (already configured)
- Cache dependencies
- Minimize build artifacts

## Rollback

### Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Vercel CLI
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote [deployment-url]
```

### Git Revert
```bash
# Revert last commit
git revert HEAD
git push origin main
```

## Advanced Configuration

### Custom Domains

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Wait for SSL certificate provisioning

### Preview Deployments

Every branch and PR gets automatic preview deployments:
- URL format: `https://[branch]-[project].vercel.app`
- Automatically deleted when branch is merged/deleted

### Deployment Protection

Configure in Vercel:
- Password protection for previews
- Trusted IP addresses only
- Custom deployment protection rules

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev)

## Checklist

Before deploying to production:

- [ ] All tests passing locally
- [ ] Environment variables configured in Vercel
- [ ] Secrets added to GitHub repository
- [ ] Build succeeds locally (`npm run build`)
- [ ] Preview deployment tested
- [ ] Custom domain configured (if applicable)
- [ ] Error tracking set up (optional)
- [ ] Performance monitoring configured (optional)

---

**Last Updated**: 2025-11-01
