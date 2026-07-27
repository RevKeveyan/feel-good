import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const ref = process.env.SUPABASE_PROJECT_ID || "bruvmdcstlkszvjruska";
const token = (process.env.SUPABASE_ACCESS_TOKEN || "").trim();

if (!token.startsWith("sbp_")) {
  console.error(
    "Set SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens), or run apply-auth-email-templates.ps1"
  );
  process.exit(1);
}

function request(method, reqPath, payload) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: reqPath,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(payload
            ? { "Content-Length": Buffer.byteLength(payload) }
            : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode} ${data}`));
          } else {
            resolve(data ? JSON.parse(data) : {});
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const resetHtml = fs.readFileSync(
  path.join(root, "docs/mobile/email-templates/reset-password.html"),
  "utf8"
);
const confirmHtml = fs.readFileSync(
  path.join(root, "docs/mobile/email-templates/confirm-signup.html"),
  "utf8"
);

const body = JSON.stringify({
  mailer_subjects_recovery: "Reset your Feel Good Challenge password",
  mailer_templates_recovery_content: resetHtml,
  mailer_subjects_confirmation: "Confirm your Feel Good Challenge email",
  mailer_templates_confirmation_content: confirmHtml,
});

try {
  await request("PATCH", `/v1/projects/${ref}/config/auth`, body);
} catch (e) {
  const msg = String(e.message || e);
  if (msg.includes("free tier") || msg.includes("custom SMTP")) {
    console.error(
      "BLOCKED: Free-tier + default Supabase mailer cannot change email templates.\n" +
        "1) Enable Custom SMTP (see docs/mobile/SMTP_AND_EMAIL_RU.md)\n" +
        "2) Re-run this script\n" +
        msg
    );
    process.exit(2);
  }
  throw e;
}

const cfg = await request("GET", `/v1/projects/${ref}/config/auth`);
const rec = cfg.mailer_templates_recovery_content || "";
const conf = cfg.mailer_templates_confirmation_content || "";
console.log("OK: auth email templates applied");
console.log("recovery_subject:", cfg.mailer_subjects_recovery);
console.log("recovery_has_Token:", /\{\{\s*\.Token\s*\}\}/.test(rec));
console.log("confirmation_subject:", cfg.mailer_subjects_confirmation);
console.log("confirmation_has_Token:", /\{\{\s*\.Token\s*\}\}/.test(conf));
console.log("confirmation_has_ConfirmationURL:", /ConfirmationURL/.test(conf));
console.log("smtp_sender_name:", cfg.smtp_sender_name || "(empty)");
console.log("smtp_host:", cfg.smtp_host || "(empty)");
console.log("mailer_autoconfirm:", cfg.mailer_autoconfirm);