/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { 
  User, 
  Profile, 
  Subscription, 
  MoodCheckIn, 
  Reminder, 
  Appointment, 
  MedicalDocument, 
  WhatsAppMessageLog,
  SupportContact,
  PregnancyStatus,
  SubscriptionPlan,
  AppointmentType,
  AppointmentStatus,
  WhatsAppMsgCategory,
  CompanionInvitation,
  CompanionRelation,
  CompanionPermissions
} from "../src/types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Local Database Structure
interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  subscriptions: Subscription[];
  checkins: MoodCheckIn[];
  reminders: Reminder[];
  appointments: Appointment[];
  documents: MedicalDocument[];
  whatsappLogs: WhatsAppMessageLog[];
  supportContacts: SupportContact[];
  invitations: CompanionInvitation[];
  companionRelations: CompanionRelation[];
}

// Initial Support Contacts (Spanish context, matching health & emergency needs)
const DEFAULT_SUPPORT_CONTACTS: SupportContact[] = [
  {
    id: "sc-1",
    name: "Línea Nacional de Salud Mental (España)",
    role: "Atención Crisis 24/7",
    phone: "024",
    specialty: "Soporte emocional y prevención del suicidio",
    isEmergency: true
  },
  {
    id: "sc-2",
    name: "Emergencias Médicas Generales",
    role: "Servicio de Emergencia",
    phone: "112",
    specialty: "Médico Urgente España / LATAM (911)",
    isEmergency: true
  },
  {
    id: "sc-3",
    name: "Línea de Apoyo Perinatal de TribuMental",
    role: "Psicóloga Perinatal Especializada",
    phone: "+34 600 000 000",
    specialty: "Depresión posparto y ansiedad gestacional (Lunes a Sábado de 8:00 a 20:00)",
    isEmergency: false
  },
  {
    id: "sc-4",
    name: "TribuMaternal - Consultores de Lactancia",
    role: "Asesora de Lactancia Certificada (IBCLC)",
    phone: "+34 600 111 222",
    specialty: "Dificultades de lactancia, agarre y mastitis",
    isEmergency: false
  }
];

