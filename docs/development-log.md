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

---

## Day 4 — Complete Frontend Application Shell & Tailwind CSS

**Date**: 2026-08-29

### Implemented
- Configured Tailwind CSS 3 and PostCSS build pipeline with Autoprefixer in `client/`
- Designed custom theme tokens (`tailwind.config.js`) including brand color scale, typography, and card shadow variants
- Configured global base, components, and utility layers in `src/index.css` (`.btn-primary`, `.btn-secondary`, `.card`, `.badge-primary`)
- Built responsive `Navbar` component (`src/components/Navbar.jsx`) with brand logo, active route highlighting, API status pill, and mobile drawer
- Built application `Footer` component (`src/components/Footer.jsx`) with repository links, architectural badges, and capstone metadata
- Created main layout shell (`src/layouts/MainLayout.jsx`) composing header, responsive `<Outlet />` content container, and footer
- Implemented React Router v6 multi-page navigation across `HomePage`, `DashboardPage`, `UploadPage`, `HistoryPage`, and `NotFoundPage` (404)
- Verified production bundle compilation (`vite build`) and linting (`eslint .`) with zero warnings

### Architecture Decisions
- **Layout Route Composition**: Leveraged React Router v6 `<Outlet />` pattern in `MainLayout.jsx` to share the persistent Navigation bar and Footer across all application views.
- **Utility-First Styling**: Tailwind CSS enables consistent spacing, color token usage, and responsive breakpoints without writing bespoke CSS classes for every component.

### Learning
- **React Router v6 NavLink**: Using the `isActive` render prop in `NavLink` to dynamically apply active background and text styling for the current route.
- **PostCSS JIT Processing**: How Tailwind JIT scans template files on-demand to generate only the CSS classes actually utilized in production bundles.

---

## Day 5 — MongoDB Integration & Database Connection Manager (Phase 1 Complete)

**Date**: 2026-08-29

### Implemented
- Installed and configured Mongoose 8 in `server/`
- Built database connection manager (`src/config/database.js`) with `connectDB()`, `disconnectDB()`, and `getDatabaseStatus()`
- Implemented Mongoose lifecycle event listeners (`connected`, `error`, `disconnected`, `reconnected`)
- Added startup environment validation utility (`src/config/environment.js`) checking for critical variables
- Integrated live MongoDB health diagnostics into `/api/health` controller
- Added database connection initialization and graceful disconnection on process termination signals in `src/server.js`
- Updated integration test suite (`test/health.test.js`) verifying database health status diagnostics (4/4 tests passed)
- Completed all Phase 1 Foundation requirements

### Architecture Decisions
- **Non-blocking Startup Degradation**: In development, if `MONGODB_URI` is not yet configured, the server boots in disconnected mode rather than crashing, reporting `not_configured` in `/api/health`. In production, missing database credentials trigger a strict fatal exit.
- **Connection Diagnostics Helper**: Extracted `getDatabaseStatus()` to decouple database state inspection from request handling logic.

### Learning
- **Mongoose Connection States**: Understanding Mongoose `readyState` codes (0: disconnected, 1: connected, 2: connecting, 3: disconnecting).
- **Graceful Resource Release**: Closing MongoDB connections prior to terminating the Node.js process prevents orphan connection pools.

---

## Day 6 — User Model & Registration API (Phase 2 Begins)

**Date**: 2026-09-03

### Implemented
- Designed Mongoose User Schema (`server/src/models/User.js`) with fields: `name`, `email`, `password`, `role`, and `timestamps`
- Configured schema validations (name length constraints, lowercase normalized email regex matching, minimum password length)
- Implemented `toJSON` transform method to automatically exclude `password` and `__v` from returned user objects
- Built user registration controller (`server/src/controllers/authController.js`) with validation, duplicate email check, and error responses
- Built authentication router (`server/src/routes/authRoutes.js`) mounting `POST /register`
- Integrated `/api/auth` into central API router (`server/src/routes/index.js`)
- Created automated integration test suite (`server/test/auth.test.js`) testing successful registration (201), duplicate email conflict (409), missing fields (400), invalid email format (400), and short password (400)

