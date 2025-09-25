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