// Empty database with initial content
const INITIAL_DATABASE: DatabaseSchema = {
  users: [
    {
      id: "usr-default",
      name: "Mamá Tribu",
      email: "mama@tribumental.com",
      createdAt: new Date().toISOString()
    }
  ],
  profiles: [
    {
      userId: "usr-default",
      status: PregnancyStatus.PREGNANT,
      weeksOrMonths: 24, // 24 semanas de embarazo
      mainWorry: "Miedo al parto y organización del nido",
      whatsappEnabled: true,
      whatsappNumber: "+34612345678",
      reminderFrequency: "daily",
      onboarded: true
    }
  ],
  subscriptions: [
    {
      userId: "usr-default",
      plan: SubscriptionPlan.FREE,
      status: "none",
      cancelAtPeriodEnd: false
    }
  ],
  checkins: [
    {
      id: "chk-1",
      userId: "usr-default",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      moodValue: 4,
      moodEmoji: "😊",
      note: "Me sentí con mucha energía hoy, organicé la ropita del bebé.",
      recommendations: ["Continúa celebrando estos pequeños logros.", "Recuerda descansar y beber al menos 2 litros de agua."],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "chk-2",
      userId: "usr-default",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      moodValue: 3,
      moodEmoji: "😐",
      note: "Un poco cansada físicamente, me dolía la espalda al dormir.",
      recommendations: ["Prueba una almohada entre tus piernas al acostarte de lado.", "Haz estiramientos pélvicos suaves por 5 minutos."],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "chk-3",
      userId: "usr-default",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      moodValue: 2,
      moodEmoji: "😔",
      note: "Ansiosa por la ecografía morfológica que viene. Muchas dudas en la cabeza.",
      recommendations: ["Es completamente normal sentir incertidumbre.", "Escribe tus dudas en el calendario de citas para no olvidarlas al hablar con el ginecólogo."],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  reminders: [
    {
      id: "rem-1",
      userId: "usr-default",
      title: "Check-in diario de ánimo TribuMental",
      time: "09:00",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      channel: "both",
      active: true
    },
    {
      id: "rem-2",
      userId: "usr-default",
      title: "Momento para hidratarse y estirar",
      time: "15:00",
      days: ["Mon", "Wed", "Fri"],
      channel: "whatsapp",
      active: true
    }
  ],
  appointments: [
    {
      id: "app-1",
      userId: "usr-default",
      title: "Ecografía del Tercer Trimestre",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "10:30",
      type: AppointmentType.PRENATAL,
      doctor: "Dra. Laura Martínez",
      location: "Sanatorio de la Mujer, Consultorio 204",
      notes: "Llevar la orden médica física y venir con la vejiga medianamente llena.",
      reminderActive: true,
      status: AppointmentStatus.SCHEDULED,
      createdAt: new Date().toISOString()
    },
    {
      id: "app-2",
      userId: "usr-default",
      title: "Análisis de Sangre y Tolerancia a la Glucosa",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "08:00",
      type: AppointmentType.LABORATORY,
      doctor: "Laboratorio Central AC",
      location: "Edificio Diagnóstico Médico, Planta Baja",
      notes: "Requiere 8 horas de ayunas estricto.",
      reminderActive: true,
      status: AppointmentStatus.COMPLETED,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  documents: [
    {
      id: "doc-1",
      userId: "usr-default",
      name: "resultado_analitica_glucosa.png",
      type: "Laboratorio",
      fileDataUrl: "/assets/sample_document.png", // Mocked URL path
      ocrText: "LABORATORIO CENTRAL DE ANALISIS CLINICOS\nPaciente: Mamá Tribu\nFecha: 2026-06-12\nTest de O'Sullivan - Tolerancia a la Glucosa:\nGlucosa Basal: 85 mg/dL (Valor de ref: 70-105)\nGlucosa 1h pos-sobrecarga: 125 mg/dL (Valor de ref: <140)\nResultado: NORMAL\nFirma: Dr. Carlos Solares",
      extractedMetadata: {
        patientName: "Mamá Tribu",
        doctorName: "Dr. Carlos Solares",
        dateOfDocument: "24/06/2026",
        keyFindings: "Prueba de glucosa normal (Glucosa Basal: 85, Pos-sobreadm: 125). No se detecta diabetes gestacional.",
        suspectedAppointmentType: AppointmentType.LABORATORY
      },
      appointmentId: "app-2",
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      size: "1.2 MB"
    }
  ],
  whatsappLogs: [
    {
      id: "log-1",
      userId: "usr-default",
      recipient: "+34612345678",
      body: "¡Hola Mamá Tribu! 🌟 Bienvenida a TribuMental. Este será tu espacio seguro de calma por WhatsApp. Cuéntame, ¿cómo te sientes hoy?",
      category: WhatsAppMsgCategory.UTILITY,
      status: "delivered",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  supportContacts: DEFAULT_SUPPORT_CONTACTS,
  invitations: [],
  companionRelations: []
};

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...INITIAL_DATABASE };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        
        // Ensure lists are initialized
        if (!this.data.supportContacts || this.data.supportContacts.length === 0) {
          this.data.supportContacts = DEFAULT_SUPPORT_CONTACTS;
        }
        if (!this.data.invitations) {
          this.data.invitations = [];
        }
        if (!this.data.companionRelations) {
          this.data.companionRelations = [];
        }
        this.save();
      } else {
        this.save();
      }
    } catch (err) {
      console.error("Error reading db.json local database, building memories", err);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing db.json local database", err);
    }
  }

  // --- Users & Profiles ---
  public getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getOrCreateUser(email: string, name: string): User {
    let user = this.data.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        createdAt: new Date().toISOString()
      };
      this.data.users.push(user);
      
      // Auto create empty profile and subscription
      this.data.profiles.push({
        userId: user.id,
        status: PregnancyStatus.PREGNANT,
        weeksOrMonths: 12,
        mainWorry: "Miedo a lo desconocido",
        whatsappEnabled: false,
        whatsappNumber: "",
        reminderFrequency: "daily",
        onboarded: false
      });

      this.data.subscriptions.push({
        userId: user.id,
        plan: SubscriptionPlan.FREE,
        status: "none",
        cancelAtPeriodEnd: false
      });

      this.save();
    }
    return user;
  }

  public getProfile(userId: string): Profile {
    let profile = this.data.profiles.find(p => p.userId === userId);
    if (!profile) {
      profile = {
        userId,
        status: PregnancyStatus.PREGNANT,
        weeksOrMonths: 12,
        mainWorry: "",
        whatsappEnabled: false,
        whatsappNumber: "",
        reminderFrequency: "daily",
        onboarded: false
      };
      this.data.profiles.push(profile);
      this.save();
    }
    return profile;
  }

  public updateProfile(userId: string, updates: Partial<Profile>): Profile {
    const profile = this.getProfile(userId);
    Object.assign(profile, updates);
    this.save();
    return profile;
  }

  // --- Subscriptions ---
  public getSubscription(userId: string): Subscription {
    let sub = this.data.subscriptions.find(s => s.userId === userId);
    if (!sub) {
      sub = {
        userId,
        plan: SubscriptionPlan.FREE,
        status: "none",
        cancelAtPeriodEnd: false
      };
      this.data.subscriptions.push(sub);
      this.save();
    }
    return sub;
  }

  public updateSubscription(userId: string, updates: Partial<Subscription>): Subscription {
    const sub = this.getSubscription(userId);
    Object.assign(sub, updates);
    this.save();
    return sub;
  }

  // --- Mood Check-ins ---
  public getCheckIns(userId: string): MoodCheckIn[] {
    return this.data.checkins
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addCheckIn(userId: string, checkIn: Omit<MoodCheckIn, "id" | "userId" | "createdAt">): MoodCheckIn {
    const newCheckIn: MoodCheckIn = {
      id: `chk-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...checkIn,
      createdAt: new Date().toISOString()
    };
    
    // Maintain single check-in per day (overwrite if exists on matching date)
    const existingIndex = this.data.checkins.findIndex(c => c.userId === userId && c.date === checkIn.date);
    if (existingIndex > -1) {
      this.data.checkins[existingIndex] = newCheckIn;
    } else {
      this.data.checkins.push(newCheckIn);
    }
    this.save();
    return newCheckIn;
  }

  // --- Reminders ---
  public getReminders(userId: string): Reminder[] {
    return this.data.reminders.filter(r => r.userId === userId);
  }

  public addReminder(userId: string, reminder: Omit<Reminder, "id" | "userId">): Reminder {
    const newReminder: Reminder = {
      id: `rem-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...reminder
    };
    this.data.reminders.push(newReminder);
    this.save();
    return newReminder;
  }

  public updateReminder(userId: string, id: string, updates: Partial<Reminder>): Reminder | undefined {
    const reminder = this.data.reminders.find(r => r.id === id && r.userId === userId);
    if (reminder) {
      Object.assign(reminder, updates);
      this.save();
    }
    return reminder;
  }

  public deleteReminder(userId: string, id: string): boolean {
    const lengthBefore = this.data.reminders.length;
    this.data.reminders = this.data.reminders.filter(r => !(r.id === id && r.userId === userId));
    const deleted = this.data.reminders.length < lengthBefore;
    if (deleted) this.save();
    return deleted;
  }

  // --- Appointments ---
  public getAppointments(userId: string): Appointment[] {
    return this.data.appointments
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());
  }

  public addAppointment(userId: string, appt: Omit<Appointment, "id" | "userId" | "createdAt">): Appointment {
    const newAppt: Appointment = {
      id: `app-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...appt,
      createdAt: new Date().toISOString()
    };
    this.data.appointments.push(newAppt);
    this.save();
    return newAppt;
  }

  public updateAppointment(userId: string, id: string, updates: Partial<Appointment>): Appointment | undefined {
    const appt = this.data.appointments.find(a => a.id === id && a.userId === userId);
    if (appt) {
      Object.assign(appt, updates);
      this.save();
    }
    return appt;
  }

  public deleteAppointment(userId: string, id: string): boolean {
    const lengthBefore = this.data.appointments.length;
    this.data.appointments = this.data.appointments.filter(a => !(a.id === id && a.userId === userId));
    const deleted = this.data.appointments.length < lengthBefore;
    if (deleted) {
      // Unlink documents too
      this.data.documents.forEach(doc => {
        if (doc.appointmentId === id) {
          doc.appointmentId = undefined;
        }
      });
      this.save();
    }
    return deleted;
  }

  // --- Documents ---
  public getDocuments(userId: string): MedicalDocument[] {
    return this.data.documents.filter(d => d.userId === userId);
  }

  public addDocument(userId: string, doc: Omit<MedicalDocument, "id" | "userId" | "uploadedAt">): MedicalDocument {
    const newDoc: MedicalDocument = {
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...doc,
      uploadedAt: new Date().toISOString()
    };
    this.data.documents.push(newDoc);
    this.save();
    return newDoc;
  }

  public updateDocument(userId: string, id: string, updates: Partial<MedicalDocument>): MedicalDocument | undefined {
    const doc = this.data.documents.find(d => d.id === id && d.userId === userId);
    if (doc) {
      Object.assign(doc, updates);
      this.save();
    }
    return doc;
  }

  public deleteDocument(userId: string, id: string): boolean {
    const lengthBefore = this.data.documents.length;
    this.data.documents = this.data.documents.filter(d => !(d.id === id && d.userId === userId));
    const deleted = this.data.documents.length < lengthBefore;
    if (deleted) this.save();
    return deleted;
  }

  // --- WhatsApp Logs ---
  public getWhatsAppLogs(userId: string): WhatsAppMessageLog[] {
    return this.data.whatsappLogs
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addWhatsAppLog(userId: string, recipient: string, body: string, category: WhatsAppMsgCategory, status: "sent" | "delivered" | "failed"): WhatsAppMessageLog {
    const newLog: WhatsAppMessageLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recipient,
      body,
      category,
      status,
      timestamp: new Date().toISOString()
    };
    this.data.whatsappLogs.push(newLog);
    this.save();
    return newLog;
  }

  // --- Support Contacts ---
  public getSupportContacts(): SupportContact[] {
    return this.data.supportContacts;
  }

  // --- Companion/Family Plan Support ---

  public getInvitationsSent(primaryUserId: string): CompanionInvitation[] {
    return this.data.invitations.filter(inv => inv.primaryUserId === primaryUserId);
  }

  public getInvitationsReceived(email: string): CompanionInvitation[] {
    const cleanEmail = email.trim().toLowerCase();
    return this.data.invitations.filter(inv => inv.companionEmail.trim().toLowerCase() === cleanEmail && inv.status === "pending");
  }

  public addInvitation(
    primaryUserId: string,
    primaryUserName: string,
    companionEmail: string,
    companionName: string,
    permissions: CompanionPermissions
  ): CompanionInvitation {
    // Overwrite existing pending invitations to the same email
    this.data.invitations = this.data.invitations.filter(
      inv => !(inv.primaryUserId === primaryUserId && inv.companionEmail.trim().toLowerCase() === companionEmail.trim().toLowerCase() && inv.status === "pending")
    );

    const newInv: CompanionInvitation = {
      id: `inv-${Math.random().toString(36).substr(2, 9)}`,
      primaryUserId,
      primaryUserName,
      companionEmail,
      companionName,
      permissions,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    this.data.invitations.push(newInv);
    this.save();
    return newInv;
  }

  public updateInvitationStatus(invitationId: string, status: "accepted" | "declined"): CompanionInvitation | null {
    const inv = this.data.invitations.find(i => i.id === invitationId);
    if (!inv) return null;
    inv.status = status;
    this.save();
    return inv;
  }

  public acceptInvitation(
    invitationId: string,
    companionUserId: string,
    companionUserEmail: string
  ): CompanionRelation | null {
    const inv = this.data.invitations.find(i => i.id === invitationId);
    if (!inv) return null;

    inv.status = "accepted";

    // Create relation
    const primaryUser = this.getUser(inv.primaryUserId);
    const newRelation: CompanionRelation = {
      id: `rel-${Math.random().toString(36).substr(2, 9)}`,
      primaryUserId: inv.primaryUserId,
      primaryUserName: inv.primaryUserName,
      primaryUserEmail: primaryUser?.email || "mama@tribumental.com",
      companionUserId,
      companionUserEmail,
      companionName: inv.companionName,
      permissions: inv.permissions,
      createdAt: new Date().toISOString()
    };

    // Remove any previous active companion relations for this email/primary combination to prevent duplicates
    this.data.companionRelations = this.data.companionRelations.filter(
      rel => !(rel.primaryUserId === inv.primaryUserId && rel.companionUserId === companionUserId)
    );

    this.data.companionRelations.push(newRelation);
    this.save();
    return newRelation;
  }

  public getCompanionRelationsForPrimary(primaryUserId: string): CompanionRelation[] {
    return this.data.companionRelations.filter(rel => rel.primaryUserId === primaryUserId);
  }

  public getCompanionRelationsForCompanion(companionUserId: string): CompanionRelation[] {
    return this.data.companionRelations.filter(rel => rel.companionUserId === companionUserId);
  }

  public updateCompanionPermissions(
    relationId: string,
    primaryUserId: string,
    permissions: CompanionPermissions
  ): CompanionRelation | null {
    const rel = this.data.companionRelations.find(r => r.id === relationId && r.primaryUserId === primaryUserId);
    if (rel) {
      rel.permissions = permissions;
      this.save();
    }
    return rel;
  }

  public revokeCompanionRelation(relationId: string, userId: string): boolean {
    const lengthBefore = this.data.companionRelations.length;
    // Allow either the primary user or the companion to revoke/remove the linkage
    this.data.companionRelations = this.data.companionRelations.filter(
      rel => rel.id !== relationId || (rel.primaryUserId !== userId && rel.companionUserId !== userId)
    );
    const deleted = this.data.companionRelations.length < lengthBefore;
    if (deleted) this.save();
    return deleted;
  }
}

export const dbInstance = new LocalDatabase();
