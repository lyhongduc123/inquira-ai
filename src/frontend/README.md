# Inquira Frontend

Frontend web application for Inquira, an AI research assistant for scholarly search, paper exploration, citation-grounded chat, bookmarks, and author analysis.

This README documents only the frontend application. The backend API, database setup, ingestion, and evaluation workflows are documented in the backend README.

Backend repository: [backend-inquira](https://github.com/lyhongduc123/backend-inquira)

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- TanStack Query
- Zustand
- Recharts

## Project Structure

```powershell
frontend-inquira/
+-- src/
|   +-- app/                 #Next.js app routes
|   +-- components/          #Shared UI, layout, auth
|   +-- hooks/               #Chat, auth, conversation, citation, and UI hooks
|   +-- lib/                 #API clients, stream helpers, citation utilities
|   +-- store/               #Zustand stores
|   +-- types/               #Shared TypeScript types
|   +-- core/                #Runtime constants
+-- public/                  #Static assets
+-- package.json
+-- next.config.ts
+-- tsconfig.json
```

## Install

From `frontend-inquira/`:

```powershell
npm install
```

Create a local environment file:

```powershell
New-Item .env.local -ItemType File
```

Minimum local value:

```env
API_BASE_URL=http://localhost:8000
```

The backend should be running at the configured `API_BASE_URL`.

## Production Build

Create an optimized production build:

```powershell
npm run build
```

Start the production server:

```powershell
npm run start
```

The app will be available at:

http://localhost:3000

## Useful Commands

```powershell
npm run dev       # Start development server
npm run build     # Create production build
npm run start     # Start production server
npm run lint      # Run lint checks
```

## Notes

Local `.env`, `.env.local`, `.next`, `node_modules`, logs, and generated files are not part of the tracked source.
