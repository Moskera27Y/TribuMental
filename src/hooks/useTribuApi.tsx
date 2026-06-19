/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

interface TribuContextType {
  user: User | null;
  profile: Profile | null;
  subscription: Subscription | null;
  checkins: MoodCheckIn[];
  reminders: Reminder[];
  appointments: Appointment[];
  documents: MedicalDocument[];
  whatsappLogs: WhatsAppMessageLog[];
  supportContacts: SupportContact[];
  careplanTasks: CareplanTask[];
  viewOwnerId: string | null;
  setViewOwnerId: (id: string | null) => void;
  companionRelations: {asPrimary: CompanionRelation[], asCompanion: CompanionRelation[]};
  sentInvitations: CompanionInvitation[];
  receivedInvitations: CompanionInvitation[];
  fetchCompanionData: () => Promise<void>;
  sendCompanionInvitation: (email: string, name: string, perms: CompanionPermissions) => Promise<any>;
  respondToInvitation: (id: string, status: "accepted" | "declined") => Promise<boolean>;
  updateCompanionPermissions: (id: string, perms: CompanionPermissions) => Promise<any>;
  revokeCompanionRelation: (id: string) => Promise<boolean>;
  addCheckInConversationMessage: (checkInId: string, text: string) => Promise<any>;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  refreshSession: () => Promise<void>;
  login: (name: string, email: string) => Promise<User>;
  signin: (email: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>;
  addCheckIn: (moodValue: number, moodEmoji: string, note?: string) => Promise<any>;
  addAppointment: (appt: any) => Promise<any>;
  updateAppointment: (id: string, updates: any) => Promise<any>;
  deleteAppointment: (id: string) => Promise<boolean>;
  addDocument: (doc: any) => Promise<any>;
  updateDocument: (id: string, updates: any) => Promise<any>;
  deleteDocument: (id: string) => Promise<boolean>;
  analyzeDocument: (fileName: string, fileType: string, fileDataUrl: string) => Promise<any>;
  sendWhatsAppMessage: (body: string, category: any) => Promise<any>;
  handleCheckout: (plan: string) => Promise<any>;
  getGoogleAuthUrl: () => Promise<any>;
  analyzeMentalHealth: (answers: string[]) => Promise<any>;
}

const TribuApiContext = createContext<TribuContextType | undefined>(undefined);

export function TribuApiProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [viewOwnerId, setViewOwnerId] = useState<string | null>(null);
  const [companionRelations, setCompanionRelations] = useState<{asPrimary: CompanionRelation[], asCompanion: CompanionRelation[]}>({ asPrimary: [], asCompanion: [] });
  const [sentInvitations, setSentInvitations] = useState<CompanionInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<CompanionInvitation[]>([]);

  const [checkins, setCheckins] = useState<MoodCheckIn[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [whatsappLogs, setWhatsAppLogs] = useState<WhatsAppMessageLog[]>([]);
  const [supportContacts, setSupportContacts] = useState<SupportContact[]>([]);
  const [careplanTasks, setCareplanTasks] = useState<CareplanTask[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorString, setErrorString] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setErrorString(null);
      // Usamos la URL absoluta si estamos en modo nativo (APK)
      const baseUrl = window.location.origin.includes('localhost') ? '' : 'https://tribumental.onrender.com';
      const res = await fetch(`${baseUrl}/api/auth/session`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        setSubscription(data.subscription);
      } else {
        setUser(null);
        setProfile(null);
        setSubscription(null);
      }
    } catch (err: any) {
      console.error("Failed to load TribuMental session:", err);
      setErrorString("Error de conexión al cargar la sesión.");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (name: string, email: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });
      if (!res.ok) throw new Error("Error al iniciar sesión");
      const data = await res.json();
      setUser(data.user);
      setProfile(data.profile);
      setSubscription(data.subscription);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const getGoogleAuthUrl = async () => {
    const res = await fetch("/api/auth/google/url");
    if (!res.ok) throw new Error("Error conectando con el servicio de autenticación.");
    return await res.json();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("No se pudo actualizar el perfil");
    const updatedProfile = await res.json();
    setProfile(updatedProfile);
    fetchCareplan();
    return updatedProfile;
  };