### Architecture Decisions
- **Model-Level Security**: Password field marked with `select: false` and stripped via `toJSON` transform ensures passwords are never leaked in API responses.
- **Input Sanitization**: Email normalized to lowercase and trimmed before uniqueness checks to prevent duplicate accounts caused by case variation.

### Learning
- **Mongoose Schema Transforms**: Using `toJSON.transform` to mutate the returned object projection globally for all serialized documents.
- **HTTP Status Codes for Auth**: Using `400 Bad Request` for validation failures, `409 Conflict` for duplicate emails, and `201 Created` for successful resource generation.

---

## Day 7 — Password Hashing & Security Validation (bcryptjs)

**Date**: 2026-09-03

### Implemented
- Integrated `bcryptjs` 2.4.3 for one-way salted password hashing in `server/`
- Implemented Mongoose `pre('save')` middleware on `User` schema to automatically hash plaintext passwords with 10 salt rounds
- Added condition `this.isModified('password')` to prevent double-hashing passwords on profile updates
- Implemented `comparePassword(candidatePassword)` instance method on `User` schema for constant-time hash verification
- Updated registration controller to ensure offline fallback store also persists salted hashes
- Created automated test suite (`server/test/password.test.js`) verifying 60-character `$2a$`/$2b$ hash generation, salt variability, accurate positive matches, and rejection of incorrect passwords

### Architecture Decisions
- **Mongoose Pre-Save Hook**: Placing password hashing directly in the model layer guarantees that any code path saving a User document enforces encryption before database writes occur.
- **Work Factor of 10**: Balances robust brute-force resistance (~1024 iterations) with fast response times (< 100ms) for legitimate login and registration requests.

### Learning
- **Salting vs Hashing**: Why appending a unique random cryptographic salt to each password prevents rainbow table lookup attacks even when two users share identical passwords.
- **Constant-Time Comparison**: Why `bcrypt.compare` uses constant-time string comparison algorithms to prevent side-channel timing attacks.

---

## Day 8 — User Login API & JWT Authentication

**Date**: 2026-09-04

### Implemented
- Integrated `jsonwebtoken` 9.0.2 for stateless bearer token generation and signature verification in `server/`
- Built JWT utility module (`server/src/utils/token.js`) with `generateToken()` and `verifyToken()` helpers
- Built `login` controller handler (`server/src/controllers/authController.js`) with credential verification and user enumeration defense
- Updated `register` controller to return a signed JWT upon successful registration for immediate authentication
- Mounted `POST /api/auth/login` on authentication router (`server/src/routes/authRoutes.js`)
- Created automated integration test suite (`server/test/login.test.js`) testing successful login (200 with JWT claims), invalid password rejection (401), non-existent email rejection (401), and validation errors (400)

### Architecture Decisions
- **Stateless Bearer Tokens**: JWTs contain essential claims (`id`, `email`, `role`) signed with HMAC SHA-256 (`JWT_SECRET`), eliminating server session state and enabling horizontal scalability.
- **User Enumeration Defense**: Returned the identical generic error message (`"Invalid email or password"`) and 401 status for both non-existent emails and incorrect passwords, preventing malicious actors from probing valid user accounts.

### Learning
- **JWT Anatomy**: Understanding Header (algorithm), Payload (claims like user id and expiry), and Cryptographic Signature.
- **Token Lifespan Strategy**: Why setting an expiration window (7 days) bounds the attack surface if an access token is compromised.

---

## Day 9 — Authentication Middleware & Protected Routes

**Date**: 2026-09-04

