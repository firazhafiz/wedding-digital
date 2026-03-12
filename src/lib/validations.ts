import { z } from "zod";

// ============================================
// RSVP Validation
// ============================================
export const rsvpSchema = z.object({
  guestId: z.string().min(1, "ID tamu tidak valid"),
  event_id: z.string().uuid("ID event tidak valid"),
  status: z.enum(["attending", "not_attending"] as const, {
    error: "Pilih status kehadiran",
  }),
  pax: z.coerce
    .number()
    .int()
    .min(0, "Minimal 0 orang")
    .max(10, "Maksimal 10 orang"),
  message: z.string().max(500, "Pesan maksimal 500 karakter").optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

// ============================================
// Guestbook Validation
// ============================================
export const guestbookSchema = z.object({
  guestId: z.string().uuid("ID tamu tidak valid"),
  event_id: z.string().uuid("ID event tidak valid"),
  guestName: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .max(100, "Nama maksimal 100 karakter"),
  message: z
    .string()
    .min(1, "Ucapan tidak boleh kosong")
    .max(1000, "Ucapan maksimal 1000 karakter"),
});

export type GuestbookInput = z.infer<typeof guestbookSchema>;

// ============================================
// Gift Validation
// ============================================
export const giftSchema = z.object({
  event_id: z.string().uuid("ID event tidak valid"),
  guestId: z.string().optional(),
  senderName: z
    .string()
    .min(1, "Nama pengirim tidak boleh kosong")
    .max(100, "Nama maksimal 100 karakter"),
  bankName: z.string().max(100).optional(),
  amount: z.number().positive("Nominal harus lebih dari 0").optional(),
  notes: z.string().max(500).optional(),
});

export type GiftInput = z.infer<typeof giftSchema>;

// ============================================
// Guest Management (Admin)
// ============================================
export const createGuestSchema = z.object({
  event_id: z.string().uuid("ID event tidak valid"),
  name: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .max(200, "Nama maksimal 200 karakter"),
  max_pax: z
    .number()
    .int()
    .min(1, "Minimal 1 pax")
    .max(20, "Maksimal 20 pax")
    .default(2),
  phone_number: z.string().nullable().optional(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;

export const updateGuestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  max_pax: z.number().int().min(1).max(20).optional(),
  rsvp_status: z
    .enum(["pending", "attending", "not_attending"] as const)
    .optional(),
  checked_in: z.boolean().optional(),
});

export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;

// ============================================
// Check-in Validation
// ============================================
export const checkinSchema = z.object({
  qrToken: z.string().min(1, "QR token tidak boleh kosong"),
});

export type CheckinInput = z.infer<typeof checkinSchema>;

// ============================================
// Guestbook Moderation (Admin)
// ============================================
export const moderateGuestbookSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"] as const),
});

export type ModerateGuestbookInput = z.infer<typeof moderateGuestbookSchema>;

// ============================================
// Helper: Parse Zod errors to a friendly format
// ============================================
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  return formatted;
}
