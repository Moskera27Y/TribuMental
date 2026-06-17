/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Appointment, 
  AppointmentType, 
  AppointmentStatus, 
  MedicalDocument 
} from "../types";
import { 
  Plus, 
  Trash2, 
  X, 
  FileCheck,
  Paperclip,
  AlertCircle,
  Clock,
  UserRound,
  MapPin
} from "lucide-react";

interface CalendarModuleProps {
  appointments: Appointment[];
  documents: MedicalDocument[];
  onAddAppointment: (appt: any) => Promise<any>;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => Promise<any>;
  onDeleteAppointment: (id: string) => Promise<any>;
  onLinkDocument: (docId: string, apptId: string | undefined) => Promise<any>;
  viewOwnerId: string | null;
}

export default function CalendarModule({
  appointments,
  documents,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onLinkDocument,
  viewOwnerId
}: CalendarModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<AppointmentType>(AppointmentType.PRENATAL);
  const [doctor, setDoctor] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderActive, setReminderActive] = useState(true);

  // Filter keys
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  
  // Doc loading attachments state
  const [linkingDocId, setLinkingDocId] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !doctor || !location) return;

    try {
      await onAddAppointment({
        title,
        date,
        time,
        type,
        doctor,
        location,
        notes,
        reminderActive
      });
      // reset
      setTitle("");
      setDate("");
      setTime("");
      setType(AppointmentType.PRENATAL);
      setDoctor("");
      setLocation("");
      setNotes("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeStyle = (itemType: AppointmentType) => {
    switch (itemType) {
      case AppointmentType.PRENATAL:
        return "bg-[#E9C4C4]/20 text-[#8B5E5E] border-[#E9C4C4]/40";
      case AppointmentType.PEDIATRIC:
        return "bg-[#F4F1ED] text-[#5A634D] border-[#ECE8E0]";
      case AppointmentType.LABORATORY:
        return "bg-[#A3B18A]/15 text-[#5A634D] border-[#A3B18A]/35";
      case AppointmentType.PSYCHOLOGY:
        return "bg-[#8C9B73]/15 text-[#2F3E46] border-[#8C9B73]/35";
      default:
        return "bg-gray-100 text-[#7A7875] border-[#ECE8E0]";
    }
  };

  const getTypeLabel = (itemType: AppointmentType) => {
    switch (itemType) {
      case AppointmentType.PRENATAL: return "Control Prenatal";
      case AppointmentType.PEDIATRIC: return "Pediatría";
      case AppointmentType.LABORATORY: return "Laboratorios / Análisis";
      case AppointmentType.PSYCHOLOGY: return "Acompañamiento Psicológico";
      default: return "Otro";
    }
  };

  // Filter actions
  const filteredAppointments = appointments.filter(a => {
    if (filterType === "ALL") return true;
    return a.type === filterType;
  });

  // Calculate upcoming stats
  const upcomingCount = appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Upcoming Count Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif text-[#2F3E46] font-medium">Calendario de Maternidad</h3>
          <p className="text-xs text-[#7A7875] mt-1">Organiza tus citas obstétricas, ginecológicas y pediátricas, y enlaza tus recetas escaneadas 🌸</p>
        </div>

        {viewOwnerId ? (
          <div className="bg-[#8C9B73]/10 border border-[#8C9B73]/30 px-3.5 py-2.5 rounded-xl text-xs text-[#5A634D] font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            <span>Modo Acompañante de Apoyo (Lectura)</span>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#8C9B73] hover:bg-[#7d8c66] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Cita Médica</span>
          </button>
        )}
      </div>

      {/* Quick stats banner */}
      <div className="p-4 rounded-[30px] bg-white border border-[#ECE8E0] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F4F1ED] text-[#5A634D] flex items-center justify-center font-bold">
            {upcomingCount}
          </div>
          <div>
            <p className="font-semibold text-[#2F3E46]">Tienes {upcomingCount} cita(s) programada(s)</p>
            <p className="text-[10px] text-[#A3A19E]">¿Recordatorios vía WhatsApp activados en tu perfil?</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#8C9B73]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Sincronizado</span>
        </div>
      </div>

      {/* Scheduling Expansion form */}
      {showAddForm && (
        <div className="p-6 rounded-[40px] bg-[#FBF9F4] border border-[#ECE8E0] shadow-sm animate-fadeIn">
          <h3 className="text-md font-serif font-semibold text-[#2F3E46] mb-4">Nueva Cita en tu Agenda</h3>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A634D] mb-1">Título de la Cita</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="E.g. Ecografía Morfológica 20s"
                  className="w-full px-4.5 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-white text-[#2F3E46]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A634D] mb-1">Especialidad / Tipo de Cita</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as AppointmentType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-white cursor-pointer text-[#2F3E46]"
                >
                  <option value={AppointmentType.PRENATAL}>Control Prenatal / Obstetricia</option>
                  <option value={AppointmentType.PEDIATRIC}>Pediatría / Recién Nacido</option>
                  <option value={AppointmentType.LABORATORY}>Laboratorios / Firma Analítica</option>
                  <option value={AppointmentType.PSYCHOLOGY}>Psicología Perinatal</option>
                  <option value={AppointmentType.OTHER}>Otro Especialista</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5A634D] mb-1">Obstetra / Pediatra / Lugar</label>
                <input
                  type="text"
                   required
                  value={doctor}
                  onChange={e => setDoctor(e.target.value)}
                  placeholder="E.g. Dr. Roberto Gómez"
                  className="w-full px-4.5 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-white text-[#2F3E46]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A634D] mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-white cursor-pointer text-[#2F3E46]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A634D] mb-1">Hora</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-white cursor-pointer text-[#2F3E46]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A634D] mb-1">Consultorio / Dirección</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Hospital Quirónsalud, Sala 12"
                className="w-full px-4.5 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-white text-[#2F3E46]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A634D] mb-1">Instrucciones o notas adicionales (Opcional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="E.g. Ayuno de 8 horas, traer última ecografía..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-white text-[#2F3E46]"
              />
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <input
                type="checkbox"
                id="appt-reminder"
                checked={reminderActive}
                onChange={e => setReminderActive(e.target.checked)}
                className="w-4 h-4 accent-[#8C9B73] cursor-pointer"
              />
              <label htmlFor="appt-reminder" className="text-xs font-semibold text-[#2F3E46] cursor-pointer select-none">
                Notificarme por WhatsApp 24 horas antes de esta cita (Soporte Premium)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#ECE8E0] pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold text-[#7A7875] hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#8C9B73] hover:bg-[#7d8c66] text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                Guardar Cita en Calendario 🗓️
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Appointments List workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-5 shadow-sm">
            {/* Filter buttons on top */}
            <div className="flex flex-wrap gap-1.5 mb-5 border-b border-[#ECE8E0] pb-4">
              <button
                onClick={() => setFilterType("ALL")}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase cursor-pointer transition-colors ${
                  filterType === "ALL" ? "bg-[#5A634D] text-white" : "bg-[#F4F1ED] text-[#7A7875] hover:bg-[#eae6e0]"
                }`}
              >
                Todas las Citas {filterType === "ALL" && `(${appointments.length})`}
              </button>
              {Object.values(AppointmentType).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase cursor-pointer transition-colors ${
                    filterType === t ? "bg-[#8C9B73] text-white" : "bg-white text-[#7A7875] border border-[#ECE8E0] hover:bg-[#FBF9F4]"
                  }`}
                >
                  {t === AppointmentType.PRENATAL ? "Embarazo" : t === AppointmentType.PEDIATRIC ? "Pediatría" : t === AppointmentType.LABORATORY ? "Laboratorio" : t === AppointmentType.PSYCHOLOGY ? "Psicología" : "Otros"}
                </button>
              ))}
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#A3A19E]">
                Ninguna cita médica agendada bajo esta categoría.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appt) => {
                  const filteredAssociatedDocs = documents.filter(d => d.appointmentId === appt.id);
                  return (
                    <div 
                      key={appt.id}
                      onClick={() => setSelectedAppt(appt)}
                      className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer transition-all hover:bg-[#FBF9F4] ${
                        selectedAppt?.id === appt.id ? "border-[#8C9B73] ring-1 ring-[#8C9B73]/40 bg-[#FBF9F4]" : "border-[#ECE8E0] bg-white"
                      }`}
                    >
                      <div className="space-y-2">
                        <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getBadgeStyle(appt.type)}`}>
                          {getTypeLabel(appt.type)}
                        </span>
                        
                        <h4 className="text-sm font-serif font-semibold text-[#2F3E46] mt-1">{appt.title}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-[#7A7875] font-medium">
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#8C9B73]" />
                            <span>{appt.date} a las {appt.time} hs</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <UserRound className="w-3.5 h-3.5 text-[#5A634D]" />
                            <span>{appt.doctor}</span>
                          </p>
                          <p className="flex items-center gap-1.5 sm:col-span-2">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{appt.location}</span>
                          </p>
                        </div>

                        {appt.notes && (
                          <div className="text-[10px] bg-[#FBF9F4] text-[#7A7875] p-2.5 rounded-xl border border-[#ECE8E0] italic">
                            Nota: "{appt.notes}"
                          </div>
                        )}

                        {/* List associated medical documents files */}
                        {filteredAssociatedDocs.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 animate-fadeIn">
                            <span className="text-[10px] text-[#A3A19E] font-bold uppercase">Archivos Adjuntos:</span>
                            {filteredAssociatedDocs.map(doc => (
                              <span 
                                key={doc.id}
                                className="inline-flex items-center gap-1 bg-[#F4F1ED] border border-[#ECE8E0] text-[10px] text-[#5A634D] px-2 py-0.5 rounded-lg"
                              >
                                <Paperclip className="w-2.5 h-2.5" />
                                <span className="max-w-32 truncate">{doc.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Control Checkboxes */}
                      <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 self-stretch border-t sm:border-t-0 border-[#ECE8E0] pt-3 sm:pt-0 shrink-0">
                        {viewOwnerId ? (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                            appt.status === AppointmentStatus.COMPLETED 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                              : appt.status === AppointmentStatus.CANCELLED
                              ? "bg-red-50 text-red-800 border-red-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}>
                            {appt.status === AppointmentStatus.COMPLETED ? "Completada" : appt.status === AppointmentStatus.CANCELLED ? "Cancelada" : "Programada"}
                          </span>
                        ) : (
                          <>
                            <select
                              value={appt.status}
                              onChange={(e) => onUpdateAppointment(appt.id, { status: e.target.value as AppointmentStatus })}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] font-bold bg-white border border-[#ECE8E0] text-[#2F3E46] rounded-lg p-1 px-2 cursor-pointer focus:outline-none"
                            >
                              <option value={AppointmentStatus.SCHEDULED}>Programada</option>
                              <option value={AppointmentStatus.COMPLETED}>Completada 🟢</option>
                              <option value={AppointmentStatus.CANCELLED}>Cancelada 🛑</option>
                            </select>
                            
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onDeleteAppointment(appt.id); if (selectedAppt?.id === appt.id) setSelectedAppt(null); }}
                              className="p-1 px-2 rounded-lg hover:bg-rose-50 text-rose-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Borrar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Appointment Detail & Document Association */}
        <div className="space-y-4">
          <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-5 shadow-sm">
            <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest mb-3 flex items-center gap-1">
              <Paperclip className="w-4 h-4 text-[#8C9B73]" />
              Enlazar Expedientes
            </h4>

            {selectedAppt ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#FBF9F4] rounded-2xl border border-[#ECE8E0]">
                  <p className="text-xs font-semibold text-[#5A634D]">Asociar a la cita:</p>
                  <p className="text-[11px] text-[#2F3E46] font-mono mt-0.5 truncate">{selectedAppt.title}</p>
                </div>

                {viewOwnerId ? (
                  <p className="text-xs text-[#7A7875] bg-[#FBF9F4] p-3.5 rounded-xl border border-dashed border-[#ECE8E0] italic text-center leading-relaxed">
                    Como acompañante de apoyo, estás en Modo Lectura y no puedes modificar o adjuntar nuevos expedientes médicos a esta cita.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-bold text-[#A3A19E] uppercase">Selecciona receta o análisis:</label>
                    
                    {documents.length === 0 ? (
                      <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>No posees documentos en tus expedientes todavía. Sube uno primero en la sección "Expedientes".</span>
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <select
                          value={linkingDocId}
                          onChange={(e) => setLinkingDocId(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-white border border-[#ECE8E0] text-[#2F3E46] cursor-pointer focus:outline-none"
                        >
                        <option value="">-- Elige un documento listado --</option>
                        {documents.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.type}) {d.appointmentId === selectedAppt.id ? "[Ya enlazado]" : ""}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={!linkingDocId}
                        onClick={async () => {
                          if (!linkingDocId) return;
                          await onLinkDocument(linkingDocId, selectedAppt.id);
                          setLinkingDocId("");
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                          linkingDocId ? "bg-[#8C9B73] text-white hover:bg-[#7d8c66]" : "bg-gray-150 text-gray-400 pointer-events-none"
                        }`}
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Vincular Archivo</span>
                      </button>
                    </div>
                  )}
                  </div>
                )}

                {/* Show currently linked to selected appointment */}
                <div className="border-t border-[#ECE8E0] pt-4 space-y-2.5">
                  <p className="text-xs font-bold text-[#5A634D] uppercase tracking-wider">Archivos en esta fecha:</p>
                  {documents.filter(d => d.appointmentId === selectedAppt.id).length === 0 ? (
                    <p className="text-[10px] text-[#A3A19E] italic">No hay ningún archivo médico adjunto a esta fecha por el momento.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {documents.filter(d => d.appointmentId === selectedAppt.id).map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#F4F1ED] border border-[#ECE8E0] text-[#5A634D]">
                          <span className="truncate pr-2">{doc.name}</span>
                          {!viewOwnerId && (
                            <button
                              type="button"
                              onClick={() => onLinkDocument(doc.id, undefined)}
                              className="text-red-500 hover:text-red-700 font-bold hover:bg-rose-50 p-1 rounded cursor-pointer"
                              title="Desvincular"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#A3A19E] text-center py-6 leading-relaxed">
                Selecciona una de tus citas médicas en la lista para poder adjuntarle un archivo o receta escaneada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