### Implemented
- Built authentication middleware (`server/src/middleware/authMiddleware.js`) verifying JWTs from `Authorization: Bearer <token>` headers
- Added request decoration attaching decoded claims (`req.user = { id, email, role }`) to authenticated request objects
- Added role-based authorization helper (`requireRole('admin')`) supporting role restrictions
- Built `getMe` controller handler (`server/src/controllers/authController.js`) returning current user profile
- Mounted protected route `GET /api/auth/me` with `authenticate` middleware in `server/src/routes/authRoutes.js`
- Created automated integration test suite (`server/test/authMiddleware.test.js`) testing valid token access (200), missing token (401 `TOKEN_MISSING`), malformed Bearer scheme (401 `INVALID_TOKEN_FORMAT`), tampered token (401 `INVALID_TOKEN`), and expired token (401 `TOKEN_EXPIRED`)

### Architecture Decisions
- **Request Context Decoration**: Attaching `req.user` inside `authenticate` middleware guarantees all downstream controllers have immediate access to the authenticated user's identity without redundant token verification.
- **Granular Error Codes**: Differentiating `TOKEN_EXPIRED`, `TOKEN_MISSING`, and `INVALID_TOKEN` enables the frontend client (Day 10) to automatically refresh or prompt appropriate re-login UI flows.

### Learning
- **Bearer Token Authorization Scheme**: The industry-standard HTTP Authorization header format (`Authorization: Bearer <token>`).
- **Express Middleware Pipeline with Guards**: How middleware acts as gatekeeper functions, halting execution early with 401/403 status codes before protected business logic runs.

---

## Day 10 — Frontend Authentication Flow & Protected Routes (Phase 2 Complete)

**Date**: 2026-09-07

### Implemented
- Configured Axios 1.7.9 API client (`client/src/services/api.js`) with automatic Bearer token request interceptor and 401 session expiration handler
- Built authentication service (`client/src/services/authService.js`) with `registerUser`, `loginUser`, and `getCurrentUser` methods
- Implemented global `AuthContext` and custom `useAuth` hook (`client/src/context/AuthContext.jsx`) with localStorage token persistence and silent session validation
- Created navigation guard component (`client/src/components/ProtectedRoute.jsx`) protecting candidate routes and preserving redirect targets
- Built interactive `LoginPage` (`client/src/pages/LoginPage.jsx`) with validation, show/hide password, error alerts, and demo autofill helper
- Built interactive `RegisterPage` (`client/src/pages/RegisterPage.jsx`) with password confirmation and client-side validation
- Updated `Navbar` (`client/src/components/Navbar.jsx`) with dynamic auth state, candidate avatar badge, initials, and logout button
- Wrapped application in `AuthProvider` and configured protected routes for `/dashboard`, `/upload`, and `/history` in `App.jsx`
- Completed Phase 2: Authentication & User Management (Days 6–10)

### Architecture Decisions
- **Decoupled Interceptor Event Handling**: Configured Axios response interceptors to dispatch a custom `auth:session_expired` window event, enabling `AuthContext` to clear expired credentials reactively without coupling Axios directly to React state.
- **Client Navigation Guards**: Used React Router `Navigate` with `state={{ from: location }}` inside `ProtectedRoute` to redirect users back to their intended destination immediately upon login.

### Learning
- **React Context Lifecycle**: How to initialize auth state synchronously from `localStorage` followed by asynchronous background verification (`GET /api/auth/me`).
- **Axios Request Interceptors**: How interceptors automatically inject authorization headers into every outgoing HTTP request without manual boilerplate.

---

## Day 11 — Resume Upload UI & Drag-and-Drop Dropzone (Phase 3 Begins)

**Date**: 2026-09-07

### Implemented
- Created dedicated `ResumeDropzone` component (`client/src/components/ResumeDropzone.jsx`) with HTML5 drag-and-drop event handlers (`dragenter`, `dragover`, `dragleave`, `drop`)
- Implemented client-side PDF validation (MIME-type check and `.pdf` extension fallback) and 5MB maximum file size limit
- Built interactive file preview card displaying filename, formatted size (KB/MB), verification badge, and remove/replace actions
- Updated `UploadPage` (`client/src/pages/UploadPage.jsx`) with multi-step layout combining resume dropzone, job description input, and analysis controls
- Added real-time character and estimated word counters to the job description textarea
- Created sample Job Description presets ("Full Stack Engineer", "Backend Node.js Developer", "AI / Full Stack Specialist") for quick testing

