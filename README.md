# FinTrack Edu

FinTrack Edu is a role-based FinTech learning and career ecosystem for students, mentors, and recruiters. The current repository contains a React/Vite client and an Express/Mongoose API with JWT authentication, role-based access control, learning workflows, mentor workflows, and an in-progress recruiter and career ecosystem.

## 1. Project Overview

FinTrack Edu brings together structured FinTech learning, practical exercises, assessments, mentor support, verified skills, and recruiter workflows in one platform.

The intended learning and hiring flow is:

```text
Student
  |
  v
Learning
  |
  v
Practice
  |
  v
Assessment
  |
  v
Skills and performance
  |
  v
Career readiness
  |
  v
Jobs
  |
  v
Recruiter
```

Students can discover courses, work through lessons, track progress, practice FinTech problems, complete assessments, and review performance. Mentors can work with students through student directories, mentorship requests, sessions, availability, profiles, and messages. Recruiters can review dashboard data, manage jobs, discover candidates, and inspect candidate 360-degree profiles. The student career UI and several recruiter workflow UIs remain in progress.

## 2. Key Features

### Student

Implemented or clearly present:

- Registration, login, OTP verification, password reset, and authenticated sessions
- Student dashboard
- Course discovery and course details
- Learning player with lesson progress and notes
- My Courses and enrollment workflows
- Learning Path
- Student progress and performance views
- Practice Zone, practice questions, submissions, and results
- Assessment Center, assessment details, attempts, and results
- Exams and Assignments views and assignment submission
- Notifications

Currently represented by placeholders or not yet implemented as a complete student career module:

- Live classes
- Mentor Connect student workflow
- Certificates
- Skill Tracker / student Skill Passport
- Student Career Profile
- Student Job Discovery
- Student Applications and application tracking

### Mentor

The mentor portal includes:

- Mentor dashboard
- Student directory
- Student 360-degree detail view
- Mentor Connect workspace
- Mentorship request accept/decline actions
- Mentor session listing, details, creation, status updates, and cancellation/rescheduling support
- Mentor messages and conversation threads
- Mentor profile
- Mentor availability management

Some additional navigation items still use the shared mentor placeholder page.

### Recruiter

Implemented frontend workflows:

- Recruiter dashboard
- Job listing and management
- Create job and save draft
- Publish and close job with confirmation
- Edit job
- Job details
- Search and filtering for jobs
- Candidate discovery
- Candidate search and filters
- Candidate 360-degree profile
- Candidate Skill Passport, performance, readiness, projects, certifications, badges, and application history display
- Transparent demo skill matching against active job requirements

Implemented recruiter backend/API surfaces:

- Recruiter dashboard
- Jobs
- Candidates
- Applications and application status updates
- Interviews
- Recruiter profile
- Recruiter messages

The recruiter applications, interview, messaging, and profile APIs exist, but their complete frontend management screens are not yet implemented. Candidate shortlist, reject, contact, and interview actions are navigation-ready or informational until those modules are completed.

## 3. System Architecture

### Frontend

- React 18
- Vite
- React Router DOM
- Redux Toolkit and React Redux
- Axios
- Tailwind CSS with PostCSS and Autoprefixer
- Lucide React icons

The browser calls relative `/api` URLs. Vite proxies those requests to the Express server at `http://localhost:5000` during development.

### Backend

- Node.js using ES modules
- Express.js
- Mongoose
- MongoDB
- CORS
- Morgan development logging
- Express Validator dependency
- `bcryptjs` password hashing
- `jsonwebtoken` JWT generation and verification
- `dotenv` environment configuration

### Authentication

Authentication is implemented with JWTs. The client stores the authenticated user and token in local storage, adds the bearer token through the Axios API interceptor, and redirects authenticated portal requests to `/login` after a `401` response.

The backend uses `protect` to validate JWTs and `authorizeRoles` to enforce role access.

### Google OAuth configuration

Google OAuth is an additional server-side authentication method. It uses the same FinTrack JWT, Redux auth state, local storage keys, protected routes, and role authorization as email/password login.

Configure these variables in `server/.env` using values from a Google Cloud OAuth 2.0 Web application:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Add the callback URL to the Google Cloud OAuth client's authorized redirect URIs. Start the backend and frontend normally. On the login page, **Continue with Google** authenticates an existing account. On the registration page, the selected role is sent to Google, verified profile data returns to the form, and the account is created only after the user completes the remaining FinTrack fields. Google users must have a verified email; a verified matching email never creates a duplicate or changes the stored role. The OAuth routes are `GET /api/auth/google`, `GET /api/auth/google/callback`, and `POST /api/auth/google/register`.

