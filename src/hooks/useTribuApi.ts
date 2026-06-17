/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
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
  CareplanTask,
  CompanionPermissions,
  CompanionInvitation,
  CompanionRelation
} from "../types";

export function useTribuApi() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Supportive Companion Plan & Shared Workspace states
  const [viewOwnerId, setViewOwnerId] = useState<string | null>(null);
  const [companionRelations, setCompanionRelations] = useState<{asPrimary: CompanionRelation[], asCompanion: CompanionRelation[]}>({ asPrimary: [], asCompanion: [] });
  const [sentInvitations, setSentInvitations] = useState<CompanionInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<CompanionInvitation[]>([]);
  
  const [checkins, setCheckins] = useState<MoodCheckIn[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppMessageLog[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
  const [careplanTasks, setCareplanTasks] = useState<CareplanTask[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorString, setErrorString] = useState<string | null>(null);

  // Fetch all initial user data or start session
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setErrorString(null);
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        setSubscription(data.subscription);
      } else {
        // Not authenticated yet, clean state
        setUser(null);
        setProfile(null);
        setSubscription(null);
      }
    } catch (err: any) {
      console.error("Failed to load TribuMental session:", err);
      setErrorString("Error de conexión al cargar la sesión. Intentando de nuevo...");
    } finally {
      setLoading(false);
    }
  }, []);

  // Simple mock login / registration
  const login = async (name: string, email: string) => {
    try {
      setLoading(true);
      setErrorString(null);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al iniciar sesión");
      }
      const data = await res.json();
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
      return data.user;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Session sign-in without requiring a name
  const signin = async (email: string) => {
    try {
      setLoading(true);
      setErrorString(null);
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al iniciar sesión");
      }
      const data = await res.json();
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
      return data.user;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In helper retrieves authentication / simulator redirect URLs
  const getGoogleAuthUrl = async () => {
    try {
      const res = await fetch("/api/auth/google/url");
      if (!res.ok) throw new Error("Error conectando con el servicio de autenticación.");
      return await res.json();
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Update mother profile settings
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setErrorString(null);
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("No se pudo actualizar el perfil");
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      // reload care plan list
      fetchCareplan();
      return updatedProfile;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Fetch Care Plan Tasks
  const fetchCareplan = useCallback(async () => {
    try {
      const res = await fetch("/api/careplan");
      if (res.ok) {
        const tasks = await res.json();
        setCareplanTasks(tasks);
      }
    } catch (err) {
      console.error("Error loading care tasks", err);
    }
  }, []);

  // Fetch Check-ins
  const fetchCheckins = useCallback(async (viewOwner?: string) => {
    try {
      const owner = viewOwner !== undefined ? viewOwner : viewOwnerId;
      const url = owner ? `/api/checkins?viewOwnerId=${owner}` : "/api/checkins";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCheckins(data);
      }
    } catch (err) {
      console.error("Error loading check-ins", err);
    }
  }, [viewOwnerId]);

  // Add Mood Check-in
  const addCheckIn = async (moodValue: number, moodEmoji: string, note?: string) => {
    try {
      const todayString = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodValue,
          moodEmoji,
          note,
          date: todayString
        })
      });
      if (!res.ok) throw new Error("Error guardando el registro de ánimo");
      const saved = await res.json();
      
      // Update checkins state in-place
      setCheckins(prev => {
        const filtered = prev.filter(c => c.date !== todayString);
        return [saved, ...filtered];
      });
      return saved;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Fetch Appointments
  const fetchAppointments = useCallback(async (viewOwner?: string) => {
    try {
      const owner = viewOwner !== undefined ? viewOwner : viewOwnerId;
      const url = owner ? `/api/appointments?viewOwnerId=${owner}` : "/api/appointments";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error loading calendar appointments", err);
    }
  }, [viewOwnerId]);

  // Create Appointment
  const addAppointment = async (appt: Omit<Appointment, "id" | "userId" | "createdAt" | "status">) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appt)
      });
      if (!res.ok) throw new Error("No se pudo agendar la cita médica");
      const newAppt = await res.json();
      setAppointments(prev => [...prev, newAppt].sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime()));
      return newAppt;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Update Appointment (Status or notes)
  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("No se pudo actualizar la cita médica");
      const updated = await res.json();
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Delete Appointment
  const deleteAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("No se pudo eliminar la cita");
      setAppointments(prev => prev.filter(a => a.id !== id));
      // Unlink documents too locally
      setDocuments(prev => prev.map(d => d.appointmentId === id ? { ...d, appointmentId: undefined } : d));
      return true;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Fetch Documents
  const fetchDocuments = useCallback(async (viewOwner?: string) => {
    try {
      const owner = viewOwner !== undefined ? viewOwner : viewOwnerId;
      const url = owner ? `/api/documents?viewOwnerId=${owner}` : "/api/documents";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error loading documents", err);
    }
  }, [viewOwnerId]);

  // Save Scanned Medical Document
  const addDocument = async (doc: Omit<MedicalDocument, "id" | "userId" | "uploadedAt">) => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc)
      });
      if (!res.ok) throw new Error("No se pudo archivar el documento");
      const newDoc = await res.json();
      setDocuments(prev => [newDoc, ...prev]);
      return newDoc;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Update Document (e.g. rename or association)
  const updateDocument = async (id: string, updates: Partial<MedicalDocument>) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("No se pudo actualizar el documento");
      const updated = await res.json();
      setDocuments(prev => prev.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Delete Document
  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("No se pudo eliminar el documento de los expedientes");
      setDocuments(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Scan & Analyze via Gemini OCR
  const analyzeDocument = async (fileName: string, fileType: string, fileDataUrl: string) => {
    try {
      const res = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType, fileDataUrl })
      });
      if (!res.ok) throw new Error("Error analizando documento con el motor AI OCR");
      return await res.json(); // { ocrText, extractedMetadata }
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Fetch WhatsApp Logs
  const fetchWhatsappLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/logs");
      if (res.ok) {
        const data = await res.json();
        setWhatsappLogs(data);
      }
    } catch (err) {
      console.error("Error loading chat logs", err);
    }
  }, []);

  // Send Simulated WhatsApp Message
  const sendWhatsAppMessage = async (body: string, category: "UTILITY" | "MARKETING" | "AUTHENTICATION") => {
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, category })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Error al enviar mensaje.");
      }
      const data = await res.json();
      setWhatsappLogs(prev => [data.log, ...prev]);
      return data;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Wompi Subscription Checkout
  const handleCheckout = async (plan: string) => {
    try {
      const res = await fetch("/api/wompi/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (!res.ok) throw new Error("Error conectando con la pasarela Wompi.");
      const data = await res.json();
      return data;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Fetch Support Contacts
  const fetchSupportContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/support-contacts");
      if (res.ok) {
        const data = await res.json();
        setSupportContacts(data);
      }
    } catch (err) {
      console.error("Error loading contacts", err);
    }
  }, []);

  // Initial loading trigger
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Companion / Family Plan Methods
  const fetchCompanionData = useCallback(async () => {
    try {
      const [relRes, sentRes, recvRes] = await Promise.all([
        fetch("/api/companion/relations"),
        fetch("/api/companion/invitations/sent"),
        fetch("/api/companion/invitations/received")
      ]);
      
      if (relRes.ok) {
        const data = await relRes.json();
        setCompanionRelations(data);
      }
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentInvitations(data);
      }
      if (recvRes.ok) {
        const data = await recvRes.json();
        setReceivedInvitations(data);
      }
    } catch (err) {
      console.error("Error loading support companion details", err);
    }
  }, []);

  const sendCompanionInvitation = async (companionEmail: string, companionName: string, permissions: CompanionPermissions) => {
    try {
      setErrorString(null);
      const res = await fetch("/api/companion/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionEmail, companionName, permissions })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo enviar la invitación");
      }
      const data = await res.json();
      setSentInvitations(prev => [...prev, data]);
      return data;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  const respondToInvitation = async (id: string, status: "accepted" | "declined") => {
    try {
      setErrorString(null);
      const res = await fetch(`/api/companion/invitations/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo responder a la invitación");
      }
      
      // Refresh invitations and active connections in-place
      await fetchCompanionData();
      return true;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  const updateCompanionPermissions = async (id: string, permissions: CompanionPermissions) => {
    try {
      setErrorString(null);
      const res = await fetch(`/api/companion/relations/${id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudieron actualizar los permisos");
      }
      const updated = await res.json();
      setCompanionRelations(prev => ({
        ...prev,
        asPrimary: prev.asPrimary.map(r => r.id === id ? updated : r)
      }));
      return updated;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  const revokeCompanionRelation = async (id: string) => {
    try {
      setErrorString(null);
      const res = await fetch(`/api/companion/relations/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("No se pudo revocar la conexión de acompañamiento");
      
      setCompanionRelations(prev => ({
        asPrimary: prev.asPrimary.filter(r => r.id !== id),
        asCompanion: prev.asCompanion.filter(r => r.id !== id)
      }));
      if (viewOwnerId) {
        // If we were viewing that mother's profile, reset view to ourselves
        setViewOwnerId(null);
      }
      return true;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Follow-up empathetic conversational message
  const addCheckInConversationMessage = async (checkInId: string, text: string) => {
    try {
      setErrorString(null);
      const res = await fetch(`/api/checkin/${checkInId}/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, viewOwnerId })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo enviar el mensaje");
      }
      const updatedCheckIn = await res.json();
      setCheckins(prev => prev.map(c => c.id === checkInId ? updatedCheckIn : c));
      return updatedCheckIn;
    } catch (err: any) {
      setErrorString(err.message);
      throw err;
    }
  };

  // Secondary dynamic queries once user profile is active
  useEffect(() => {
    if (user) {
      fetchCareplan();
      fetchCheckins(viewOwnerId || undefined);
      fetchAppointments(viewOwnerId || undefined);
      fetchDocuments(viewOwnerId || undefined);
      fetchWhatsappLogs();
      fetchSupportContacts();
      fetchCompanionData();
    }
  }, [user, viewOwnerId, fetchCareplan, fetchCheckins, fetchAppointments, fetchDocuments, fetchWhatsappLogs, fetchSupportContacts, fetchCompanionData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setProfile(null);
      setSubscription(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.reload();
    }
  };

  return {
    user,
    profile,
    subscription,
    checkins,
    reminders,
    appointments,
    documents,
    whatsappLogs,
    supportContacts,
    careplanTasks,
    viewOwnerId,
    setViewOwnerId,
    companionRelations,
    sentInvitations,
    receivedInvitations,
    fetchCompanionData,
    sendCompanionInvitation,
    respondToInvitation,
    updateCompanionPermissions,
    revokeCompanionRelation,
    addCheckInConversationMessage,
    loading,
    error: errorString,
    setError: setErrorString,
    refreshSession,
    login,
    signin,
    logout: handleLogout,
    updateProfile,
    addCheckIn,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addDocument,
    updateDocument,
    deleteDocument,
    analyzeDocument,
    sendWhatsAppMessage,
    handleCheckout,
    getGoogleAuthUrl
  };
}
