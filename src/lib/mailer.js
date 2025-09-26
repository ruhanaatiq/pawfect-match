import nodemailer from "nodemailer";

export function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true, // Gmail uses SSL on port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}
export async function sendPasswordResetEmail(to, link) {
  const t = getTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  await t.sendMail({
    from,
    to,
    subject: "Reset your Pawfect Match password",
    html: `
      <p>We received a request to reset your Pawfect Match password.</p>
      <p><a href="${link}" style="display:inline-block;background:#059669;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Reset password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <p style="font-size:12px;color:#666">${link}</p>
    `,
  });
}


export async function sendOtpEmail(to, code) {
  const t = getTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  const info = await t.sendMail({
    from,
    to,
    subject: "Your verification code",
    html: `<p>Your code is <b style="font-size:20px;letter-spacing:4px">${code}</b>. It expires in 10 minutes.</p>`,
  });

  console.log("Message sent:", info.messageId);
}
