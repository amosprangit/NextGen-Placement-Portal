# NextGen CareerConnect — Frontend

React + Vite + Tailwind frontend for the university placement portal, wired
to the companion `careerconnect-backend` (MERN) API. Three role-based
dashboards — **Student**, **Recruiter**, **Admin (Placement Cell)** — sit
behind a shared login, in the blue → violet → magenta gradient / light
lavender color scheme.

## Getting started

```bash
npm install
cp .env.example .env      # points VITE_API_URL at your backend
npm run dev                 # http://localhost:5173
```

Expects the backend running at `http://localhost:5000` (see `careerconnect-backend`
— `npm run dev` there, after `npm run seed` to create the first admin account).

## How the two projects connect

- `src/lib/api.js` — a single axios instance, attaches `Authorization: Bearer <token>`
  from `localStorage` to every request, normalizes the backend's
  `{ success, message, data, errors }` envelope into plain JS values/errors.
- `src/lib/authApi.js` / `src/lib/resourceApi.js` — one function per backend
  route — the single source of truth for what the API expects/returns.
  File downloads (Excel export) go through axios as a blob rather than a
  plain `<a href>`, since the route is auth-protected and a raw link
  wouldn't carry the JWT.
- `src/context/AuthContext.jsx` — holds the logged-in user + role profile,
  hydrates from `GET /api/auth/me` on load, exposes `login/registerStudent/registerRecruiter/logout`.
- `src/components/ProtectedRoute.jsx` + `DashboardLayout.jsx` — gate routes
  by role and render the right sidebar nav.

## Structure

```
src/
  lib/                 API client + per-resource API modules + formatters
  context/AuthContext.jsx
  components/
    landing/             marketing page sections
    ui/primitives.jsx     shared Button/Input/Card/Badge/etc, on the brand palette
    layout/DashboardLayout.jsx
    ProtectedRoute.jsx
    ApplicantsTable.jsx    shared applicant roster table (admin + recruiter)
    DriveAnalyticsChart.jsx  recharts bar chart: registered/present/absent/interviewed
    ExportPanel.jsx          Excel download + (admin-only) email-export form
  pages/
    LandingPage.jsx, LoginPage.jsx, RegisterStudentPage.jsx, RegisterRecruiterPage.jsx
    student/    Overview, Drives, DriveDetail (apply w/ optional per-drive resume),
                Applications, Profile (resume + NOC upload)
    recruiter/  Overview, Drives, DriveForm (create), DriveManage (status, chart,
                applicants table, Excel download), Profile
    admin/      Dashboard (stats), Students (NOC filter + reminder emails),
                Recruiters (approve/reject), Drives (approve + oversight),
                DriveDetail (company/recruiter info, chart, applicants,
                Excel download + email export), Profile (own details, change
                password, create another admin, see the placement-cell roster)
```

## Role flows implemented

- **Student**: register → complete profile (resume + optional NOC upload) →
  browse eligible open drives → apply (optionally with a drive-specific
  resume) → track status → withdraw while still "applied".
- **Recruiter**: register → wait for admin approval → post a drive (starts
  as `draft`) → once approved/open, review applicants in a table (contact
  info, resume download), mark attendance and interview status, move them
  through the pipeline, see a live chart of registered/present/absent/interviewed,
  download the roster as Excel.
- **Admin**: dashboard stats → approve/reject recruiters → approve drafted
  drives → open any drive's detail page to see the company + recruiter who
  posted it, the same analytics chart, the full applicant table, and both
  download and **email** the roster as Excel to any address → manage the
  student roster, filter by NOC status, and send a reminder email to anyone
  missing one → maintain their own profile and create further admin accounts
  (the only way new admins get made besides the initial seed script).

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- Email features (NOC reminders, Excel-via-email) depend on the backend's
  `SMTP_*` env vars being set. Without them, the backend logs the email to
  its console instead of failing, so the UI flow still works end-to-end in
  local development — you'll just see a "SMTP not configured" message
  instead of an actual inbox delivery.

## Latest update — new pages & fixes

- **Student profile is now two pages**: `/student/profile` is a
  social-media-style read view (cover, avatar, stats, skills, documents),
  `/student/profile/edit` is the editing form — now also collecting
  course, class, section, and semester.
- **Admin → Students** rows are clickable, leading to a full profile page
  (`/admin/students/:id`) with placement-status editing, NOC/resume
  downloads, a "send NOC reminder" button, and the student's full
  application history. Added a **Course** filter (BCA/MCA/B.Tech/...)
  alongside the existing NOC-status filter.
- **Forgot/reset password**: a "Forgot password?" link on the login page
  leads to `/forgot-password` → emailed link → `/reset-password/:token`.
- Fixed a backend bug (`Drive` model index) that caused every recruiter's
  first drive submission to fail with "cannot index parallel arrays" —
  see the backend README for details.
