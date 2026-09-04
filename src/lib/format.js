export const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const humanizeStatus = (status = '') => status.replace(/_/g, ' ')

export const DRIVE_STATUS_TONE = {
  draft: 'neutral',
  upcoming: 'brand',
  open: 'open',
  closed: 'pending',
  completed: 'neutral',
  cancelled: 'danger',
}

export const APPLICATION_STATUS_TONE = {
  applied: 'brand',
  shortlisted: 'pending',
  interview_scheduled: 'pending',
  selected: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
}
