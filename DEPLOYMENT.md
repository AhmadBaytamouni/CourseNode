# Deployment Guide

This guide will help you deploy the Carleton CS Prerequisite Visualizer to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase project set up with database schema

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/carleton-cs-prereq-visualizer.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to SQL Editor and run the schema from `database/schema.sql`
4. Go to Settings > API and copy:
   - Project URL
   - anon/public key

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
6. Click "Deploy"

## Step 4: Populate Database

After deployment, you need to populate the database with course data:

1. Set up environment variables locally (or use Vercel's environment variables):
   ```bash
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the data population script:
   ```bash
   cd scripts
   python populate_db.py
   ```

   **Note**: You'll need to have scraped and processed the course data first using `scraper.py` and `data_processor.py`.

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Check that courses load correctly
3. Test the interactive features:
   - Click on courses to select them
   - Verify unlockable courses are highlighted
   - Check course details panel

## Troubleshooting

### Courses not loading

- Check that Supabase environment variables are set correctly in Vercel
- Verify database schema is set up correctly
- Check browser console for errors
- Verify Supabase RLS policies allow public read access

### Build errors

- Ensure all dependencies are in `package.json`
- Check that TypeScript types are correct
- Verify all imports are correct

### Database connection issues

- Double-check Supabase URL and keys
- Verify network access (Supabase should be publicly accessible)
- Check Supabase project status

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. For production:

1. Use a separate branch (e.g., `production`)
2. Set up branch protection rules
3. Use Vercel's preview deployments for testing

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

