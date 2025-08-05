# Netlify Deployment Guide for Kanban-UI (Next.js App Router)

This guide walks you through deploying your Kanban-UI project (Next.js 15+, App Router) to Netlify, including Firebase setup and environment configuration.

---

## 1. Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Netlify CLI (optional, for local testing)](https://docs.netlify.com/cli/get-started/)
- A [Netlify account](https://app.netlify.com/)
- A [Firebase project](https://console.firebase.google.com/) (see `FIREBASE_SETUP.md` for details)

---

## 2. Project Structure
- **Frontend code:** `frontend/`
- **Next.js App Router:** `frontend/src/app/`
- **Static assets:** `frontend/public/`
- **Netlify config:** `netlify.toml`

---

## 3. Environment Variables
Create a file called `.env.local` inside the `frontend/` directory with your Firebase and Gemini API keys:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

**On Netlify:** Add these variables in the Netlify dashboard under Site Settings > Environment Variables.

---

## 4. Netlify Configuration (`netlify.toml`)
Your `netlify.toml` should look like this:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"

[functions]
  directory = "netlify/functions"
```
- `base` points to the frontend folder.
- `command` runs the Next.js build.
- `publish` should be set to `.next` for Next.js App Router (Netlify adapter will handle routing).
- `functions` is optional unless you add custom Netlify functions.

---

## 5. Install Netlify Adapter
Your project already includes `@netlify/next` in `package.json`.
If not, run:
```sh
npm install @netlify/next
```

---

## 6. Build & Deploy
### Option 1: Deploy via Netlify Web UI
1. Push your code to GitHub/GitLab/Bitbucket.
2. Go to [Netlify](https://app.netlify.com/) and create a new site from your repo.
3. Set the build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. Add environment variables in the Netlify dashboard.
5. Deploy!

### Option 2: Deploy via Netlify CLI
```sh
cd frontend
netlify init   # Link to your Netlify site
netlify deploy --build
netlify deploy --prod
```

---

## 7. Firebase Setup
See `frontend/FIREBASE_SETUP.md` for full instructions on setting up Firebase and database rules.

---

## 8. Notes & Troubleshooting
- **SSR/ISR:** The project uses the Next.js App Router and is client-side rendered by default. Netlify will handle dynamic routes and API endpoints automatically.
- **API Routes:** Your API routes (e.g., `/api/gemini-template`) will be deployed as Netlify Functions.
- **Static Assets:** Files in `frontend/public/` are served as static assets.
- **Custom Functions:** If you add custom Netlify functions, place them in `netlify/functions/`.
- **Logs:** Check the Netlify deploy logs for build or runtime errors.

---

## 9. Useful Links
- [Netlify Next.js Docs](https://docs.netlify.com/integrations/frameworks/next-js/overview/)
- [Firebase Setup Guide](frontend/FIREBASE_SETUP.md)
- [Next.js App Router Docs](https://nextjs.org/docs/app)

---

**You're ready to deploy!** 🎉 