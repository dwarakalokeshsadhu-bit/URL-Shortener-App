# LinkNova URL Shortener

A MERN URL shortener SaaS scaffold based on the provided PRD and interface reference.

## Stack

- React + Vite frontend
- Tailwind CSS styling
- Zustand for frontend auth/link state
- Express + MongoDB backend
- JWT auth with HTTP-only cookies
- NanoID short URL generation

## Run Locally

```bash
npm run install:all
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`:

```bash
npm.cmd run install:all
npm.cmd run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

This project is prepared for local MongoDB first. The local backend config is already in `server/.env`:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/linknova
CLIENT_URL=http://localhost:5173
APP_URL=http://localhost:5000
```

Local short links use `APP_URL`, so they look like `http://localhost:5000/abc123`. These links only work on your own machine. For another machine on the same Wi-Fi, use your LAN address in `APP_URL`, for example:

```bash
APP_URL=http://192.168.1.25:5000
```

For public users, deploy the backend and set `APP_URL` to the deployed backend URL.

On Windows, make sure the `MongoDB` service is running. Deployment-specific values for MongoDB Atlas, Render, and Vercel can be changed later.

Useful local commands:

```bash
npm.cmd run dev:client
npm.cmd run dev:server
npm.cmd run build
```

## Deployment Setup

Deploy the backend first, then use that backend URL in the frontend config.

Backend on Render:

```bash
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Backend environment variables:

```bash
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
APP_URL=https://your-render-backend.onrender.com
CLIENT_URL=https://your-vercel-frontend.vercel.app
CLIENT_URLS=https://your-vercel-frontend.vercel.app,http://localhost:5173
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

Frontend on Vercel:

```bash
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

Frontend environment variable:

```bash
VITE_API_URL=https://your-render-backend.onrender.com
```

Important: shortened links are generated from backend `APP_URL`. For production, never set `APP_URL` to localhost.

Deployment checklist:

```bash
1. Deploy backend on Render.
2. Copy the Render backend URL.
3. Set backend APP_URL to that Render URL.
4. Set frontend VITE_API_URL to that Render URL.
5. Set backend CLIENT_URL/CLIENT_URLS to the Vercel frontend URL.
6. Add production Google OAuth callback in Google Cloud Console.
```

Google OAuth redirect URLs:

```bash
Local: http://localhost:5000/api/auth/google/callback
Production: https://your-render-backend.onrender.com/api/auth/google/callback
```
