---
description: How to deploy the application using Turso and Vercel
---

# Deployment Guide: Turso + Vercel

This guide will help you deploy your Next.js application for free using **Turso** (Database) and **Vercel** (Hosting).

## Prerequisites
-   A GitHub account (to push your code).
-   A [Turso](https://turso.tech) account (GitHub login recommended).
-   A [Vercel](https://vercel.com) account (GitHub login recommended).

## Step 1: Set up Turso Database
1.  Install the Turso CLI:
    -   **Windows (PowerShell)**: `iwr https://get.tur.so | iex`
    -   **Mac/Linux**: `curl -sSfL https://get.tur.so/install.sh | bash`
2.  Login to Turso:
    ```bash
    turso auth login
    ```
3.  Create a new database:
    ```bash
    turso db create social-app-db
    ```
4.  Get the database URL:
    ```bash
    turso db show social-app-db --url
    ```
    *Copy this URL (starts with `libsql://`).*
5.  Create an authentication token:
    ```bash
    turso db tokens create social-app-db
    ```
    *Copy this long token string.*

## Step 2: Configure Environment Variables
1.  Create a `.env.production` file in your project root (do not commit this file):
    ```env
    DATABASE_URL="libsql://[YOUR-DATABASE-URL]"
    TURSO_AUTH_TOKEN="[YOUR-AUTH-TOKEN]"
    NEXTAUTH_SECRET="[GENERATE-A-RANDOM-STRING]"
    NEXTAUTH_URL="https://[YOUR-VERCEL-PROJECT-NAME].vercel.app"
    ```
    *Note: You can generate a random secret with `openssl rand -base64 32` or just type a long random string.*

## Step 3: Push to GitHub
1.  Initialize git (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link and push:
    ```bash
    git remote add origin [YOUR-GITHUB-REPO-URL]
    git push -u origin main
    ```

## Step 4: Deploy to Vercel
1.  Go to your Vercel Dashboard and click **"Add New..."** -> **"Project"**.
2.  Import your GitHub repository.
3.  In the **"Environment Variables"** section, add the following:
    -   `DATABASE_URL`: Your Turso URL (`libsql://...`)
    -   `TURSO_AUTH_TOKEN`: Your Turso Token
    -   `NEXTAUTH_SECRET`: Your random secret
    -   `NEXTAUTH_URL`: Leave empty or set to your Vercel domain once known (Vercel sets `VERCEL_URL` automatically, but NextAuth needs `NEXTAUTH_URL` or configuration).
4.  Click **"Deploy"**.

## Step 5: Run Migrations
Once deployed, the build might fail or the app might error because the database is empty. You need to push your schema to Turso.

1.  Run this command locally (using your production credentials):
    ```bash
    npx prisma migrate deploy
    ```
    *Make sure your local `.env` has the Turso credentials temporarily, or pass them inline.*

    **Better approach**:
    Update your `package.json` build script to run migrations on build:
    ```json
    "build": "prisma migrate deploy && next build"
    ```
    *Push this change to GitHub and Vercel will redeploy and migrate automatically.*

## Troubleshooting
-   **"PrismaClientInitializationError"**: Check your `DATABASE_URL` and `TURSO_AUTH_TOKEN`.
-   **"Window is not defined"**: We fixed this with dynamic imports for the map.
-   **Images not loading**: Vercel doesn't support persistent file uploads (`public/uploads`). You will need an external storage service like **UploadThing** (easiest), **Cloudinary**, or **AWS S3** for user uploads in production.
    -   *For now, uploads will disappear on redeploy.*

## Recommendation for Images
Since you need a free solution that supports the DB, **Turso** is perfect.
For images, the current local filesystem approach **will not work** on Vercel (images will be deleted).
I recommend switching to **UploadThing** (Free tier is great) for handling file uploads.

**Shall we switch to UploadThing before deploying?**
