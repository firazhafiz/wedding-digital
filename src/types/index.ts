// ============================================
// Digital Wedding Invitation — TypeScript Types
// ============================================

export interface Guest {
  id: string;
  name: string;
  slug: string;
  max_pax: number;
  rsvp_status: "pending" | "attending" | "not_attending";
  rsvp_pax: number;
  rsvp_message: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  qr_token: string;
  created_at: string;
  updated_at: string;
}

export interface GuestbookEntry {
  id: string;
  guest_id: string | null;
  guest_name: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Gift {
  id: string;
  guest_id: string | null;
  sender_name: string;
  bank_name: string | null;
  amount: number | null;
  proof_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface EventInfo {
  id: string;
  user_id: string | null;
  event_slug: string;

  // Bride & Groom
  groom_name: string;
  groom_father: string | null;
  groom_mother: string | null;
  groom_photo_url: string | null;
  groom_instagram: string | null;
  bride_name: string;
  bride_father: string | null;
  bride_mother: string | null;
  bride_photo_url: string | null;
  bride_instagram: string | null;

  // Events
  akad_date: string | null;
  akad_location: string | null;
  akad_maps_url: string | null;
  resepsi_date: string | null;
  resepsi_location: string | null;
  resepsi_maps_url: string | null;

  // Appearance / CMS
  hero_photo_url: string | null;
  welcome_video_url: string | null;
  audio_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  font_display: string | null;
  photo_style: string | null;
  story_gallery_bg_url: string | null;

  // Feature Flags
  show_storyline: boolean;
  show_countdown: boolean;
  show_guestbook: boolean;
  show_gifts: boolean;
  show_akad: boolean;
  show_resepsi: boolean;

  // Bank Details
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  bank_accounts: any[] | null;
  qris_image_url: string | null;

  // Footer
  footer_text: string | null;

  updated_at: string;
}

export interface StorylineItem {
  id: string;
  event_id: string;
  year: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  event_id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

// RSVP form data
export interface RsvpFormData {
  guestId: string;
  status: "attending" | "not_attending";
  pax: number;
  message?: string;
}

// Guestbook form data
export interface GuestbookFormData {
  guestId: string;
  guestName: string;
  message: string;
}

// Gift form data
export interface GiftFormData {
  guestId?: string;
  senderName: string;
  bankName?: string;
  amount?: number;
  notes?: string;
}

// Admin stats
export interface DashboardStats {
  totalGuests: number;
  totalAttending: number;
  totalNotAttending: number;
  totalPending: number;
  totalCheckedIn: number;
  totalPax: number;
}

// Order Request
export interface OrderRequest {
  id: string;
  package_type: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  groom_name: string;
  bride_name: string;
  event_date: string | null;
  event_location: string | null;
  notes: string | null;
  status: "pending" | "contacted" | "confirmed" | "rejected";
  created_at: string;
}
