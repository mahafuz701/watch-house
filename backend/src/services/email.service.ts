import nodemailer from "nodemailer";
import { env, isDev } from "../config/env";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (transporter) return transporter;
  if (env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export function buildEmail(name: string, button: { text: string; href: string }, bodyHtml: string): string {
  return `
  <div style="max-width:560px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#111827;color:#fff;padding:20px 28px">
      <div style="font-size:18px;font-weight:700">⌚ Tuhin Watch House</div>
    </div>
    <div style="padding:28px 32px;color:#111827">
      <p style="font-size:15px;line-height:1.6">Hello <b>${name}</b>,</p>
      ${bodyHtml}
      <p style="text-align:center;margin:22px 0">
        <a href="${button.href}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 26px;border-radius:8px;text-decoration:none;font-size:14px">${button.text}</a>
      </p>
      <p style="font-size:13px;color:#6b7280;line-height:1.6">If the button doesn't work, copy and paste this link into your browser:<br>${button.href}</p>
    </div>
    <div style="padding:14px 20px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center">
      Tuhin Watch House • House 22, Road 5, Dhanmondi, Dhaka 1205 • support@tuhinwatch.com
    </div>
  </div>`;
}

export async function sendEmail(msg: MailMessage): Promise<void> {
  const t = getTransporter();
  if (!t) {
    if (isDev) {
      console.log(`[mail:dev] To: ${msg.to} | Subject: ${msg.subject}`);
    }
    return;
  }
  try {
    await t.sendMail({ from: env.SMTP_FROM, to: msg.to, subject: msg.subject, html: msg.html });
  } catch (e) {
    console.error("[mail] failed to send:", e?.message || e);
  }
}