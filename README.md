# 💼 JobSphere — Production-Ready Job Board & Career Portal

[![Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://react.dev)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8.svg)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://mongoosejs.com)
[![AWS S3](https://img.shields.io/badge/AWS-S3%20SDK%20v3-FF9900.svg)](https://aws.amazon.com/s3)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**JobSphere** is a high-performance, full-stack Job Board and Career Portal built with modern web architecture standards. It combines a robust **Express.js & MongoDB** backend with a responsive **React 19 & Tailwind CSS** frontend, featuring strict **Role-Based Access Control (RBAC)**, **MongoDB Text Indexes**, and **AWS S3 private file storage with pre-signed URLs and atomic delete rollback**.

---

## 🚀 Key Features

### 1. 🛡️ Strict Role-Based Access Control (RBAC)
- **Two Distinct Roles**: `CANDIDATE` (Job Seeker) and `EMPLOYER` (Hiring Company).
- **JWT Protection**: Cryptographically signed JSON Web Tokens storing user identity and role.
- **Enforced Authorization Guards**: 
  - Candidates are prohibited from creating, modifying, or deleting jobs (HTTP `403 Forbidden`).
  - Employers cannot submit job applications to open positions (HTTP `403 Forbidden`).
- **Resource Ownership Verification**: Employers can only edit, pause, or remove jobs they authored.

### 2. ⚡ Advanced Search & Indexed Queries
- **Weighted MongoDB Text Indexes**: Replaced resource-heavy `$regex` queries with native text indexes (`title`: 3× weight, `location`: 1× weight).
- **Multi-Field Filter Stacking**: Search keywords, minimum salary thresholds (`$gte`), tech stack tag matching (`$in`), employment type, and experience levels in a unified query.
- **Server-Side Pagination**: Efficient pagination via `skip()` and `limit()` with parallel document counts.

### 3. ☁️ Private AWS S3 Resume Storage & Atomic Rollback
- **Private Bucket Architecture**: Resume files are never exposed through public S3 URLs.
- **Time-Limited Pre-signed URLs**: Secure 15-minute access tokens generated via `GetObjectCommand` accessible only by the applicant and the authorized employer.
- **Atomic Rollback on Failure**: If MongoDB fails to create the application record after file upload, `DeleteObjectCommand` automatically purges the orphaned file from S3.
- **Strict File Validation**: Multer with `memoryStorage()`, enforcing PDF-only MIME/extension validation and a 5MB size limit.

### 4. 🏢 High-Density Enterprise SaaS Interface (React 19 + Tailwind)
- **Utilitarian Aesthetic**: Zero AI slop—emulates the dense, utilitarian, high-trust aesthetic of modern enterprise portals (Linear, Wellfound, Stripe, GitHub Jobs) with a neutral monochrome zinc palette and classic enterprise navy accents.
- **Two-Pane Split Job Feed (`/jobs`)**: Scrollable compact job cards on the left pane and a sticky live detail view on the right pane with discrete filter controls (search keywords, location, salary range, and tech stack multi-select pills).
- **Candidate Hub**:
  - Track submitted applications with restrained status badges (`PENDING`, `INTERVIEW`, `ACCEPTED`, `REJECTED`).
  - Securely preview PDF resumes via pre-signed S3 links (with zero-cost local fallback).
  - Manage bookmarked roles and candidate profile/skills.
- **Employer Management Hub**:
  - Clean data `<table>` layout with Active vs Archived tabs.
  - Slide-over **Applicant Drawer** showing all candidates per job with matching tech skills, status toggles, and resume inspection.
- **Purpose-Built Drag & Drop Modal**: Styled cleanly with an explicit dashed border (`border-dashed border-zinc-300`) and real file validation state.
- **One-Click Demo Fill**: Quick login shortcuts for evaluators to test Candidate and Employer workflows without manually registering accounts.

---

## 📂 Project Architecture

```
cms/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection & reconnect handlers
│   │   │   └── s3.js                 # AWS S3 client, pre-signed URLs, rollback helper
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Register, login, getMe, updateProfile
│   │   │   ├── job.controller.js     # Full CRUD, $text search, filters, pagination
│   │   │   └── application.controller.js # S3 upload, rollback, applicant review
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT protect & authorize(...roles)
│   │   │   ├── errorHandler.js       # Centralized error handler
│   │   │   └── upload.js             # Multer PDF memoryStorage (5MB max)
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt password hashing
│   │   │   ├── Job.js                # Job schema with weighted text index & salary hook
│   │   │   └── Application.js        # Compound unique index (job + candidate)
│   │   ├── routes/
│   │   │   ├── auth.routes.js        # Authentication endpoints
│   │   │   ├── job.routes.js         # Public & employer job endpoints
│   │   │   └── application.routes.js # Candidate & employer application endpoints
│   │   ├── utils/
│   │   │   └── ApiError.js           # Standardized API error class
│   │   └── index.js                  # Express bootstrap with CORS, helmet & morgan
│   ├── seed.js                       # Comprehensive database seed script
│   ├── test_auth.js                  # Phase 2 auth & RBAC integration tests
│   ├── test_jobs.js                  # Phase 3 search & filter integration tests
│   ├── test_applications.js          # Phase 4 S3 & application integration tests
│   ├── test_e2e_portal.js            # Phase 5 E2E portal test suite (16/16 passing)
│   └── package.json
└── client/
    ├── src/
    │   ├── api/
    │   │   ├── client.js             # Axios instance with Bearer interceptors
    │   │   ├── auth.api.js           # Auth API service
    │   │   ├── job.api.js            # Job API service
    │   │   └── application.api.js    # Application API service
    │   ├── components/
    │   │   ├── ui/                   # Badges, Buttons, Inputs primitives
    │   │   ├── Navbar.jsx            # Enterprise navbar with role badges & mobile menu
    │   │   ├── Footer.jsx            # Utilitarian footer
    │   │   ├── JobCard.jsx           # High-density job card with tech chips
    │   │   ├── ApplyModal.jsx        # Purpose-built drag & drop PDF resume upload modal
    │   │   ├── JobFormModal.jsx      # Employer job requisition create / edit modal
    │   │   ├── ApplicantDrawer.jsx   # Slide-over applicant pipeline panel
    │   │   └── ProtectedRoute.jsx    # React Router role-based route guard
    │   ├── context/
    │   │   └── AuthContext.jsx       # Authentication state, session sync, saved jobs
    │   ├── pages/
    │   │   ├── JobFeedPage.jsx       # Two-pane split job feed with live detail view
    │   │   ├── LoginPage.jsx         # Enterprise login with quick demo shortcuts
    │   │   ├── RegisterPage.jsx      # Register with role selector (Candidate vs Employer)
    │   │   ├── CandidateDashboard.jsx# Applications tracker, saved jobs, profile editing
    │   │   └── EmployerDashboard.jsx # Data table layout, active/archived tabs, drawer
    │   ├── App.jsx                   # React Router routing
    │   ├── main.jsx                  # React DOM mount
    │   └── index.css                 # Utilitarian enterprise design system
    ├── vite.config.js                # Port 5173 with proxy to backend port 5000
    ├── tailwind.config.js            # Tailwind configuration
    └── package.json
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI
- **AWS Account** *(Optional for local dev)*: S3 bucket and credentials for file uploads

---

### 1. Clone Repository

```bash
git clone https://github.com/NityaParmar/JobSphere-Job-Board-Portal.git
cd JobSphere-Job-Board-Portal
```

---

### 2. Backend Setup (`server/`)

```bash
cd server
npm install
```

Create a `.env` file in `server/` (or copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/job_board
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: AWS S3 configuration
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=
```

#### Seed the Database with Realistic Roles & Demo Accounts:
```bash
npm run seed
```

#### Start Backend Server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 3. Frontend Setup (`client/`)

In a new terminal:

```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Demo Accounts

For immediate evaluation, use the one-click demo login buttons on `http://localhost:5173/login` or log in manually:

| Role | Email | Password | Included Demo Features |
|---|---|---|---|
| **Candidate** | `candidate.demo@jobsphere.dev` | `DemoPass123!` | 2 submitted applications, 2 bookmarked jobs, full profile with skills |
| **Employer** | `employer.demo@jobsphere.dev` | `DemoPass123!` | 8 active job postings, applicant review pipeline, status changers |

---

## 🧪 Testing & Verification

Run the automated test suites inside the `server/` directory:

```bash
# 1. Auth & RBAC Tests (14 tests)
node test_auth.js

# 2. Job Search, Text Index & Filter Tests (45 tests)
node test_jobs.js

# 3. Application & S3 Unit Tests (12 tests)
node test_applications.js

# 4. Full End-to-End Verification Suite (16 checks)
node test_e2e_portal.js
```

### Production Build Test:
```bash
cd client
npm run build
```

---

## 📜 License

This project is open-source and licensed under the [MIT License](LICENSE).