### Architecture Decisions
- **Client-Side Pre-validation**: Enforcing PDF MIME-type and 5MB size limits in the browser prevents oversized or corrupt payloads from wasting server bandwidth.
- **Componentized Dropzone**: Extracted `ResumeDropzone` into a standalone reusable component with isolated drag state and validation alerts.

### Learning
- **HTML5 Drag and Drop API**: Managing `preventDefault()` and `stopPropagation()` across drag events to prevent browsers from opening dropped PDF files directly in a new tab.
- **File Object Metadata**: Reading `file.name`, `file.size`, and `file.type` to compute formatted byte metrics in the client interface.

---

## Day 12 — Backend PDF Upload API (Multer)

**Date**: 2026-09-07

### Implemented
- Integrated `multer` 1.4.5 in `server/` for handling multipart/form-data file streams
- Built `uploadMiddleware.js` (`server/src/middleware/uploadMiddleware.js`) with `multer.memoryStorage()`, 5MB file limit, and PDF MIME filter
- Built `resumeController.js` (`server/src/controllers/resumeController.js`) validating file presence and extracting metadata (`fileName`, `mimeType`, `fileSizeBytes`, `uploadedBy`, `uploadedAt`)
- Built resume router (`server/src/routes/resumeRoutes.js`) mounting `POST /api/resumes/upload` with `authenticate` and `uploadSingleResume` middleware
- Mounted `/resumes` sub-router in central API router (`server/src/routes/index.js`)
- Created automated integration test suite (`server/test/resumeUpload.test.js`) testing successful multipart PDF upload (201), non-PDF rejection (400 `INVALID_FILE_TYPE`), missing file payload rejection (400 `FILE_MISSING`), and unauthenticated access rejection (401 `TOKEN_MISSING`)

### Architecture Decisions
- **In-Memory Storage Buffering**: Using `multer.memoryStorage()` retains uploaded files as memory `Buffer` instances (`req.file.buffer`), avoiding temporary disk I/O latency and disk cleanup management during subsequent text extraction (Day 14).
- **Two-Tier Authentication & Upload Middleware Chain**: Enforcing `authenticate` before `uploadSingleResume` ensures unauthenticated uploads are rejected before binary payloads are parsed into server memory.

### Learning
- **Multipart Form Encoding**: Understanding how browsers partition binary files and fields using boundary strings in `multipart/form-data` requests.
- **Multer Memory vs Disk Storage**: Trade-offs between memory buffering (ideal for short-lived PDF text extraction < 5MB) and disk streaming (for multi-gigabyte video/asset storage).

---

## Day 13 — PDF Magic-Byte Validation & Minimum Size Enforcement

**Date**: 2026-09-07

### Implemented
- Created `pdfValidator.js` utility (`server/src/utils/pdfValidator.js`) exporting `validatePdfBuffer(buffer)` that verifies PDF magic bytes (`%PDF-`) and enforces a configurable minimum file size (default 500 bytes)
- Added `minFileSizeBytes` configuration option to `server/src/config/environment.js` (configurable via `MIN_FILE_SIZE_BYTES` env var, defaults to 500)
- Integrated post-Multer buffer validation into `uploadMiddleware.js` — after Multer parses the multipart stream, the buffer is checked for magic bytes and minimum size before control passes to the controller
- Introduced two new error codes: `INVALID_MAGIC_BYTES` (file header does not start with `%PDF-`) and `FILE_TOO_SMALL` (file below minimum byte threshold)
- Extended integration test suite (`server/test/resumeUpload.test.js`) with two new test cases:
  - Corrupted PDF rejection (valid MIME but invalid content → 400 `INVALID_MAGIC_BYTES`)
  - Undersized PDF rejection (valid header but < 500 bytes → 400 `FILE_TOO_SMALL`)
