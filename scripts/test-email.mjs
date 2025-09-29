// scripts/test-email.mjs
import dotenv from "dotenv";

// load env from .env.local (or .env) at project root
dotenv.config({ path: ".env.local" }); // change to ".env" if that's where your SMTP vars are

// import your mailer using the real relative path
import { sendOtpEmail } from "../src/lib/mailer.js";

async function main() {
  const to = process.env.SMTP_USER || "yourgmail@gmail.com";
  console.log("Sending test OTP to:", to);
  try {
    await sendOtpEmail(to, "123456");
    console.log("✅ Test email sent. Check inbox/spam.");
  } catch (err) {
    console.error("❌ Mailer failed:", err);
  }
}

main();