```text
Browser
   |
   v
React + Vite client
   |
   |  Axios /api requests
   v
Express REST API
   |
   +---- Authentication and JWT
   +---- Student APIs
   +---- Mentor APIs
   +---- Recruiter APIs
   +---- Seed and fallback data
   |
   v
MongoDB through Mongoose
```

## 4. User Roles and RBAC

### Student

Students can access the protected `/student/*` portal, learning APIs, practice APIs, assessment APIs, exam and assignment APIs, performance APIs, and the student dashboard. Student-only backend routes use `protect` and `authorizeRoles('student')`.

### Mentor

Mentors can access the protected `/mentor/*` portal, mentor dashboard, student directory, sessions, connect workspace, messages, profile, and availability workflows. Mentor-only backend routes use `protect` and `authorizeRoles('mentor')`.

### Recruiter

Recruiters can access the protected `/recruiter/*` portal. Current completed recruiter frontend areas are the dashboard, job management, candidate discovery, and candidate 360-degree profile. Recruiter backend routes cover dashboard, jobs, candidates, applications, interviews, profile, and messages. These routes use `protect` and `authorizeRoles('recruiter')`.

Client-side protection is implemented by:

- `ProtectedRoute`: redirects unauthenticated users to `/login`.
- `RoleRoute`: redirects users whose role is not allowed to `/unauthorized`.
- `Sidebar`: selects navigation entries based on the authenticated role.

Backend authorization remains authoritative even if a client route is accessed directly.

## 5. Project Structure

```text
fintrack-edu/
|
+-- client/
|   +-- index.html
|   +-- package.json
|   +-- package-lock.json
|   +-- vite.config.js
|   +-- tailwind.config.js
|   +-- postcss.config.js
|   +-- src/
|       +-- App.jsx and main.jsx
|       +-- components/
|       |   +-- common/       Shared buttons, forms, badges, dialogs, tables, and states
|       |   +-- layout/       App shell, sidebar, header, profile, notifications
|       |   +-- recruiter/    Recruiter-specific form components
|       +-- data/             Client fallback/demo data
|       +-- features/         Redux slices, including auth and student learning
|       +-- pages/
|       |   +-- auth/         Login, registration, OTP, reset, error pages
|       |   +-- landing/      Public landing page
|       |   +-- student/      Student learning, practice, assessment, and progress pages
|       |   +-- mentor/       Mentor portal pages
|       |   +-- recruiter/    Recruiter dashboard, jobs, candidates, and placeholders
|       +-- routes/           App routes and route guards
|       +-- services/         Axios-backed API and feature services
|       +-- store/            Redux store setup
|       +-- styles/           Tailwind entry and global CSS
|
+-- server/
|   +-- .env.example
|   +-- package.json
|   +-- package-lock.json
|   +-- server.js             Express application entry point
|   +-- config/db.js          MongoDB connection
|   +-- controllers/          Request handlers
|   +-- middleware/           JWT/RBAC and error middleware
|   +-- models/               Mongoose schemas
|   +-- routes/               Express route modules
|   +-- seed/                 In-memory feature seed/demo data
|   +-- services/             Email service abstraction
|   +-- utils/                Token, password, and database seed utilities
|
+-- README.md
+-- .gitignore
```

There is no root-level package.json. Install and run the client and server from their respective directories.

## 6. Breakpoint Implementation

### BP1 — Foundation and Authentication

**Objective:** Establish the application shell, authentication, user roles, shared navigation, and dashboards.

**Implemented:** React/Vite foundation, Express API, registration, login, OTP verification, password reset flows, JWT authentication, role guards, shared layouts, role sidebars, and student/mentor/recruiter dashboard entry points.

**Status:** COMPLETED for the current foundation scope.

### BP2 — Student Learning Ecosystem

**Objective:** Provide structured FinTech course learning and progress tracking.

**Implemented:** Course discovery, course details, learning player, enrollment, My Courses, lesson completion, wishlist, learning path, progress, and learning-related dashboard data.

**Status:** COMPLETED for the implemented learning scope. Some additional navigation such as live classes remains placeholder functionality.

