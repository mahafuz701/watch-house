import { z } from "zod";

const EMAIL = z.string().trim().toLowerCase().email("Enter a valid email address.");
const PASSWORD = z.string().min(8, "Password must be at least 8 characters.").max(72);
export const BD_PHONE = z.string().regex(/^(\+?880|0)1[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX)");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: EMAIL,
  phone: BD_PHONE,
  password: PASSWORD,
});

export const loginSchema = z.object({
  email: EMAIL,
  password: z.string().min(1, "Password is required."),
});

export const forgotSchema = z.object({ email: EMAIL });

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: PASSWORD,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: PASSWORD,
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: BD_PHONE.optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
}).refine((v) => v.name || v.phone || v.avatarUrl !== undefined, { message: "Provide at least one field to update." });

export const addressSchema = z.object({
  label: z.string().trim().min(2).max(30),
  fullName: z.string().trim().min(2).max(80),
  phone: BD_PHONE,
  email: EMAIL.optional(),
  division: z.string().trim().min(2).max(60),
  district: z.string().trim().min(2).max(60),
  area: z.string().trim().min(2).max(60),
  fullAddress: z.string().trim().min(5).max(300),
  isDefault: z.boolean().optional(),
});