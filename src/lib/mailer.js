// src/lib/mailer.js
import "server-only";
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
} = process.env;

let _transporter;

/** Create (and cache) a nodemailer transporter. */
export function getTransport() {
  if (_transporter) return _transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // 465 = SSL, 587/25 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } else {
    // Dev fallback: logs email to console instead of sending
    _transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
    console.warn("[mailer] Using streamTransport (no real SMTP). Set SMTP_* env vars to send emails.");
  }

  return _transporter;
}

export async function sendPasswordResetEmail(to, link) {
  const t = getTransport();
  const from = MAIL_FROM || SMTP_USER || "Pawfect Match <no-reply@pawfectmatch.app>";

  const info = await t.sendMail({
    from,
    to,
    subject: "Reset your Pawfect Match password",
    text: `We received a request to reset your Pawfect Match password.\n\nOpen this link to reset: ${link}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `
      <p>We received a request to reset your Pawfect Match password.</p>
      <p>
        <a href="${link}"
           style="display:inline-block;background:#059669;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
          Reset password
        </a>
      </p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <p style="font-size:12px;color:#666">${link}</p>
    `,
  });

  if (info?.message) console.log("\n[mail preview]\n" + info.message.toString());
  return info;
}

export async function sendOtpEmail(to, code, minutes = 10) {
  const t = getTransport();
  const from = MAIL_FROM || SMTP_USER || "Pawfect Match <no-reply@pawfectmatch.app>";

  const info = await t.sendMail({
    from,
    to,
    subject: "Your verification code",
    text: `Your code is ${code}. It expires in ${minutes} minutes.`,
    html: `<p>Your code is <b style="font-size:20px;letter-spacing:4px">${code}</b>. It expires in ${minutes} minutes.</p>`,
  });

  if (info?.message) console.log("\n[mail preview]\n" + info.message.toString());
  console.log("Message sent:", info.messageId);
  return info;
}