### BP3 — Practice and Assessment

**Objective:** Add practical FinTech exercises, assessments, exams, assignments, and performance views.

**Implemented:** Practice overview, practice sessions and submissions, assessment center, assessment attempts and results, exams and assignments, assignment submission, and student performance.

**Status:** COMPLETED for the implemented practice and assessment scope.

### BP4 — Mentor Ecosystem

**Objective:** Connect mentors with students through guidance, sessions, availability, and messaging.

**Implemented:** Mentor dashboard, student directory and detail view, connect workspace, mentorship request actions, sessions, session creation and updates, mentor messages, mentor profile, and availability.

**Status:** IN PROGRESS / largely implemented. Several non-core mentor navigation entries still use placeholders.

### BP5 — Recruiter and Career Ecosystem

**Objective:** Add recruiter hiring workflows and student career readiness workflows.

**Implemented:** Recruiter dashboard, recruiter job management frontend, mounted recruiter job APIs, candidate discovery frontend, candidate 360-degree profile frontend, mounted candidate APIs, recruiter seed data, and backend API scaffolding for applications, interviews, messages, and recruiter profile.

**Status:** IN PROGRESS. Recruiter application, interview, messaging, and profile UIs are not complete. Student career, student Skill Passport, job discovery, applications, and application tracking are not complete and currently include placeholders or seed-only data.

## 7. Frontend Routes

### Public and authentication

- `/`
- `/login`
- `/register`
- `/verify-otp`
- `/forgot-password`
- `/reset-password`
- `/unauthorized`

### Student

- `/student/dashboard`
- `/student/courses`
- `/student/courses/:courseId`
- `/student/learn/:courseId/:lessonId`
- `/student/my-courses`
- `/student/learning-path`
- `/student/progress`
- `/student/performance`
- `/student/practice`
- `/student/practice/:practiceId`
- `/student/practice/:practiceId/result`
- `/student/assessments`
- `/student/assessments/:assessmentId`
- `/student/assessments/:assessmentId/start`
- `/student/assessments/:assessmentId/result`
- `/student/exams`
- `/student/assignments`
- `/student/live-classes`
- `/student/mentors`
- `/student/certificates`
- `/student/skills`
- `/student/leaderboard`
- `/student/career`
- `/student/notifications`
- `/student/settings`
- `/student/support`

Several routes in the latter group currently render `StudentPlaceholder`.

### Mentor

- `/mentor/dashboard`
- `/mentor/students`
- `/mentor/students/:studentId`
- `/mentor/sessions`
- `/mentor/sessions/new`
- `/mentor/sessions/:sessionId`
- `/mentor/connect`
- `/mentor/messages`
- `/mentor/profile`
- `/mentor/availability`
- `/mentor/live-classes`
- `/mentor/assessments`
- `/mentor/progress`
- `/mentor/notifications`
- `/mentor/settings`
- `/mentor/support`

Several latter routes currently render `MentorPlaceholder`.

### Recruiter

- `/recruiter/dashboard`
- `/recruiter/candidates`
- `/recruiter/candidates/:candidateId`
- `/recruiter/jobs`
- `/recruiter/jobs/new`
- `/recruiter/jobs/:jobId`
- `/recruiter/jobs/:jobId/edit`
- `/recruiter/students`
- `/recruiter/skill-profiles`
- `/recruiter/internships`
- `/recruiter/placement`
- `/recruiter/messages`
- `/recruiter/notifications`
- `/recruiter/settings`
- `/recruiter/support`

The recruiter dashboard, candidates, candidate profile, and jobs routes have implemented frontend screens. Several other recruiter routes currently render `RecruiterPlaceholder`.

## 8. API Endpoints

The backend is mounted from `server/server.js` under `/api`.

### Health

