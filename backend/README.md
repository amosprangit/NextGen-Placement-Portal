# NextGen CareerConnect — Backend (MERN)

Node.js / Express / MongoDB (Mongoose) API for the university placement
portal, with three role-based dashboards in mind: **Student**,
**Recruiter**, and **Admin (Placement Cell)**.

## Stack & security choices

- **Express** — HTTP layer
- **MongoDB + Mongoose** — data layer
- **JWT** (`jsonwebtoken`) — stateless auth, returned in the response body *and* set as an httpOnly cookie
- **bcryptjs** — password hashing (never stored in plaintext)
- **helmet**, **cors**, **express-rate-limit**, **express-mongo-sanitize**, **hpp** — baseline hardening
- **express-validator** — request validation
- **multer** — resume (PDF/DOC) and company logo uploads, stored on disk under `/uploads`

## Getting started

```bash
npm install
cp .env.example .env      # then edit MONGO_URI, JWT_SECRET, ADMIN_EMAIL/PASSWORD etc.
npm run seed               # creates the one-and-only admin account from .env
npm run dev                 # starts on http://localhost:5000 (nodemon)
```

You need a running MongoDB instance — either local (`mongodb://127.0.0.1:27017/careerconnect`)
or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (put its connection string in `MONGO_URI`).

### Why a seed script for admin?

There is **no public "register as admin" route on purpose** — the placement-cell
account is the most powerful role (approves recruiters, edits any student, sees
everything), so it should never be creatable by anyone who can just hit an API
endpoint. `npm run seed` is the only way to create it, straight from your `.env`.

## Role model

One `User` collection holds `{ name, email, password (hashed), role }` where
`role` is `student | recruiter | admin`. Role-specific fields live in a
separate profile collection, linked 1:1 back to the user:

| Role | Auth doc | Profile doc | Registration |
|---|---|---|---|
| Student | `User` | `StudentProfile` (roll no., branch, CGPA, resume, NOC...) | Public — `POST /api/auth/register/student` |
| Recruiter | `User` | `RecruiterProfile` (company, `isApproved` flag...) | Public but **gated** — can't log in until an admin approves them |
| Admin | `User` | `AdminProfile` (designation, department...) | `npm run seed` for the first one; **existing admins create further admins** via `POST /api/admin/admins` — there is still no public admin sign-up |

Every protected route is guarded by two middlewares:
1. `protect` — verifies the JWT, loads the current user, rejects deactivated accounts
2. `authorize('role1', 'role2', ...)` — checks `req.user.role` is in the allowed list

## New in this version

- **Drive approval workflow** — recruiter-posted drives start as `draft`;
  admin reviews and publishes them (`PATCH /api/drives/:id/status`). The
  drive detail endpoint (`GET /api/drives/:id`) now also returns `postedBy`
  — the recruiter's user + company profile — for admin/recruiter viewers.
- **Drive analytics** — `GET /api/drives/:id/analytics` aggregates
  registered / present / absent / interview-given counts and a status
  breakdown, for charting on the frontend.
- **Attendance & interview tracking** — `Application.attendance`
  (`not_marked | present | absent`) and `Application.interviewGiven`,
  updatable via `PUT /api/applications/:id/meta`.
- **Drive-specific resume upload** — `POST /api/applications/:driveId` now
  accepts `multipart/form-data` with an optional `resume` file; falls back
  to the student's profile resume if omitted.
- **Excel export** — `GET /api/applications/drive/:driveId/export` streams
  an `.xlsx` of every applicant (contact info, academics, resume link,
  status, attendance, interview) via `exceljs`.
- **Email export** — `POST /api/applications/drive/:driveId/export-email`
  (admin only) emails that same file as an attachment to any address, via
  `src/utils/mailer.js` (nodemailer). If `SMTP_*` env vars aren't set, it
  logs to the console instead of failing, so this works out of the box in dev.
- **NOC upload & reminders** — students upload a NOC (`StudentProfile.nocUrl`)
  from their profile; admin filters the roster by NOC status
  (`GET /api/students?nocStatus=missing`) and can trigger a reminder email
  with `POST /api/students/:id/send-noc-reminder`.
