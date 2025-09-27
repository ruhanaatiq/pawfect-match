import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") }); // <— key change

import { getTransport } from "../src/lib/mailer.js";

console.log("[debug] SMTP_HOST =", process.env.SMTP_HOST);
console.log("[debug] SMTP_PORT =", process.env.SMTP_PORT);

const t = getTransport();
t.sendMail({
  from: process.env.MAIL_FROM || process.env.SMTP_USER,
  to: process.env.TEST_TO || process.env.SMTP_USER,
  subject: "Pawfect Match SMTP test",
  text: "If you see this, SMTP works.",
})
  .then(info => { console.log("Mail sent:", info.response); process.exit(0); })
  .catch(err => { console.error("Send failed:", err); process.exit(1); });