- `GET /api/health`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me` — protected

### User dashboards

- `GET /api/users/student/dashboard` — student role
- `GET /api/users/mentor/dashboard` — mentor role
- `GET /api/users/recruiter/dashboard` — recruiter role

### Courses

- `GET /api/courses`
- `GET /api/courses/learning-path`
- `GET /api/courses/:courseId`

### Student learning — student role

- `GET /api/student/learning/enrolled`
- `POST /api/student/learning/enroll`
- `POST /api/student/learning/courses/:courseId/lessons/:lessonId/complete`
- `GET /api/student/learning/wishlist`
- `POST /api/student/learning/wishlist/toggle`
- `GET /api/student/learning/progress-stats`

### Student practice — student role

- `GET /api/practice/overview`
- `POST /api/practice/start`
- `POST /api/practice/:practiceId/submit`

### Student assessments — student role

- `GET /api/assessments`
- `GET /api/assessments/:assessmentId`
- `POST /api/assessments/:assessmentId/start`
- `POST /api/assessments/:assessmentId/submit`

### Student exams and assignments — student role

- `GET /api/student/exams-assignments`
- `POST /api/student/exams-assignments/assignments/:assignmentId/submit`

### Student performance — student role

- `GET /api/student/performance`

### Notifications — authenticated users

- `GET /api/notifications`
- `PUT /api/notifications/:id/read`

### Mentor — mentor role

- `GET /api/mentor/dashboard`
- `GET /api/mentor/students`
- `GET /api/mentor/students/:studentId`
- `GET /api/mentor/connect`
- `POST /api/mentor/connect/requests/:requestId`
- `GET /api/mentor/sessions`
- `POST /api/mentor/sessions/new`
- `GET /api/mentor/sessions/:sessionId`
- `PUT /api/mentor/sessions/:sessionId`
- `GET /api/mentor/messages/conversations`
- `GET /api/mentor/messages/thread/:studentId`
- `POST /api/mentor/messages/send`
- `GET /api/mentor/profile`
- `PUT /api/mentor/profile`
- `GET /api/mentor/availability`
- `PUT /api/mentor/availability`

### Recruiter — recruiter role

- `GET /api/recruiter/dashboard`
- `GET /api/recruiter/jobs`
- `POST /api/recruiter/jobs`
- `GET /api/recruiter/jobs/:jobId`
- `PUT /api/recruiter/jobs/:jobId`
- `GET /api/recruiter/candidates`
- `GET /api/recruiter/candidates/:candidateId`
- `GET /api/recruiter/applications`
- `PUT /api/recruiter/applications/:applicationId/status`
- `GET /api/recruiter/interviews`
- `POST /api/recruiter/interviews`
- `GET /api/recruiter/interviews/:interviewId`
- `PUT /api/recruiter/interviews/:interviewId`
- `GET /api/recruiter/profile`
- `PUT /api/recruiter/profile`
- `GET /api/recruiter/messages`
- `GET /api/recruiter/messages/conversations`
- `GET /api/recruiter/messages/thread/:candidateId`
- `POST /api/recruiter/messages/send`

The recruiter APIs currently use seeded in-memory data for these workflows. The jobs and candidate frontend services call the mounted recruiter API paths and provide demo fallback data when the API is unavailable.

## 9. Database Models

The server contains the following Mongoose models:

- `User` — account identity, credentials, role, verification, and status
- `StudentProfile` — student academic and learning profile data
- `MentorProfile` — mentor organization, expertise, and profile statistics
- `RecruiterProfile` — recruiter company and hiring profile data
- `Settings` — user settings data
- `Course` — course metadata and learning content
- `Enrollment` — student course enrollment and progress relationship
- `Wishlist` — student saved courses
- `Assessment` — assessment definitions
- `AssessmentAttempt` — student assessment attempt and result data
- `Question` — practice or assessment question data
- `PracticeSession` — student practice session data
- `Assignment` — assignment definitions
- `AssignmentSubmission` — student assignment submissions
- `Notification` — user notifications and read state
- `MentorAvailability` — mentor availability schedules
- `MentorSession` — mentor and student session bookings
- `MentorshipRequest` — mentorship connection requests
- `MentorMessage` — mentor messaging records
- `Job` — recruiter job postings and status/count fields
- `JobApplication` — candidate applications and pipeline status
- `CandidateProfile` — candidate education, career preferences, skills, and readiness
- `SkillPassport` — verified skills, certifications, projects, and badges
- `Interview` — recruiter interview scheduling and status
- `RecruiterMessage` — recruiter-candidate message records

The current recruiter controllers also expose seeded demo records from `server/seed/recruiterSeedData.js`; not every current UI/API workflow persists records through its Mongoose model yet.

## 10. Technology Stack

| Technology | Purpose |
| --- | --- |
| React 18 | Frontend UI |
| Vite | Frontend development server and production bundling |
| React Router DOM | Client-side routing |
| Redux Toolkit | Client state management |
| React Redux | React bindings for Redux |
| Axios | HTTP client and API interceptors |
| Tailwind CSS | Utility-first styling |
| PostCSS | CSS processing |
| Autoprefixer | CSS vendor prefixing |
| Lucide React | UI icons |
| Node.js | Backend runtime |
| Express.js | REST API server |
| MongoDB | Database |
| Mongoose | MongoDB ODM and schemas |
| JSON Web Token | Authentication tokens |
| bcryptjs | Password hashing and verification |
| CORS | Cross-origin API configuration |
| Morgan | Development HTTP request logging |
| dotenv | Environment variable loading |
| express-validator | Request validation dependency |
| nodemon | Backend development restart tool |

## 11. Prerequisites

- Node.js: use a current compatible Node.js version.
- npm.
- MongoDB for database-backed operation. The server attempts `mongodb://127.0.0.1:27017/fintrack_edu` by default and can fall back to development/mock responses when the database is unavailable.
- A browser for the Vite client.
- One terminal for `npm run dev`; the root script starts both client and server processes.

