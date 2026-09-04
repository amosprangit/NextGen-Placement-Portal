const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // not configured — caller falls back to a no-op/log
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
};

/**
 * Sends an email if SMTP is configured; otherwise logs it to the console
 * so local development and demos don't hard-fail just because no mail
 * server is set up yet. Returns { sent: boolean }.
 */
const sendMail = async ({ to, subject, html, text, attachments }) => {
  const t = getTransporter();
  const from = `${process.env.MAIL_FROM_NAME || 'NextGen CareerConnect'} <${
    process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || 'no-reply@careerconnect.local'
  }>`;

  if (!t) {
    console.warn(
      `[mailer] SMTP not configured — skipping real send. Would have emailed "${subject}" to ${to}`
    );
    return { sent: false, reason: 'SMTP not configured' };
  }

  await t.sendMail({ from, to, subject, html, text, attachments });
  return { sent: true };
};

module.exports = { sendMail };
