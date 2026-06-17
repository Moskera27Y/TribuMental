import React, { useState } from "react";
import { 
  Users, 
  Send, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Heart, 
  AlertCircle, 
  Trash2,
  Sparkles,
  RefreshCw,
  Mail,
  UserCheck
} from "lucide-react";
import { SubscriptionPlan, CompanionPermissions } from "../types";

interface CompanionModuleProps {
  subscription: any;
  sentInvitations: any[];
  receivedInvitations: any[];
  companionRelations: { asPrimary: any[], asCompanion: any[] };
  sendCompanionInvitation: (email: string, name: string, permissions: CompanionPermissions) => Promise<any>;
  respondToInvitation: (id: string, status: "accepted" | "declined") => Promise<any>;
  updateCompanionPermissions: (id: string, permissions: CompanionPermissions) => Promise<any>;
  revokeCompanionRelation: (id: string) => Promise<any>;
  handleCheckout: (plan: string) => Promise<any>;
}

export default function CompanionModule({
  subscription,
  sentInvitations,
  receivedInvitations,
  companionRelations,
  sendCompanionInvitation,
  respondToInvitation,
  updateCompanionPermissions,
  revokeCompanionRelation,
  handleCheckout
}: CompanionModuleProps) {
  const [emailForm, setEmailForm] = useState("");
  const [nameForm, setNameForm] = useState("");
  const [permissionsForm, setPermissionsForm] = useState<CompanionPermissions>({
    viewCalendar: true,
    viewDocuments: false,
    viewCheckins: true
  });
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [editingPermissionsId, setEditingPermissionsId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<CompanionPermissions | null>(null);

  const isFamily = subscription?.plan === SubscriptionPlan.FAMILY;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm || !nameForm) {
      setStatusMessage({ text: "Por favor, completa el nombre y correo de tu acompañante.", isError: true });
      return;
    }
    try {
      setLoading(true);
      setStatusMessage(null);
      await sendCompanionInvitation(emailForm, nameForm, permissionsForm);
      setStatusMessage({ text: "¡Invitación de acompañamiento enviada con éxito!", isError: false });
      setEmailForm("");
      setNameForm("");
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Error al enviar la invitación.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id: string, status: "accepted" | "declined") => {
    try {
      setLoading(true);
      setStatusMessage(null);
      await respondToInvitation(id, status);
      setStatusMessage({ 
        text: status === "accepted" ? "Has aceptado la invitación con éxito." : "Has declinado la invitación.", 
        isError: false 
      });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Error al responder.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async (relationId: string) => {
    if (!editPermissions) return;
    try {
      setLoading(true);
      setStatusMessage(null);
      await updateCompanionPermissions(relationId, editPermissions);
      setStatusMessage({ text: "Permisos de acompañamiento actualizados.", isError: false });
      setEditingPermissionsId(null);
      setEditPermissions(null);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Error al guardar permisos.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (relationId: string) => {
    if (!window.confirm("¿Estás segura de que deseas revocar el acceso a este acompañante? No podrá ver ningún dato tuyo inmediatamente.")) {
      return;
    }
    try {
      setLoading(true);
      setStatusMessage(null);
      await revokeCompanionRelation(relationId);
      setStatusMessage({ text: "Se ha revocado el acceso al acompañante con éxito.", isError: false });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Error al revocar acceso.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  const triggerUpgrade = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      await handleCheckout(SubscriptionPlan.FAMILY);
      setStatusMessage({ text: "¡Felicitaciones! Te has actualizado al Plan Familiar. Ya puedes invitar a tus seres queridos.", isError: false });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Error de checkout.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Visual Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#ECE8E0]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C9B73] font-bold">MONETIZACIÓN Y SOPORTE COLECTIVO</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2F3E46] font-serif mt-1">Acompañamiento Familiar</h2>
          <p className="text-sm text-[#7A7875] mt-1">
            Permite que tu pareja, doula o familiar de confianza acompañe tus progresos, citas médicas y expedientes con seguridad granulares.
          </p>
        </div>
        <div className="bg-[#E9C4C4]/20 border border-[#E9C4C4]/50 rounded-2xl px-4 py-2 text-xs font-semibold text-[#8B5E5E] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#8C9B73]" />
          Plan Activo: <span className="uppercase text-[#2F3E46] font-bold">{subscription?.plan || "GRATUITO"}</span>
        </div>
      </div>

      {statusMessage && (
        <div id="companion-alert-banner" className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
          statusMessage.isError 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          <AlertCircle className={`w-5 h-5 shrink-0 ${statusMessage.isError ? "text-red-500" : "text-emerald-500"}`} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. MARKETING IF NOT FAMILY */}
      {!isFamily && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ECE8E0] shadow-sm relative overflow-hidden">
          {/* Decorative Warm Background Pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#8C9B73]/5 rounded-full filter blur-2xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E9C4C4]/5 rounded-full filter blur-xl -ml-12 -mb-12"></div>

          <div className="max-w-2xl text-center md:text-left space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-[#8C9B73]/15 text-[#5A634D] text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-[#5A634D]" /> ACCESO EXCLUSIVO
            </span>
            <h3 className="text-xl md:text-2xl font-bold font-serif text-[#2F3E46]">TribuMental Plan Familiar & Companion</h3>
            <p className="text-sm text-[#7A7875] leading-relaxed">
              La maternidad no se vive de forma aislada. Con el Plan Familiar, puedes otorgar accesos de lectura sumamente controlados y consentidos a un compañero de apoyo (pareja, madre, amiga o doula) para que asista a tu viaje emocional con empatía profunda desde su propia pantalla.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 pb-6">
              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE8E0] text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#8C9B73]/15 text-[#5A634D] flex items-center justify-center mx-auto">
                  <Calendar className="w-5 h-5 text-[#8C9B73]" />
                </div>
                <h4 className="font-semibold text-xs text-[#2F3E46]">Visualizar Calendario</h4>
                <p className="text-[10px] text-[#7A7875]">Tus familiares podrán conocer la fecha y hora de ecografías o citas ginecológicas sin necesidad de preguntarte.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE8E0] text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#8C9B73]/15 text-[#5A634D] flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5 text-[#8C9B73]" />
                </div>
                <h4 className="font-semibold text-xs text-[#2F3E46]">Ver Expedientes Scans</h4>
                <p className="text-[10px] text-[#7A7875]">Comparte de forma directa las recetas o informes médicos escaneados con tu doula en tiempo real.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE8E0] text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#8C9B73]/15 text-[#5A634D] flex items-center justify-center mx-auto">
                  <Heart className="w-5 h-5 text-[#8C9B73]" />
                </div>
                <h4 className="font-semibold text-xs text-[#2F3E46]">Acompañamiento Diario</h4>
                <p className="text-[10px] text-[#7A7875]">Visualizar tus registros de ánimo diarios para saber exactamente cuándo necesitas un té o un abrazo cálido.</p>
              </div>
            </div>

            <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-dashed border-[#ECE8E0] text-xs text-[#7A7875] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#8C9B73] shrink-0 mt-0.5" />
              <span>
                <strong>Privacidad Garantizada:</strong> Tus acompañantes tienen acceso <strong>estrictamente de lectura</strong>. Bajo ninguna circunstancia podrán eliminar o editar tus datos. Podrás revocar su invitación o cambiar permisos de manera inmediata las 24 horas del día.
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={triggerUpgrade}
                disabled={loading}
                className="w-full md:w-auto bg-[#8C9B73] hover:bg-[#77865F] text-white text-sm font-semibold tracking-wide px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Actualizar al Plan Familiar — $59.900 COP / mes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RECEIVED INVITATIONS FROM OTHERS (Always visible for multi-account compatibility!) */}
      {receivedInvitations?.length > 0 && (
        <div className="bg-[#8C9B73]/5 border border-[#8C9B73]/20 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-[#8C9B73]" />
            <h3 className="text-lg font-serif font-bold text-[#2F3E46]">Invitaciones de Acompañamiento Recibidas</h3>
          </div>
          <p className="text-xs text-[#7A7875] mb-4">
            Otras usuarias te han invitado a ser su Compañero/a de Apoyo de TribuMental para asistir en su embarazo o posparto:
          </p>
          <div className="space-y-4">
            {receivedInvitations.map((inv) => (
              <div key={inv.id} className="bg-white p-4 rounded-2xl border border-[#ECE8E0] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-semibold text-sm text-[#2F3E46]">{inv.primaryUserName || "Una mamá"}</p>
                  <p className="text-[#7A7875]">{inv.primaryUserEmail}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] bg-[#FBF9F4] p-2 rounded-lg border border-[#ECE8E0]">
                    <span className="font-medium text-[#7A7875]">Permisos solicitados:</span>
                    <span className={`px-1.5 py-0.5 rounded leading-none ${inv.permissions.viewCalendar ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-400"}`}>Citas</span>
                    <span className={`px-1.5 py-0.5 rounded leading-none ${inv.permissions.viewDocuments ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-400"}`}>Expedientes</span>
                    <span className={`px-1.5 py-0.5 rounded leading-none ${inv.permissions.viewCheckins ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-400"}`}>Estados de Ánimo</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespond(inv.id, "accepted")}
                    disabled={loading}
                    className="bg-[#8C9B73] hover:bg-[#77865F] text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs"
                  >
                    Aceptar Apoyo
                  </button>
                  <button
                    onClick={() => handleRespond(inv.id, "declined")}
                    disabled={loading}
                    className="border border-[#E9C4C4] text-[#8B5E5E] hover:bg-[#E9C4C4]/10 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PRIMARY FUNCTIONS IF FAMILY PLAN STAGE */}
      {isFamily && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left panel: Send Invitation */}
          <div className="bg-white rounded-3xl p-6 border border-[#ECE8E0] shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2F3E46] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#8C9B73]" /> Invitar a un ser querido
              </h3>
              <p className="text-xs text-[#7A7875] mt-1">
                Agrega su correo y elige con precisión qué puede observar del Portal. Recibirá acceso directo de lectura.
              </p>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#5A634D]">Nombre del Acompañante</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A3A19E]">
                    <Users className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nameForm}
                    onChange={(e) => setNameForm(e.target.value)}
                    placeholder="Ej. Papá de Sofía, Mi Doula, Tía Clara"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ECE8E0] bg-[#FBF9F4] focus:outline-none focus:border-[#8C9B73] text-sm text-[#2F3E46] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#5A634D]">Correo Electrónico del Acompañante</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#A3A19E]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                    placeholder="ejemplo@apoyo.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ECE8E0] bg-[#FBF9F4] focus:outline-none focus:border-[#8C9B73] text-sm text-[#2F3E46] transition-all"
                  />
                </div>
              </div>

              {/* Granular Permission Toggles */}
              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE8E0] space-y-3">
                <p className="font-bold text-[#2F3E46] border-b border-[#ECE8E0] pb-2">Consentimientos de Privacidad</p>
                
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 pr-2">
                    <p className="font-semibold text-[#2F3E46]">Visualizar Agenda y Citas</p>
                    <p className="text-[10px] text-[#7A7875]">Ver todas las fechas, horas y ginecólogos de la agenda.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissionsForm.viewCalendar}
                    onChange={(e) => setPermissionsForm({ ...permissionsForm, viewCalendar: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[#8C9B73] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 pr-2">
                    <p className="font-semibold text-[#2F3E46]">Visualizar Expediente y Recetas</p>
                    <p className="text-[10px] text-[#7A7875]">Permitir descargar o ver PDF/imágenes de prescripciones médicas escaneadas.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissionsForm.viewDocuments}
                    onChange={(e) => setPermissionsForm({ ...permissionsForm, viewDocuments: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[#8C9B73] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 pr-2">
                    <p className="font-semibold text-[#2F3E46]">Visualizar Estados de Ánimo</p>
                    <p className="text-[10px] text-[#7A7875]">Ver el termómetro diario de bienestar e historial emocional.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissionsForm.viewCheckins}
                    onChange={(e) => setPermissionsForm({ ...permissionsForm, viewCheckins: e.target.checked })}
                    className="w-4.5 h-4.5 accent-[#8C9B73] cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8C9B73] hover:bg-[#77865F] text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {loading ? "Enviando..." : "Enviar Invitación"}
              </button>
            </form>
          </div>

          {/* Right panel: Active list and Sent statuses */}
          <div className="space-y-6">
            {/* Active Connections */}
            <div className="bg-white rounded-3xl p-6 border border-[#ECE8E0] shadow-sm space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#2F3E46] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8C9B73]" /> Acompañantes con Acceso Activo
              </h3>
              
              {companionRelations?.asPrimary?.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#A3A19E] space-y-2">
                  <Users className="w-8 h-8 mx-auto stroke-1" />
                  <p>Aún no tienes ningún compañero de apoyo activo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companionRelations.asPrimary.map((rel) => {
                    const isEditingThis = editingPermissionsId === rel.id;
                    return (
                      <div key={rel.id} className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE8E0] space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-[#2F3E46]">{rel.companionName}</p>
                            <p className="text-[10px] text-[#A3A19E]">{rel.companionUserEmail}</p>
                          </div>
                          <button
                            onClick={() => handleRevoke(rel.id)}
                            className="text-[#8B5E5E] hover:bg-[#E9C4C4]/20 p-2 rounded-lg transition-all cursor-pointer"
                            title="Revocar acceso total"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Permissions Details */}
                        {isEditingThis ? (
                          <div className="bg-white p-3 rounded-xl border border-[#ECE8E0] space-y-2.5">
                            <p className="font-bold text-[10px] text-[#5A634D] uppercase">Editar Permisos</p>
                            <div className="flex items-center justify-between">
                              <span>Calendario médico:</span>
                              <input
                                type="checkbox"
                                checked={editPermissions?.viewCalendar}
                                onChange={(e) => setEditPermissions({ ...editPermissions!, viewCalendar: e.target.checked })}
                                className="accent-[#8C9B73]"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Expedientes Médicos:</span>
                              <input
                                type="checkbox"
                                checked={editPermissions?.viewDocuments}
                                onChange={(e) => setEditPermissions({ ...editPermissions!, viewDocuments: e.target.checked })}
                                className="accent-[#8C9B73]"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Check-ins de Ánimo:</span>
                              <input
                                type="checkbox"
                                checked={editPermissions?.viewCheckins}
                                onChange={(e) => setEditPermissions({ ...editPermissions!, viewCheckins: e.target.checked })}
                                className="accent-[#8C9B73]"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#ECE8E0]">
                              <button
                                onClick={() => handleSavePermissions(rel.id)}
                                className="bg-[#8C9B73] text-white px-2 py-1 rounded font-bold hover:bg-[#77865F] cursor-pointer"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPermissionsId(null);
                                  setEditPermissions(null);
                                }}
                                className="border border-[#ECE8E0] text-[#7A7875] px-2 py-1 rounded hover:bg-[#FBF9F4] cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#ECE8E0] text-[9px]">
                            <span className={`px-2 py-0.5 rounded-full ${rel.permissions.viewCalendar ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-gray-100 text-gray-400"}`}>
                              Calendario médico: {rel.permissions.viewCalendar ? "Sí" : "No"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full ${rel.permissions.viewDocuments ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-gray-100 text-gray-400"}`}>
                              Expedientes: {rel.permissions.viewDocuments ? "Sí" : "No"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full ${rel.permissions.viewCheckins ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-gray-100 text-gray-400"}`}>
                              Historial de Ánimo: {rel.permissions.viewCheckins ? "Sí" : "No"}
                            </span>
                            
                            <button
                              onClick={() => {
                                setEditingPermissionsId(rel.id);
                                setEditPermissions({ ...rel.permissions });
                              }}
                              className="ml-auto underline text-[#8C9B73] hover:text-[#5A634D] cursor-pointer font-semibold"
                            >
                              Editar Consentimiento
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sent Invitations Status */}
            <div className="bg-white rounded-3xl p-6 border border-[#ECE8E0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#2F3E46] uppercase tracking-widest flex items-center gap-2">
                Historial de Invitaciones Enviadas
              </h3>

              {sentInvitations?.length === 0 ? (
                <p className="text-xs text-[#A3A19E] py-4 text-center">No has enviado invitaciones todavía.</p>
              ) : (
                <div className="space-y-3">
                  {sentInvitations.map((inv) => (
                    <div key={inv.id} className="p-3 bg-[#FBF9F4] rounded-xl border border-[#ECE8E0] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#2F3E46]">{inv.companionName}</p>
                        <p className="text-[10px] text-[#7A7875]">{inv.companionEmail}</p>
                      </div>
                      <div>
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                          inv.status === "accepted" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : inv.status === "declined"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#F4F1ED] text-[#7A7875]"
                        }`}>
                          {inv.status === "accepted" ? "Aceptada" : inv.status === "declined" ? "Declinada" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
