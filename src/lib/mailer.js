import nodemailer from "nodemailer";

export function getTransport() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function sendOtpEmail(to, code) {
  const t = getTransport();
  const from = process.env.MAIL_FROM || "no-reply@pawfectmatch.app";
  await t.sendMail({
    from,
    to,
    subject: "Your verification code",
    html: `<p>Your code is <b style="font-size:20px;letter-spacing:4px">${code}</b>. It expires in 10 minutes.</p>`,
  });
}