- **Admin profile & admin-creates-admin** — `GET/PUT /api/admin/me` for an
  admin's own profile, `GET /api/admin/admins` to see the placement-cell
  roster, `POST /api/admin/admins` to create another admin account. This is
  deliberately the *only* way to create an admin besides the seed script —
  it requires an existing admin's JWT, so the role can never be self-assigned
  through public registration.

This is what makes the three roles behave like three separate dashboards
against the same API: the frontend calls the same base URL, but each
role only ever sees/can-hit the endpoints relevant to it, and the recruiter/
admin visibility inside shared endpoints (like `GET /api/drives`) is
automatically scoped server-side (see `driveController.listDrives`).

## Data model

```
User            (role: student | recruiter | admin)
 └─ StudentProfile     1:1        (rollNumber, branch, batch, cgpa, resumeUrl, placementStatus...)
 └─ RecruiterProfile   1:1        (companyName, isApproved, approvedBy...)

Drive           (createdBy -> User, eligibility: {minCgpa, maxBacklogs, branches[], batches[]})
Application     (student -> StudentProfile, drive -> Drive, status, history[])   [unique per student+drive]
Notification    (recipient -> User, type, isRead)
```

## API reference

Base URL: `/api`. All protected routes expect `Authorization: Bearer <token>`
(the login/register responses also set an httpOnly cookie if you'd rather use that).

### Auth — `/api/auth`
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/register/student` | Public | Creates `User` + `StudentProfile`, logs in immediately |
| POST | `/register/recruiter` | Public | Creates `User` + `RecruiterProfile` with `isApproved: false`. **No token issued** — must wait for admin approval |
| POST | `/login` | Public | Works for all 3 roles. Blocks unapproved recruiters and deactivated accounts |
| POST | `/logout` | Private | Clears the auth cookie |
| GET | `/me` | Private | Returns current user + role-specific profile |
| PUT | `/change-password` | Private | Requires current password |

### Students — `/api/students`
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/me` | Student (self) | |
| PUT | `/me` | Student (self) | multipart fields `resume` and/or `noc` |
| GET | `/` | Admin | filter by `?branch=&batch=&placementStatus=&minCgpa=&search=&nocStatus=uploaded\|missing&page=&limit=` |
| GET | `/:id` | Admin | |
| PUT | `/:id/placement-status` | Admin | `{ placementStatus, drive, company, ctc }` |
| POST | `/:id/send-noc-reminder` | Admin | emails the student a reminder if their NOC is still missing |
| DELETE | `/:id` | Admin | |

### Recruiters — `/api/recruiters`
| Method | Route | Access |
|---|---|---|
| GET | `/me` | Recruiter (self) |
| PUT | `/me` | Recruiter (self) — multipart field `logo` |
| GET | `/` | Admin — filter by `?isApproved=true\|false&search=` |
| GET | `/:id` | Admin |
| PUT | `/:id/approve` | Admin — notifies the recruiter |
| PUT | `/:id/reject` | Admin — `{ reason }` |
| DELETE | `/:id` | Admin |

### Drives — `/api/drives`
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/` | Recruiter (must be approved) or Admin | Recruiter-created drives start as `draft`; admin publishes |
| GET | `/` | Any logged-in role | Recruiters see only their own; students never see drafts; `?eligibleOnly=true` filters to drives the logged-in student qualifies for |
| GET | `/:id` | Any | Students get `eligible`/`alreadyApplied`; admin/recruiter get `postedBy` (recruiter user + company profile) |
| GET | `/:id/analytics` | Owning recruiter or Admin | `{ totalRegistered, present, absent, notMarked, interviewGiven, notInterviewed, statusBreakdown }` |
| PUT | `/:id` | Owning recruiter or Admin | |
| PATCH | `/:id/status` | Owning recruiter or Admin | `{ status }` — `draft\|upcoming\|open\|closed\|completed\|cancelled` |
| DELETE | `/:id` | Owning recruiter or Admin | Also deletes its applications |

### Applications — `/api/applications`
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/:driveId` | Student | multipart; optional `resume` file (else uses profile resume), `coverNote` text field |
| GET | `/me` | Student | Own applications, `?status=` filter |
| DELETE | `/:id` | Student (owner) | Only while status is still `applied` |
| GET | `/drive/:driveId` | Owning recruiter or Admin | Applicant list with student contact + academic details |
| GET | `/drive/:driveId/export` | Owning recruiter or Admin | Downloads the applicant list as `.xlsx` |
| POST | `/drive/:driveId/export-email` | Admin | `{ email }` — emails the same `.xlsx` as an attachment |
| PUT | `/:id/status` | Owning recruiter or Admin | `{ status, remarks, currentRoundIndex }` — auto-notifies the student |
| PUT | `/:id/meta` | Owning recruiter or Admin | `{ attendance, interviewGiven }` |

### Admin — `/api/admin`
| Method | Route | Access | Notes |
|---|---|---|---|
| GET | `/dashboard` | Admin | student/recruiter/drive/application counts + branch-wise placement breakdown |
| GET | `/me` | Admin | own `AdminProfile` |
| PUT | `/me` | Admin | `{ phone, designation, department }` |
| GET | `/admins` | Admin | list every placement-cell account |
| POST | `/admins` | Admin | `{ name, email, password, designation?, department?, phone? }` — creates another admin |

### Notifications — `/api/notifications`
| Method | Route | Access |
|---|---|---|
| GET | `/` | Any — `?unreadOnly=true` |
| PUT | `/:id/read` | Owner |
| PUT | `/read-all` | Self |

All list endpoints return `{ success, data, meta: { page, limit, total, totalPages } }`.
All errors return `{ success: false, message, errors? }`.

## Wiring this to the three frontend dashboards

The companion `nextgen-careerconnect` frontend (React + Vite + Tailwind) is
now built against this exact API — see its README for details. In short:

1. It stores the JWT from `login`/`register/student` in `localStorage` and
   attaches `Authorization: Bearer <token>` to every request via an axios
   interceptor (`src/lib/api.js`).
2. It has three routed dashboards — `/student/*`, `/recruiter/*`, `/admin/*` —
   each behind a `<ProtectedRoute role="...">` that reads the role from
   `GET /api/auth/me` and redirects a logged-in-but-wrong-role user to their
   own dashboard instead of a dead page.
3. `POST /api/auth/login` is shared by all three roles; the frontend routes
   the person to the right dashboard based on the `user.role` in the response.

To run them together locally: start this backend on `:5000` (`npm run dev`,
after `npm run seed`), then start the frontend on `:5173` (`npm run dev`)
with `VITE_API_URL=http://localhost:5000/api` in its `.env`. Make sure
`CLIENT_URL=http://localhost:5173` is set here so CORS allows the frontend
through — both `.env.example` files already default to these ports.

## Suggested next steps for production

- Swap local disk storage for S3/Cloudinary for resumes & logos
- Add refresh tokens / shorter-lived access tokens if you want stricter session control
- Add email delivery (e.g. Resend/SendGrid) for recruiter approval and application-status notifications, instead of only in-app `Notification` docs
- Add automated tests (Jest + Supertest) around auth and the eligibility logic

## Latest update — bug fix + new features

**Bug fix:** `Drive` model had a compound index across two array fields
(`eligibility.branches` + `eligibility.batches`), which MongoDB rejects
("cannot index parallel arrays"). Mongoose blocks a model's first write
until its indexes finish building, so the very first drive ever created
with both fields populated would fail with exactly that error. Fixed by
splitting into two separate single-field indexes — no data cleanup
needed, just restart the server after pulling this update.

**New:**
- `StudentProfile` gained `course` (BCA/MCA/B.Tech/...), `className`,
  `section`, `semester` — collected at registration and editable from
  the profile page. `GET /api/students?course=BCA` filters the roster.
- `GET /api/students/:id/applications` — a single student's full
  application history (admin only), for the new student profile page.
- Forgot/reset password: `POST /api/auth/forgot-password` emails a
  time-limited reset link; `POST /api/auth/reset-password/:token` sets
  the new password. Works for all three roles, including admin.