- Padded existing success test mock PDF to exceed 500 bytes, ensuring it passes the new minimum size validation

### Architecture Decisions
- **Post-Multer Validation Pipeline**: Magic-byte and size checks run *after* Multer has parsed the stream into an in-memory buffer, keeping the validation decoupled from stream parsing. This avoids duplicating Multer's file-type filter while adding a deeper content-integrity layer.
- **Configurable Minimum Size**: The 500-byte threshold is exposed as `MIN_FILE_SIZE_BYTES` env var rather than a hardcoded constant, allowing deployment-specific tuning without code changes.
- **Validation Utility Separation**: `pdfValidator.js` is a standalone pure function with no side effects, making it independently testable and reusable for future file-processing pipelines.

### Learning
- **PDF Magic Bytes**: Every conforming PDF begins with the 5-byte ASCII sequence `%PDF-`, followed by a version number (e.g., `1.4`, `2.0`). Checking this header is the most reliable way to verify file authenticity beyond MIME-type metadata, which can be spoofed.
- **Buffer.subarray vs Buffer.slice**: `subarray()` returns a view over the same memory (no copy), making it the preferred method for header inspection over `slice()` which creates a copy in older Node versions.

---

## Day 14 — PDF Text Extraction with pdf-parse

**Date**: 2026-09-15

### Implemented
- Installed `pdf-parse` v2 (`npm install pdf-parse`) — a fully typed, ESM-native wrapper around `pdfjs-dist`
- Created `pdfExtractor.js` service (`server/src/services/pdfExtractor.js`) exporting `extractTextFromPdf(buffer)` which:
  - Converts the Multer `Buffer` to `Uint8Array` for pdfjs compatibility
  - Calls `PDFParse.getText()` to extract full page text with whitespace normalisation
  - Calls `PDFParse.getInfo()` in a separate parser instance to extract document metadata (PDFFormatVersion, author, title, etc.)
  - Returns `{ text, wordCount, charCount, pageCount, pdfVersion, info }`
  - Always `destroy()`s both parser instances to free pdfjs memory
- Updated `resumeController.js` to call `extractTextFromPdf` after the upload pipeline:
  - On parse failure (corrupt / password-protected / image-only PDF) returns `422 PDF_PARSE_ERROR`
  - On success returns `201` with `status: 'extracted'` and an `extraction` object in the response body
- Created `pdfExtraction.test.js` (`server/test/pdfExtraction.test.js`) with 4 integration tests:
  - Extraction fields (text, wordCount, charCount, pageCount, pdfVersion) are present
  - Extracted text contains words from the embedded PDF content stream
  - Word count matches the number of tokens embedded in the PDF
  - `pdfVersion` field is always returned

### Architecture Decisions
- **Service Layer**: Extraction logic lives in `server/src/services/` (not the controller), keeping the controller thin and making the extractor independently testable and reusable for future batch processing or re-extraction jobs.
- **Separate Parser Instances for getText / getInfo**: `PDFParse` v2 caches `this.doc` after the first `load()`. Sharing one instance between `getText()` and `getInfo()` works but risks subtle state issues; two short-lived instances are safer and the overhead is negligible for < 5 MB files.
- **422 for Parse Failure**: A `422 Unprocessable Entity` is semantically correct — the file was received and validated structurally (magic bytes ✓, size ✓) but the server cannot process its content.

### Learning
- **pdf-parse v2 API**: The v2 package is a complete rewrite using a class-based API (`PDFParse`). The buffer must be passed as `{ data: Uint8Array }` in the constructor options (forwarded to `pdfjs.getDocument()`). The old v1 function-call style `pdfParse(buffer)` no longer exists.
- **pdfjs Text Extraction**: `getTextContent()` returns `TextItem[]` with `str`, `transform`, and `hasEOL` properties. The pdf-parse `getPageText()` helper assembles these into readable lines while respecting spatial layout.