## 12. Environment Variables

The server reads environment variables through `dotenv`. Copy `server/.env.example` to `server/.env` and replace placeholders with local values. Never commit `server/.env` or real credentials.

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/fintrack_edu
JWT_SECRET=replace_with_a_local_secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
MOCK_MODE=true
```

Variables used by the server configuration include:

- `PORT` — Express listening port; defaults to `5000`.
- `NODE_ENV` — controls development logging behavior.
- `MONGO_URI` — MongoDB connection string; defaults to the local database above.
- `JWT_SECRET` — JWT signing secret; use a private local value.
- `JWT_EXPIRE` — JWT expiration setting; defaults to `30d` in token generation.
- `CLIENT_URL` — allowed CORS origin; defaults to `http://localhost:5173`.
- `MOCK_MODE` — present in the supplied environment example. Current fallback behavior is primarily selected from database connectivity and controller fallback logic.

Do not place passwords, tokens, private MongoDB credentials, or production secrets in this README.

## 13. Installation and Running

The root workspace provides one-command full-stack development startup through `concurrently`.

### Install

From the project root:

```bash
npm install
```

This installs the root development runner. To install all root, client, and server dependencies in one step, use:

```bash
npm run install-all
```

The existing package-local installation workflow remains available:

```bash
cd server
npm install

cd ../client
npm install
```

### Configure the server

```bash
copy server\.env.example server\.env
```

On macOS/Linux, use:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with local MongoDB and JWT settings.

### Seed the development users and profiles

From the repository root:

```bash
cd server
npm run seed
```

The seed utility connects to MongoDB, clears existing `User`, `StudentProfile`, `MentorProfile`, and `RecruiterProfile` documents, and creates the three development role accounts. It does not seed every course, mentor, or recruiter demo record into MongoDB; those feature datasets are also available through the server seed modules and controller fallback paths.

### Start the full application

From the project root:

```bash
npm run dev
```

This starts both processes concurrently:

- `[CLIENT]` — Vite frontend at `http://localhost:5173`
- `[SERVER]` — Express API at `http://localhost:5000`

The Vite development proxy forwards `/api` requests to the backend. MongoDB is used by the backend when available; the existing development/mock fallback behavior remains unchanged.

### Start the backend only

```bash
npm run server
```

This runs the existing server development command, `nodemon server.js`. The API listens on `http://localhost:5000` by default.

### Start the frontend only

```bash
npm run client
```

This runs the existing Vite development command. The client listens on `http://localhost:5173`.

For automatic restarts during backend development, use `npm run server` or run `npm run dev` for the complete application.

### Build the frontend

```bash
npm run build
```

The production output is written to `client/dist/`.

### Preview the production build

```bash
npm run preview --prefix client
```

### Lint status

The client declares an `npm run lint` script, but the current client package does not include an ESLint dependency or executable. Running the script in the current repository therefore requires ESLint to be installed/configured separately.

## 14. Development Notes

- The backend can operate with seeded/mock controller data when MongoDB is unavailable, but persistence-dependent flows require MongoDB.
- The Axios client uses `baseURL: '/api'` and attaches `localStorage` values named `fintrack_token` and `fintrack_user`.
- Recruiter and student pages must remain protected by both client route guards and backend role middleware.
- The current repository has no Git metadata at its root in this workspace, so Git history and status are not available here.
- `client/dist/` is generated output and should not be committed.