  const fetchCareplan = useCallback(async () => {
    try {
      const res = await fetch("/api/careplan");
      if (res.ok) setCareplanTasks(await res.json());
    } catch (err) { console.error("Error loading care tasks", err); }
  }, []);

  const fetchCheckins = useCallback(async (viewOwner?: string) => {
    try {
      const owner = viewOwner !== undefined ? viewOwner : viewOwnerId;
      const url = owner ? `/api/checkins?viewOwnerId=${owner}` : "/api/checkins";
      const res = await fetch(url);
      if (res.ok) setCheckins(await res.json());
    } catch (err) { console.error("Error loading check-ins", err); }
  }, [viewOwnerId]);

  const addCheckIn = async (moodValue: number, moodEmoji: string, note?: string) => {
    const todayString = new Date().toISOString().split("T")[0];
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moodValue, moodEmoji, note, date: todayString })
    });
    if (!res.ok) throw new Error("Error guardando el registro de ánimo");
    const saved = await res.json();
    setCheckins(prev => [saved, ...prev.filter(c => c.date !== todayString)]);
    return saved;
  };

  const fetchAppointments = useCallback(async (viewOwner?: string) => {
    try {
      const owner = viewOwner !== undefined ? viewOwner : viewOwnerId;
      const url = owner ? `/api/appointments?viewOwnerId=${owner}` : "/api/appointments";
      const res = await fetch(url);
      if (res.ok) setAppointments(await res.json());
    } catch (err) { console.error("Error loading calendar appointments", err); }
  }, [viewOwnerId]);

  const addAppointment = async (appt: any) => {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appt)
    });
    if (!res.ok) throw new Error("No se pudo agendar la cita médica");
    const newAppt = await res.json();
    setAppointments(prev => [...prev, newAppt].sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime()));
    return newAppt;
  };

  const updateAppointment = async (id: string, updates: any) => {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("No se pudo actualizar la cita médica");
    const updated = await res.json();
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  };

  const deleteAppointment = async (id: string) => {
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo eliminar la cita");
    setAppointments(prev => prev.filter(a => a.id !== id));
    return true;
  };

  const fetchDocuments = useCallback(async (viewOwner?: string) => {
    try {
      const owner = viewOwner !== undefined ? viewOwner : viewOwnerId;
      const url = owner ? `/api/documents?viewOwnerId=${owner}` : "/api/documents";
      const res = await fetch(url);
      if (res.ok) setDocuments(await res.json());
    } catch (err) { console.error("Error loading documents", err); }
  }, [viewOwnerId]);

  const addDocument = async (doc: any) => {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc)
    });
    if (!res.ok) throw new Error("No se pudo archivar el documento");
    const newDoc = await res.json();
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDocument = async (id: string, updates: any) => {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("No se pudo actualizar el documento");
    const updated = await res.json();
    setDocuments(prev => prev.map(d => d.id === id ? updated : d));
    return updated;
  };

  const deleteDocument = async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo eliminar el documento");
    setDocuments(prev => prev.filter(d => d.id !== id));
    return true;
  };

  const analyzeDocument = async (fileName: string, fileType: string, fileDataUrl: string) => {
    const res = await fetch("/api/documents/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType, fileDataUrl })
    });
    if (!res.ok) throw new Error("Error analizando documento");
    return await res.json();
  };

  const sendWhatsAppMessage = async (body: string, category: any) => {
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
    setWhatsAppLogs(prev => [data.log, ...prev]);
    return data;
  };

  const handleCheckout = async (plan: string) => {
    const res = await fetch("/api/wompi/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    if (!res.ok) throw new Error("Error conectando con la pasarela Wompi.");
    return await res.json();
  };

  const fetchCompanionData = useCallback(async () => {
    try {
      const [relRes, sentRes, recvRes] = await Promise.all([
        fetch("/api/companion/relations"),
        fetch("/api/companion/invitations/sent"),
        fetch("/api/companion/invitations/received")
      ]);
      if (relRes.ok) setCompanionRelations(await relRes.json());
      if (sentRes.ok) setSentInvitations(await sentRes.json());
      if (recvRes.ok) setReceivedInvitations(await recvRes.json());
    } catch (err) { console.error("Error loading companion details", err); }
  }, []);

  const sendCompanionInvitation = async (companionEmail: string, companionName: string, permissions: CompanionPermissions) => {
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
  };

  const respondToInvitation = async (id: string, status: "accepted" | "declined") => {
    const res = await fetch(`/api/companion/invitations/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("No se pudo responder a la invitación");
    await fetchCompanionData();
    return true;
  };

  const updateCompanionPermissions = async (id: string, permissions: CompanionPermissions) => {
    const res = await fetch(`/api/companion/relations/${id}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions })
    });
    if (!res.ok) throw new Error("No se pudieron actualizar los permisos");
    const updated = await res.json();
    setCompanionRelations(prev => ({ ...prev, asPrimary: prev.asPrimary.map(r => r.id === id ? updated : r) }));
    return updated;
  };

  const revokeCompanionRelation = async (id: string) => {
    const res = await fetch(`/api/companion/relations/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo revocar la conexión");
    setCompanionRelations(prev => ({
      asPrimary: prev.asPrimary.filter(r => r.id !== id),
      asCompanion: prev.asCompanion.filter(r => r.id !== id)
    }));
    if (viewOwnerId) setViewOwnerId(null);
    return true;
  };

  const addCheckInConversationMessage = async (checkInId: string, text: string) => {
    const res = await fetch(`/api/checkin/${checkInId}/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, viewOwnerId })
    });
    if (!res.ok) throw new Error("No se pudo enviar el mensaje");
    const updatedCheckIn = await res.json();
    setCheckins(prev => prev.map(c => c.id === checkInId ? updatedCheckIn : c));
    return updatedCheckIn;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null); setProfile(null); setSubscription(null);
      window.location.href = "/";
    } catch (err) { window.location.reload(); }
  };

  useEffect(() => { refreshSession(); }, [refreshSession]);

  useEffect(() => {
    if (user) {
      fetchCareplan();
      fetchCheckins(viewOwnerId || undefined);
      fetchAppointments(viewOwnerId || undefined);
      fetchDocuments(viewOwnerId || undefined);
      fetchCompanionData();
    }
  }, [user, viewOwnerId, fetchCareplan, fetchCheckins, fetchAppointments, fetchDocuments, fetchCompanionData]);

  const analyzeMentalHealth = async (answers: string[]) => {
    const res = await fetch("/api/mental-health/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error("Error analizando perfil psicológico");
    const data = await res.json();
    setProfile(data.profile);
    return data;
  };

  const value = {
    user, profile, subscription, checkins, reminders, appointments, documents,
    whatsappLogs, supportContacts, careplanTasks, viewOwnerId, setViewOwnerId,
    companionRelations, sentInvitations, receivedInvitations, fetchCompanionData,
    sendCompanionInvitation, respondToInvitation, updateCompanionPermissions,
    revokeCompanionRelation, addCheckInConversationMessage, loading, error: errorString,
    setError: setErrorString, refreshSession, login, signin, logout: handleLogout,
    updateProfile, addCheckIn, addAppointment, updateAppointment, deleteAppointment,
    addDocument, updateDocument, deleteDocument, analyzeDocument, sendWhatsAppMessage,
    handleCheckout, getGoogleAuthUrl, analyzeMentalHealth
  };

  return <TribuApiContext.Provider value={value}>{children}</TribuApiContext.Provider>;
}

export function useTribuApi() {
  const context = useContext(TribuApiContext);
  if (context === undefined) {
    throw new Error("useTribuApi must be used within a TribuApiProvider");
  }
  return context;
}
