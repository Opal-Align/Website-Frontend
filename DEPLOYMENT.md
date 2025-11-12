# Deployment Guide

## Azure Static Web Apps Deployment

### What Was Fixed

The Azure workflow was missing the build steps. It now:
1. ✅ Sets up Node.js
2. ✅ Installs dependencies
3. ✅ Builds the application
4. ✅ Deploys to Azure

### Setting Up GitHub Secrets for HubSpot

Since `.env` files aren't committed to git, you need to add your HubSpot credentials as GitHub Secrets for the build to work:

#### Step 1: Go to GitHub Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** (top menu)
3. Click on **Secrets and variables** > **Actions** (left sidebar)

#### Step 2: Add HubSpot Secrets

Click **New repository secret** and add these two secrets:

**Secret 1:**
- **Name:** `VITE_HUBSPOT_PORTAL_ID`
- **Value:** Your HubSpot Portal ID (e.g., `12345678`)

**Secret 2:**
- **Name:** `VITE_HUBSPOT_FORM_GUID`
- **Value:** Your HubSpot Form GUID (e.g., `abc12345-def6-7890-ghij-klmnopqrstuv`)

#### Step 3: Verify Secrets

After adding both secrets, you should see them listed in the Secrets section.

### Alternative: Set Environment Variables in Azure Portal

You can also set environment variables directly in Azure Portal:

1. Go to Azure Portal
2. Navigate to your Static Web App
3. Go to **Configuration** > **Application settings**
4. Add these application settings:
   - **Name:** `VITE_HUBSPOT_PORTAL_ID`
   - **Value:** Your Portal ID
   - **Name:** `VITE_HUBSPOT_FORM_GUID`
   - **Value:** Your Form GUID

**Note:** If you set them in Azure Portal, you can remove the `env:` section from the workflow file (lines 31-34).

### Testing the Deployment

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Fix build workflow and add HubSpot integration"
   git push origin main
   ```

2. Check the GitHub Actions tab:
   - Go to your repository on GitHub
   - Click on **Actions** tab
   - You should see the workflow running
   - Wait for it to complete

3. Verify deployment:
   - Check your Azure Static Web App URL
   - Test the Footer form submission
   - Check HubSpot for new submissions

### Troubleshooting

#### Build Fails with "Module not found"

- Make sure all dependencies are in `package.json`
- Run `npm install` locally to ensure `package-lock.json` is up to date
- Commit `package-lock.json` to git

#### Environment Variables Not Working

- Verify secrets are set correctly in GitHub
- Check that secret names match exactly (case-sensitive)
- Restart the workflow after adding secrets

#### Deployment Succeeds but Form Doesn't Work

- Check browser console for errors
- Verify HubSpot Portal ID and Form GUID are correct
- Check HubSpot form settings (make sure it's active)
- Verify field names in `hubspotService.js` match your HubSpot form

### Workflow File Structure

The updated workflow now includes:
- ✅ Node.js setup
- ✅ Dependency installation (`npm ci`)
- ✅ Build step (`npm run build`)
- ✅ Environment variables from GitHub Secrets
- ✅ Deployment to Azure Static Web Apps

### Next Steps

1. Add GitHub Secrets (see Step 2 above)
2. Commit and push the updated workflow file
3. Monitor the GitHub Actions workflow
4. Test the deployed application

