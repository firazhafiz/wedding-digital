import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface RsvpNotificationData {
  guestName: string;
  status: "attending" | "not_attending";
  pax: number;
  message?: string;
  eventTitle: string;
  notificationEmail: string;
}

export async function sendRsvpNotification(data: RsvpNotificationData) {
  if (!RESEND_API_KEY) {
    console.warn(
      "[Resend] RESEND_API_KEY not set, skipping email notification.",
    );
    return { success: false, error: "API key not configured" };
  }

  if (!data.notificationEmail) {
    console.warn(
      "[Resend] No notification_email set for this event, skipping.",
    );
    return { success: false, error: "No notification email" };
  }

  try {
    const resend = new Resend(RESEND_API_KEY);

    const statusEmoji = data.status === "attending" ? "✅" : "❌";
    const statusText = data.status === "attending" ? "Hadir" : "Tidak Hadir";

    const { error } = await resend.emails.send({
      from: "Wedding RSVP <onboarding@resend.dev>",
      to: data.notificationEmail,
      subject: `${statusEmoji} RSVP ${statusText}: ${data.guestName} — ${data.eventTitle}`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <div style="background-color: #1f2937; padding: 40px 32px; text-align: center;">
            <p style="color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 12px 0;">Pemberitahuan RSVP Baru</p>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 400; font-family: 'Playfair Display', Georgia, serif; margin: 0;">${data.eventTitle}</h1>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 32px;">
            <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 24px 0;">
              ${statusEmoji} Konfirmasi Kehadiran Tamu
            </h2>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px; border: 1px solid #f3f4f6;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500; width: 40%; border-bottom: 1px solid #e5e7eb;">Nama Tamu</td>
                  <td style="padding: 12px 0; font-weight: 600; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.guestName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500; border-bottom: 1px solid #e5e7eb;">Status</td>
                  <td style="padding: 12px 0; font-weight: 600; color: ${data.status === "attending" ? "#059669" : "#dc2626"}; text-align: right; border-bottom: 1px solid #e5e7eb;">${statusText}</td>
                </tr>
                ${
                  data.status === "attending"
                    ? `
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-weight: 500; border-bottom: 1px solid #e5e7eb;">Jumlah Hadir</td>
                  <td style="padding: 12px 0; font-weight: 600; color: #111827; text-align: right; border-bottom: 1px solid #e5e7eb;">${data.pax} Orang</td>
                </tr>
                `
                    : ""
                }
                ${
                  data.message
                    ? `
                <tr>
                  <td colspan="2" style="padding: 16px 0 8px 0; color: #6b7280; font-weight: 500;">Pesan / Doa dari Tamu:</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 0 0 12px 0; font-style: italic; color: #4b5563; line-height: 1.6;">"${data.message}"</td>
                </tr>
                `
                    : ""
                }
              </table>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6; text-align: center;">
              Silakan periksa dashboard pengelola tamu Anda untuk melihat detail selengkapnya.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Notifikasi otomatis dari Sistem Undangan Digital Anda.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] Failed to send:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Resend] Error:", err);
    return { success: false, error: err.message };
  }
}
