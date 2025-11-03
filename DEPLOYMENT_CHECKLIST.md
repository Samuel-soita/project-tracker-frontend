# Deployment Checklist

Use this checklist to deploy your application to Vercel for the first time.

## Pre-Deployment Checklist

### 1. Code Preparation
- [x] All tests passing locally (`npm test`)
- [x] Build succeeds locally (`npm run build`)
- [x] Linter passes (`npm run lint`)
- [ ] Code committed to Git
- [ ] Code pushed to GitHub

### 2. Vercel Account Setup
- [ ] Created Vercel account at [vercel.com/signup](https://vercel.com/signup)
- [ ] Connected GitHub account to Vercel
- [ ] Imported repository to Vercel

### 3. Get Vercel Credentials

Run these commands and save the output:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project and get credentials
vercel link
```

Save these values:
- [ ] `VERCEL_TOKEN` (from [vercel.com/account/tokens](https://vercel.com/account/tokens))
- [ ] `VERCEL_ORG_ID` (from CLI output or dashboard URL)
- [ ] `VERCEL_PROJECT_ID` (from CLI output or project settings)

### 4. GitHub Repository Setup
- [ ] Repository exists on GitHub
- [ ] You have admin access to repository
- [ ] Code is pushed to main/master branch

### 5. Add GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

Add these three secrets:

- [ ] `VERCEL_TOKEN` = `[your-vercel-token]`
- [ ] `VERCEL_ORG_ID` = `[your-org-id]`
- [ ] `VERCEL_PROJECT_ID` = `[your-project-id]`

### 6. Environment Variables (Optional)

If your app needs environment variables, add them in Vercel Dashboard:

**Vercel Dashboard → Project → Settings → Environment Variables**

Example variables:
- [ ] `VITE_API_URL` = `https://api.yourdomain.com`
- [ ] `VITE_APP_NAME` = `Your App Name`
- [ ] Add any other required variables

## First Deployment

### Option A: Automatic (Recommended)

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

Then:
1. [ ] Go to GitHub repository → Actions tab
2. [ ] Watch the workflow run
3. [ ] Wait for deployment to complete (~2-3 minutes)
4. [ ] Check deployment URL in workflow output

### Option B: Manual Deployment

```bash
# Make sure you're in the project directory
cd /home/said/frontend-code/client

# Run deployment script
./deploy.sh --prod
```

## Verification Steps

After deployment completes:

### 1. Check GitHub Actions
- [ ] Go to repository → Actions tab
- [ ] Verify workflow completed successfully
- [ ] Check for any errors in logs

### 2. Check Vercel Dashboard
- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Find your project
- [ ] Verify deployment status is "Ready"
- [ ] Note your production URL

### 3. Test Your Application
- [ ] Visit your production URL
- [ ] Test main functionality
- [ ] Check all routes work
- [ ] Verify API connections (if applicable)
- [ ] Test on mobile device
- [ ] Check browser console for errors

### 4. Performance Check
- [ ] Run Lighthouse audit
- [ ] Check page load time
- [ ] Verify images load correctly
- [ ] Test navigation between pages

## Post-Deployment

### 1. Monitor
- [ ] Set up error tracking (optional)
- [ ] Configure analytics (optional)
- [ ] Set up uptime monitoring (optional)

### 2. Documentation
- [ ] Update README with production URL
- [ ] Document environment variables
- [ ] Share deployment docs with team

### 3. Team Setup
- [ ] Add team members to Vercel project (if needed)
- [ ] Share deployment documentation
- [ ] Set up deployment notifications

### 4. Optional Enhancements
- [ ] Configure custom domain
- [ ] Set up staging environment
- [ ] Enable deployment protection
- [ ] Configure caching rules
- [ ] Set up CDN optimization

## Troubleshooting

If something goes wrong, check:

### GitHub Actions Failing
1. [ ] Check workflow logs for errors
2. [ ] Verify all secrets are set correctly
3. [ ] Ensure tests pass locally
4. [ ] Check Node.js version compatibility

### Deployment Failing
1. [ ] Verify Vercel credentials are correct
2. [ ] Check build logs in Vercel dashboard
3. [ ] Ensure `vercel.json` is configured correctly
4. [ ] Verify all dependencies are in `package.json`

### Application Not Working
1. [ ] Check browser console for errors
2. [ ] Verify environment variables are set
3. [ ] Check API endpoints are accessible
4. [ ] Test routing configuration

### Need Help?
- [ ] Read [DEPLOYMENT.md](DEPLOYMENT.md)
- [ ] Check [CI_CD_SUMMARY.md](CI_CD_SUMMARY.md)
- [ ] Review [Vercel Documentation](https://vercel.com/docs)
- [ ] Check [GitHub Actions logs](https://github.com)

## Success Criteria

Your deployment is successful when:

- [x] GitHub Actions workflow completes without errors
- [ ] Application is accessible at production URL
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Tests pass in CI/CD
- [ ] Build artifacts are generated
- [ ] SSL certificate is active
- [ ] Environment variables work correctly

## Next Steps

After successful deployment:

1. [ ] Create a pull request to test preview deployments
2. [ ] Set up custom domain (optional)
3. [ ] Configure monitoring and alerts
4. [ ] Document deployment process for team
5. [ ] Plan for staging environment (optional)

---

## Quick Reference

### Deploy Commands
```bash
# Automatic deployment
git push origin main

# Manual preview deployment
./deploy.sh

# Manual production deployment
./deploy.sh --prod

# Using Vercel CLI
vercel --prod
```

### Check Status
```bash
# List deployments
vercel ls

# View logs
vercel logs

# Check project info
vercel project
```

### Rollback
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

---

**Estimated Time to Complete**: 15-20 minutes (first time)

**Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

**Deployment Date**: __________

**Production URL**: __________

**Deployed By**: __________

**Notes**:
-
-
-

---

Good luck with your deployment! 🚀
