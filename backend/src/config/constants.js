// Central place for enums used across models & controllers so the whole
// app (and the frontend team) can rely on one source of truth.

const ROLES = Object.freeze({
  STUDENT: 'student',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
});

const DRIVE_STATUS = Object.freeze({
  DRAFT: 'draft', // recruiter created it, admin hasn't published yet
  UPCOMING: 'upcoming', // published, applications not open yet
  OPEN: 'open', // accepting applications
  CLOSED: 'closed', // application window closed, process ongoing
  COMPLETED: 'completed', // drive fully finished
  CANCELLED: 'cancelled',
});

const JOB_TYPES = Object.freeze({
  FULL_TIME: 'full-time',
  INTERNSHIP: 'internship',
  PPO: 'ppo', // pre-placement offer (internship -> full time)
});

const APPLICATION_STATUS = Object.freeze({
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  SELECTED: 'selected',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
});

const PLACEMENT_STATUS = Object.freeze({
  UNPLACED: 'unplaced',
  PLACED: 'placed',
  OPTED_OUT: 'opted_out', // e.g. pursuing higher studies / entrepreneurship
});

const NOTIFICATION_TYPES = Object.freeze({
  DRIVE_PUBLISHED: 'drive_published',
  APPLICATION_STATUS: 'application_status',
  RECRUITER_APPROVED: 'recruiter_approved',
  RECRUITER_REJECTED: 'recruiter_rejected',
  GENERAL: 'general',
});

const ATTENDANCE_STATUS = Object.freeze({
  NOT_MARKED: 'not_marked',
  PRESENT: 'present',
  ABSENT: 'absent',
});

module.exports = {
  ROLES,
  DRIVE_STATUS,
  JOB_TYPES,
  APPLICATION_STATUS,
  PLACEMENT_STATUS,
  NOTIFICATION_TYPES,
  ATTENDANCE_STATUS,
};
