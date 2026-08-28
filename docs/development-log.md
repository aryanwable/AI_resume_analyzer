# Development Log — AI Resume Analyzer

A chronological record of development progress, challenges, and learnings.

---

## Day 1 — Foundation & Project Setup

**Date**: 2026-08-25

### Implemented
- Initialized Git repository with GitHub remote
- Created comprehensive `.gitignore` for Node.js, React, and environment files
- Established project folder architecture (`client/`, `server/`, `docs/`)
- Created professional `README.md` with project overview, tech stack, and setup instructions
- Created `.env.example` with all required environment variable placeholders
- Set up frontend directory scaffolding (`components/`, `pages/`, `services/`, etc.)
- Set up backend directory scaffolding (`controllers/`, `routes/`, `models/`, `services/`, etc.)

### Architecture Decisions
- **Monorepo structure**: Single repository with `client/` and `server/` directories for simplified development workflow
- **Separation of concerns**: Backend follows MVC-like pattern with dedicated `controllers/`, `services/`, `models/`, and `middleware/` directories
- **Frontend organization**: Component-based architecture with separate directories for pages, shared components, hooks, context, and API services

### Learning
- **Project scaffolding**: A well-organized folder structure from day one prevents technical debt and makes it easier for contributors to navigate the codebase
- **Environment management**: Using `.env.example` as a template ensures all developers know which variables are required without exposing actual secrets
- **`.gitignore` patterns**: Understanding glob patterns like `server/uploads/*` with `!server/uploads/.gitkeep` allows tracking empty directories while ignoring their contents

---

## Day 2 — React & Vite Frontend Initialization

**Date**: 2026-08-26

### Implemented
- Initialized React 18 + Vite 6 frontend application in `client/`
- Configured Vite with React plugin and development server defaults (`vite.config.js`)
- Configured ESLint with flat config format (`eslint.config.js`) supporting React and Hooks rules
- Created root HTML entry point (`index.html`), SVG favicon (`public/vite.svg`), and main script (`src/main.jsx`)
- Built initial application UI shell (`App.jsx`, `App.css`, `index.css`) displaying project metadata and roadmap status
- Verified clean build (`npm run build`) and zero-warning lint checks (`npm run lint`)

### Architecture Decisions
- **Vite over Create React App**: Vite provides instantaneous Hot Module Replacement (HMR) powered by native ES Modules, drastically improving development velocity.
- **Flat Config ESLint**: Utilized ESLint's modern flat configuration (`eslint.config.js`) with recommended rules for React, React Hooks, and JSX runtime.

### Learning
- **Vite Build Process**: How Vite leverages esbuild for lightning-fast pre-bundling during development and Rollup for optimized production chunking.
- **Strict Mode in React 18**: `React.StrictMode` intentionally double-invokes certain lifecycle methods and effects in development to identify unexpected side effects before deployment.

---

## Day 3 — Express Backend Foundation & Health API

**Date**: 2026-08-28

### Implemented
- Initialized Node.js backend with Express.js in `server/` using ES modules (`type: "module"`)
- Built centralized environment loader (`src/config/environment.js`) with defaults for Port, CORS, JWT, and AI API keys
- Built modular routing system (`src/routes/index.js`) and health check route (`src/routes/healthRoutes.js`)
- Built health controller (`src/controllers/healthController.js`) reporting system health, uptime, environment, and heap memory usage
- Implemented CORS middleware and JSON body parsers in Express application (`src/app.js`)
- Built centralized error handling middleware (`src/middleware/errorHandler.js`) with structured 404 and 500 JSON error envelopes
- Created server entry point (`src/server.js`) with graceful shutdown handlers for `SIGINT` and `SIGTERM`
- Wrote automated integration tests (`test/health.test.js`) verifying root discovery, health check metrics, and 404 responses (100% pass rate)

### Architecture Decisions
- **ES Modules (ESM)**: Configured backend to use native ES Modules matching the frontend for consistent `import`/`export` syntax across the monorepo.
- **Centralized Error Envelope**: Standardized all API error responses to `{ success: false, error: { message, code } }` to ensure predictable client-side error handling.
- **Graceful Shutdown**: Handled process signals to close active HTTP connections cleanly before terminating.

### Learning
- **Express Middleware Lifecycle**: How Express processes requests linearly through middleware functions (`cors` -> `express.json` -> routes -> `notFoundHandler` -> `errorHandler`).
- **Node.js Memory Metrics**: Using `process.memoryUsage()` to monitor Resident Set Size (RSS) and Heap usage for backend observability.


