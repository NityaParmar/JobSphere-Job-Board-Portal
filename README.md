# JobSphere — Enterprise Career Portal & ATS

A full-stack job board and applicant tracking system built with modern web technologies. Designed for both **candidates** seeking opportunities and **employers** managing their hiring pipeline.

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 18 · Vite · Tailwind CSS     |
| Backend    | Express.js · Node.js               |
| Database   | MongoDB · Mongoose ODM             |
| Storage    | Supabase Storage (private buckets) |
| Auth       | JWT (Bearer token)                 |
| Deployment | Vercel (frontend) · Render (API)   |

## Features

### Candidate Portal
- Browse and search jobs with filters (keyword, location, salary, employment type, tech stack)
- Two-pane split job feed with inline detail view
- Apply with PDF resume upload (stored securely in Supabase private bucket)
- Track application status (Pending → Interview → Accepted/Rejected)
- Save/bookmark jobs for later

### Employer Portal
- Post and manage job requisitions
- Visual applicant pipeline with status management
- View candidate profiles and download resumes via time-limited signed URLs
- Company profile management
- Dashboard with hiring metrics

## Project Structure

```
cms/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   └── pages/          # Page-level components
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database & storage configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, upload, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express route definitions
│   │   └── utils/          # Shared utilities
│   └── ...
└── vercel.json             # Deployment configuration
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Supabase project with a private `resumes` bucket

### Installation

```bash
# Clone the repository
git clone https://github.com/NityaParmar/JobSphere-Job-Board-Portal.git
cd JobSphere-Job-Board-Portal

# Install backend dependencies
cd server
npm install
cp .env.example .env
# Edit .env with your credentials

# Install frontend dependencies
cd ../client
npm install

# Start development servers
cd ../server && npm run dev    # API on :5000
cd ../client && npm run dev    # Frontend on :5173
```

### Environment Variables

#### Backend (`server/.env`)
| Variable                   | Required | Description                       |
| -------------------------- | -------- | --------------------------------- |
| `MONGO_URI`                | ✅        | MongoDB connection string         |
| `JWT_SECRET`               | ✅        | Secret for signing JWT tokens     |
| `SUPABASE_URL`             | ✅        | Supabase project URL              |
| `SUPABASE_SERVICE_ROLE_KEY`| ✅        | Supabase service role key         |
| `CLIENT_URL`               | ✅        | Frontend URL (for CORS)           |
| `PORT`                     | ❌        | Server port (default: 5000)       |
| `NODE_ENV`                 | ❌        | Environment (default: development)|

#### Frontend (`client/.env.production`)
| Variable       | Required | Description               |
| -------------- | -------- | ------------------------- |
| `VITE_API_URL` | ✅        | Backend API base URL      |

## Demo Accounts

After running `npm run seed` in the server directory:

| Role      | Email                          | Password      |
| --------- | ------------------------------ | ------------- |
| Employer  | employer.demo@jobsphere.dev    | DemoPass123!  |
| Candidate | candidate.demo@jobsphere.dev   | DemoPass123!  |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive JWT

### Jobs
- `GET /api/jobs` — List jobs (with filters & pagination)
- `GET /api/jobs/:id` — Get job details
- `POST /api/jobs` — Create job (Employer)
- `PUT /api/jobs/:id` — Update job (Employer)
- `DELETE /api/jobs/:id` — Delete job (Employer)

### Applications
- `POST /api/applications` — Apply to job with resume (Candidate)
- `GET /api/applications/my` — Get my applications (Candidate)
- `GET /api/applications/job/:jobId` — Get applicants (Employer)
- `PATCH /api/applications/:id/status` — Update status (Employer)
- `GET /api/applications/:id/resume` — Get signed resume URL

## License

ISC
