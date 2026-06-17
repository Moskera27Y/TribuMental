/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PregnancyStatus {
  PREGNANT = "PREGNANT",
  POSTPARTUM = "POSTPARTUM",
}

export enum SubscriptionPlan {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  FAMILY = "FAMILY",
}

export enum AppointmentType {
  PRENATAL = "PRENATAL", // Control prenatal
  PEDIATRIC = "PEDIATRIC", // Pediatría
  LABORATORY = "LABORATORY", // Laboratorio
  PSYCHOLOGY = "PSYCHOLOGY", // Psicología
  OTHER = "OTHER", // Otros
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED", // Programada
  COMPLETED = "COMPLETED", // Completada
  CANCELLED = "CANCELLED", // Cancelada
}

export enum WhatsAppMsgCategory {
  UTILITY = "UTILITY", // Recordatorios, alertas de citas, etc.
  MARKETING = "MARKETING", // Ofertas de plan, renovaciones, etc.
  AUTHENTICATION = "AUTHENTICATION", // Códigos de acceso dólidos
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  status: PregnancyStatus;
  weeksOrMonths: number; // semanas si es pregnant, meses si es postpartum
  mainWorry: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  reminderFrequency: "daily" | "weekly" | "none";
  onboarded: boolean;
}

export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "cancelled" | "past_due" | "none";
  stripeSubscriptionId?: string;
  wompiTransactionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface MoodCheckIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  moodValue: number; // 1-5 (Muy triste, Triste, Neutral, Alegre, Muy feliz)
  moodEmoji: string;
  note?: string;
  recommendations: string[];
  createdAt: string;
  chatThread?: {
    sender: "user" | "ai";
    text: string;
    timestamp: string;
  }[];
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  time: string; // HH:MM
  days: string[]; // ['Mon', 'Wed' ...]
  channel: "whatsapp" | "app" | "both";
  active: boolean;
}

export interface WhatsAppMessageLog {
  id: string;
  userId: string;
  recipient: string;
  body: string;
  category: WhatsAppMsgCategory;
  status: "sent" | "delivered" | "failed";
  timestamp: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: AppointmentType;
  doctor: string;
  location: string;
  notes?: string;
  reminderActive: boolean;
  status: AppointmentStatus;
  createdAt: string;
}

export interface MedicalDocument {
  id: string;
  userId: string;
  name: string;
  type: string; // e.g. "Receta", "Análisis de Sangre", "Ecografía"
  fileDataUrl: string; // Base64 or mock storage URL
  ocrText?: string;
  extractedMetadata?: {
    patientName?: string;
    doctorName?: string;
    dateOfDocument?: string;
    keyFindings?: string;
    suspectedAppointmentType?: AppointmentType;
  };
  appointmentId?: string; // Linked appointment
  uploadedAt: string;
  size?: string;
}

export interface CareplanTask {
  id: string;
  title: string;
  category: "autocuidado" | "salud" | "emociones" | "whatsapp";
  description: string;
  durationMinutes?: number;
  weeksRange: [number, number]; // [min, max] matching weeks/months
  targetStatus: PregnancyStatus;
  completed?: boolean;
}

export interface SupportContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  specialty: string;
  isEmergency: boolean;
}

export interface CompanionPermissions {
  viewCalendar: boolean;
  viewDocuments: boolean;
  viewCheckins: boolean;
}

export interface CompanionInvitation {
  id: string;
  primaryUserId: string;
  primaryUserName: string;
  companionEmail: string;
  companionName: string;
  permissions: CompanionPermissions;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface CompanionRelation {
  id: string;
  primaryUserId: string;
  primaryUserName: string;
  primaryUserEmail: string;
  companionUserId: string;
  companionUserEmail: string;
  companionName: string;
  permissions: CompanionPermissions;
  createdAt: string;
}
