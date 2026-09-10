import { prisma } from "../db/prisma";
import { sendEmail, buildEmail } from "./email.service";
import { sendSms } from "./sms.service";
import { env } from "../config/env";

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_CONFIRMED"
  | "ORDER_SHIPPED"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED"
  | "PAYMENT_RECEIVED"
  | "WELCOME"
  | "SYSTEM";

interface NotifyInput {
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  userId?: string;
  targetRole?: "ADMIN" | "CUSTOMER" | "STAFF";
}

/** Persists a notification and fans out to email/SMS channels (fire-and-forget). */
export async function notify(input: NotifyInput): Promise<void> {
  const { type, title, body, link, userId, targetRole = "CUSTOMER" } = input;

  await prisma.notification.create({
    data: { type, title, body, link, userId: userId || null, targetRole },
  });

  // Fan-out contract: if a user is attached, send email/SMS using templates.
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true } });
    if (user) {
      void sendEmail({
        to: user.email,
        subject: title,
        html: buildEmail(user.name || "there", { text: "View details", href: `${env.SITE_URL}${link || "/account"}` }, `<p>${body}</p>`),
      });
      if (user.phone) void sendSms({ to: user.phone, text: `${title} — ${body}` });
    }
  } else {
    // Broadcast to a role (e.g. admins on new orders).
    const targets = await prisma.user.findMany({ where: { role: targetRole }, select: { id: true, name: true, email: true, phone: true } });
    void sendEmail({
      to: targets[0]?.email || "support@tuhinwatch.com",
      subject: title,
      html: buildEmail("Team", { text: "Open dashboard", href: `${env.SITE_URL}/admin` }, `<p>${body}</p>`),
    });
  }
}

export async function notifyAdmins(type: NotificationType, title: string, body: string, link?: string) {
  await notify({ type, title, body, link, targetRole: "ADMIN" });
}

export async function notifyUser(userId: string, type: NotificationType, title: string, body: string, link?: string) {
  await notify({ userId, type, title, body, link });
}

export const NOTIFICATION_LINKS = {
  order: (orderNumber: string) => `/account/orders?q=${orderNumber}`,
  adminOrder: (id: string) => `/admin/orders/${id}`,
};