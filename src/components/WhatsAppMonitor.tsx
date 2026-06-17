/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  WhatsAppMessageLog, 
  WhatsAppMsgCategory, 
  Profile, 
  SubscriptionPlan,
  AppointmentType,
  AppointmentStatus
} from "../types";
import { 
  MessageSquare, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  BarChart, 
  Clock, 
  CheckCheck,
  Send,
  User,
  Sparkles,
  Calendar,
  AlertCircle
} from "lucide-react";

interface WhatsAppMonitorProps {
  logs: WhatsAppMessageLog[];
  profile: Profile | null;
  subscription: any;
  onUpdateProfile: (updates: Partial<Profile>) => Promise<any>;
  onSendMessage: (body: string, category: "UTILITY" | "MARKETING" | "AUTHENTICATION") => Promise<any>;
  onAddAppointment?: (appt: any) => Promise<any>;
  onGoToCalendar?: () => void;
}

interface BotMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  specialistMatch?: {
    specialty: string;
    doctorName: string;
    apptType: AppointmentType;
  };
  connected?: boolean;
}

export default function WhatsAppMonitor({
  logs,
  profile,
  subscription,
  onUpdateProfile,
  onSendMessage,
  onAddAppointment,
  onGoToCalendar
}: WhatsAppMonitorProps) {
  const [sending, setSending] = useState(false);
  const [, setCostSummary] = useState<any | null>(null);
  
  // Tab within the simulated phone: "chatbot" | "alerts"
  const [phoneTab, setPhoneTab] = useState<"chatbot" | "alerts">("chatbot");
  
  // Custom Chatbot state
  const [botMessages, setBotMessages] = useState<BotMessage[]>([
    {
      id: "init_1",
      sender: "bot",
      text: "¡Hola! Bienvenida a TribuMental. 🌸\n\nSoy TribuBot, tu asistente inteligente perinatal de WhatsApp. Mi propósito es escucharte, entender tus necesidades y conectarte directo con la especialista idónea de nuestra Tribu que mejor te pueda acompañar hoy.",
      timestamp: "10:00"
    },
    {
      id: "init_2",
      sender: "bot",
      text: "Cuéntame un poco de lo que estás sintiendo o lo que necesitas consultar hoy para ayudarte.",
      timestamp: "10:01"
    }
  ]);
  
  const [userInput, setUserInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [matchingStatus, setMatchingStatus] = useState<string | null>(null);
  const [showCalendarButton, setShowCalendarButton] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [botMessages, isBotTyping]);

  // Guidelines matching Meta Business API rules for system notifications
  const UTILITY_TEMPLATES = [
    {
      title: "Confirmación de Cita Médica",
      category: WhatsAppMsgCategory.UTILITY,
      body: "¡Hola Mamá Tribu! 🗓️ Te recordamos tu cita para 'Control Ecográfico Tercer Trimestre' mañana a las 10:30 hs con la Dra. Laura Martínez. Recuerda llevar tus recetas anteriores en tu portal TribuMental."
    },
    {
      title: "Check-in Mañanero Alerta",
      category: WhatsAppMsgCategory.UTILITY,
      body: "☀️ ¡Buenos días, hermosa! Tómate 10 segundos para respirar profundo hoy. ¿Cómo te sientes emocionalmente esta mañana? Haz tu check-in rápido aquí: tribumental.com/checkin"
    },
    {
      title: "Recursos de Calma y Lactancia",
      category: WhatsAppMsgCategory.UTILITY,
      body: "👶 Consejos de TribuMental: En esta primera semana de lactancia, el agarre dócil previene grietas. Si sientes molestia extrema, haz círculos suaves antes de prender al bebé."
    }
  ];

  const handleToggleWhatsApp = async () => {
    if (!profile) return;
    try {
      await onUpdateProfile({
        whatsappEnabled: !profile.whatsappEnabled
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTestTemplate = async (templateText: string, category: string) => {
    if (!profile?.whatsappEnabled || !profile?.whatsappNumber) return;
    
    setSending(true);
    setCostSummary(null);
    try {
      const res = await onSendMessage(templateText, category as any);
      setCostSummary(res.costDetails);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Trigger dynamic Bot matching workflow
  const handleBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    const text = userInput.trim();
    setUserInput("");
    processBotInput(text);
  };

  const processBotInput = (text: string) => {
    // Add user message to state
    const userMsg: BotMessage = {
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    setBotMessages(prev => [...prev, userMsg]);
    setIsBotTyping(true);

    // Natural multi-step simulation delay
    setTimeout(() => {
      setIsBotTyping(false);
      const query = text.toLowerCase();
      let replyText = "";
      let match: any = undefined;

      // Diagnostic keyword analytics matching the core perinatal segments
      if (
        query.includes("psicol") || 
        query.includes("triste") || 
        query.includes("ansied") || 
        query.includes("llor") || 
        query.includes("estres") || 
        query.includes("estrés") || 
        query.includes("depre") || 
        query.includes("ánimo") || 
        query.includes("animo") || 
        query.includes("culpa") || 
        query.includes("sola") || 
        query.includes("miedo")
      ) {
        replyText = "Abrazo fuerte tu sentir maternal 💕. Los desafíos emocionales del embarazo y posparto son profundos y 100% reales. \n\nHe seleccionado para ti una conexión con la **Dra. Sofía Ramos**, nuestra Psicóloga Perinatal líder. Ella ofrece un ambiente compasivo libre de juicios para devolverte la calma.\n\n¿Deseas que te agende una sesión de orientación prioritaria con ella?";
        match = {
          specialty: "Psicología Perinatal 🧠",
          doctorName: "Dra. Sofía Ramos",
          apptType: AppointmentType.PSYCHOLOGY
        };
      } 
      else if (
        query.includes("lactan") || 
        query.includes("leche") || 
        query.includes("pecho") || 
        query.includes("grieta") || 
        query.includes("pezon") || 
        query.includes("pezón") || 
        query.includes("amamantar") || 
        query.includes("formula") || 
        query.includes("fórmula") || 
        query.includes("peso") || 
        query.includes("agarre")
      ) {
        replyText = "La lactancia materna es una danza de aprendizaje que a veces genera dudas o dolor físico. ¡No tienes por qué sufrir!\n\nTe recomiendo firmemente hablar con la **Dra. Laura Martínez**, una especialista en Consejería de Lactancia certificada que corregirá el acople de forma dócil.\n\n¿Quieres que coordinemos una videoconsulta urgente con ella?";
        match = {
          specialty: "Consejería en Lactancia 🤱",
          doctorName: "Dra. Laura Martínez",
          apptType: AppointmentType.OTHER
        };
      } 
      else if (
        query.includes("doula") || 
        query.includes("parto") || 
        query.includes("labor") || 
        query.includes("parter") || 
        query.includes("nacimiento") || 
        query.includes("contrac") || 
        query.includes("ejercicio") || 
        query.includes("respirar")
      ) {
        replyText = "¡Qué etapa tan mística y hermosa! El soporte continuo de una Doula disminuye la duración del trabajo de parto y la tasa de intervenciones de manera probada.\n\nContamos con **Carmen Pérez**, Doula y Partera Perinatal certificada, experta en preparar tu cuerpo y mente para un nacimiento humanizado y seguro.\n\n¿Te agendo una cita de valoración prioritaria con Carmen?";
        match = {
          specialty: "Acompañamiento Doula 🤰",
          doctorName: "Carmen Pérez",
          apptType: AppointmentType.PRENATAL
        };
      } 
      else if (
        query.includes("pediat") || 
        query.includes("bebe") || 
        query.includes("bebé") || 
        query.includes("colico") || 
        query.includes("cólico") || 
        query.includes("fiebre") || 
        query.includes("vacun") || 
        query.includes("crecim")
      ) {
        replyText = "Cada pequeño llanto o cambio de tu recién nacido merece una mirada experta y amorosa para traerte tranquilidad.\n\nHe seleccionado a la **Dra. Mercedes Solís**, nuestra Pediatra Perinatal, dedicada a guiar el neurodesarrollo infantil respetuoso.\n\n¿Agendamos una consulta prioritaria para valorar a tu bebé?";
        match = {
          specialty: "Pediatría de Desarrollo 👶",
          doctorName: "Dra. Mercedes Solís",
          apptType: AppointmentType.PEDIATRIC
        };
      } 
      else {
        replyText = "Entiendo perfectamente tu mensaje. En TribuMental contamos con un equipo multidisciplinario dispuesto a sostenerte y guiarte.\n\nCuéntame un poco más detalladamente sobre tu molestia o inquietud, o bien indícame de qué área necesitas asesoría:\n\n1. 🧠 Salud Emocional / Ansiedad\n2. 🤱 Dolor al Amamantar o Grietas\n3. 🤰 Planificación del Parto y Doula\n4. 👶 Salud de mi recién Nacido";
      }

      setBotMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: "bot",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          specialistMatch: match
        }
      ]);
    }, 1100);
  };

  // Execute Appointment injection for the matched specialist
  const handleConnectWithSpecialist = async (msgId: string, spec: { specialty: string; doctorName: string; apptType: AppointmentType }) => {
    if (!onAddAppointment) return;
    
    setMatchingStatus(spec.doctorName);
    
    try {
      // Create priority appointment tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split("T")[0];

      await onAddAppointment({
        title: `Asesoría Prioritaria - ${spec.specialty}`,
        date: dateString,
        time: "10:00",
        type: spec.apptType,
        doctor: spec.doctorName,
        location: "Videoconsulta Virtual Prioritaria TribuMental",
        notes: "Cita coordinada inteligentemente por el bot de WhatsApp según las necesidades descritas por la usuaria.",
        reminderActive: true
      });

      // Update message look to indicate connection completed
      setBotMessages(prev => 
        prev.map(m => m.id === msgId ? { ...m, connected: true } : m)
      );

      // Bot speaks to confirm success
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
        setBotMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 5),
            sender: "bot",
            text: `¡Listo! ¡Cita confirmada exitosamente! 🎉\n\nHe registrado tu cita de **${spec.specialty}** con la experta **${spec.doctorName}** para mañana a las **10:00 hs**.\n\nHemos enviado la confirmación y enlace de video sala por email. Puedes verlo reflejado en tu calendario TribuMental en tiempo real o continuar dialogando conmigo.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        setShowCalendarButton(true);
      }, 1000);

    } catch (err) {
      console.error(err);
    } finally {
      setMatchingStatus(null);
    }
  };

  // Quick action tap handler
  const handleQuickTap = (text: string) => {
    processBotInput(text);
  };

  // Compute stats for notifications
  const totalCost = logs.reduce((acc, log) => {
    if (log.category === WhatsAppMsgCategory.MARKETING) return acc + 0.015;
    if (log.category === WhatsAppMsgCategory.AUTHENTICATION) return acc + 0.005;
    return acc + 0.011;
  }, 0);

  const isFreePlan = subscription?.plan === SubscriptionPlan.FREE;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif text-[#2F3E46] font-medium flex items-center gap-2">
            Canal de WhatsApp Interactivo
            <Sparkles className="w-5 h-5 text-[#8C9B73]" />
          </h3>
          <p className="text-xs text-[#7A7875] mt-1">
            Simula las alertas del sistema perinatal o chatea en tiempo real con nuestro Bot inteligente de derivación a especialistas 🌸
          </p>
        </div>
      </div>

      {/* Main Grid: Phone simulator + Details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PHONE EMULATOR PANEL (cols 5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-80 h-[560px] bg-[#1e201f] rounded-[55px] border-[10px] border-[#2E3130] shadow-2xl overflow-hidden flex flex-col justify-between">
            {/* Camera notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#2E3130] rounded-b-2xl z-30 flex justify-center items-center">
              <div className="w-16 h-2 bg-[#404342] rounded-full mr-4"></div>
              <div className="w-2.5 h-2.5 bg-[#404342] rounded-full"></div>
            </div>

            {/* SIMULATED CONTENT AREA */}
            <div className="flex-1 bg-[#F4F1ED] pt-8 flex flex-col justify-between h-full relative overflow-hidden">
              
              {/* WhatsApp top navigation header */}
              <div className="bg-[#5A634D] text-white p-3 shadow-md shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8C9B73] flex items-center justify-center text-xs font-bold border border-[#a2b588]/40">
                    TM
                  </div>
                  <div>
                    <h5 className="text-[10.5px] font-bold flex items-center gap-1 leading-none">
                      TribuBot Perinatal 🌸
                    </h5>
                    <span className="text-[7.5px] text-emerald-200 tracking-wider uppercase font-mono font-bold">Cuenta de Empresa</span>
                  </div>
                </div>
                
                {/* Simulated connection LED light indicator */}
                <div className="flex items-center gap-1 bg-[#47503d] px-2 py-0.5 rounded-full text-[7.5px] font-mono text-emerald-300">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  <span>EN LÍNEA</span>
                </div>
              </div>

              {/* TABS SELECTOR INSIDE PHONE BAR */}
              <div className="bg-white border-b border-[#ECE8E0] flex justify-between shrink-0 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPhoneTab("chatbot")}
                  className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
                    phoneTab === "chatbot" 
                      ? "border-[#8C9B73] text-[#5A634D] bg-[#FBF9F4]" 
                      : "border-transparent text-[#7A7875] hover:bg-gray-50"
                  }`}
                >
                  💬 Chat Bot Especialistas
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneTab("alerts")}
                  className={`flex-1 py-2 text-center border-b-2 transition-all cursor-pointer ${
                    phoneTab === "alerts" 
                      ? "border-[#8C9B73] text-[#5A634D] bg-[#FBF9F4]" 
                      : "border-transparent text-[#7A7875] hover:bg-gray-50"
                  }`}
                >
                  📢 Alertas de Sistema
                </button>
              </div>

              {/* MESSAGES VIEWPORT */}
              <div 
                ref={containerRef}
                className="flex-1 p-3 overflow-y-auto space-y-3.5 flex flex-col bg-[#efebe4] min-h-0 relative"
              >
                {phoneTab === "alerts" ? (
                  /* ALERTS VIEWPORT & COMPONENT */
                  <div className="space-y-3.5">
                    <div className="text-center">
                      <span className="bg-white/80 backdrop-blur text-[8px] text-gray-500 font-bold px-2 py-0.5 rounded-md border border-gray-100 uppercase tracking-wider">
                        Alertas y Recordatorios Despachados
                      </span>
                    </div>

                    {logs.length === 0 ? (
                      <div className="text-center p-4 bg-white/70 border border-[#ECE8E0] rounded-2xl text-[9px] text-[#7A7875] my-6">
                        No has recibido notificaciones automáticas todavía. Asegúrate de activar WhatsApp a la derecha y probar una de las plantillas del plan.
                      </div>
                    ) : (
                      logs.slice(0, 8).reverse().map((log) => (
                        <div 
                          key={log.id} 
                          className="bg-white border border-[#ECE8E0] p-2.5 rounded-2xl text-[9.5px] max-w-[90%] shadow-sm self-end rounded-tr-none leading-relaxed animate-fadeIn"
                        >
                          <p className="text-[#2F3E46] whitespace-pre-line font-medium">{log.body}</p>
                          <div className="flex items-center justify-between text-[7px] text-[#A3A19E] mt-2 border-t border-[#ECE8E0] pt-1 font-mono">
                            <span>ALERTA {log.category}</span>
                            <div className="flex items-center gap-0.5 text-[#8C9B73]">
                              <span>Delivered</span>
                              <CheckCheck className="w-3 h-3 text-[#8C9B73]" />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* LIVE CHAT BOT VIEWPORT */
                  <>
                    <div className="text-center">
                      <span className="bg-[#8C9B73]/15 text-[#5A634D] text-[8px] font-bold px-2.5 py-0.5 rounded-md border border-[#8C9B73]/30 uppercase tracking-wider shadow-sm">
                        Asistencia Inteligente de Derivación
                      </span>
                    </div>

                    {botMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] rounded-2xl p-2.5 font-medium text-[10px] leading-relaxed shadow-sm animate-fadeIn ${
                          msg.sender === "user"
                            ? "bg-[#DDEFC1] text-[#3c4a22] self-end rounded-tr-none"
                            : "bg-white text-[#2F3E46] self-start rounded-tl-none border border-[#ECE8E0]"
                        }`}
                      >
                        <p className="whitespace-pre-line font-medium">{msg.text}</p>
                        
                        {/* Match card with Specialist and Priority connection trigger */}
                        {msg.specialistMatch && (
                          <div className="mt-3.5 p-3 rounded-xl bg-[#FBF9F4] border border-[#ECE8E0] space-y-2">
                            <div className="flex items-center gap-1.5 border-b border-[#ECE8E0] pb-1.5">
                              <span className="text-xs">👩‍⚕️</span>
                              <div>
                                <h6 className="font-bold text-[#2F3E46] text-[10px]">{msg.specialistMatch.doctorName}</h6>
                                <p className="text-[8px] text-[#8C9B73] font-bold lowercase">{msg.specialistMatch.specialty}</p>
                              </div>
                            </div>
                            
                            {msg.connected ? (
                              <div className="py-1 bg-emerald-50 text-emerald-800 rounded-lg text-center font-bold text-[8.5px] border border-emerald-100 flex items-center justify-center gap-1">
                                <span>✓ Cita Perinatal Agendada</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={matchingStatus !== null}
                                onClick={() => handleConnectWithSpecialist(msg.id, msg.specialistMatch!)}
                                className="w-full text-center py-2 bg-[#8C9B73] hover:bg-[#7d8c66] text-white font-bold rounded-lg text-[8.5px] transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                {matchingStatus === msg.specialistMatch.doctorName 
                                  ? "Conectando con Tribu..." 
                                  : "Agendar Sesión de Prioridad ⚡"
                                }
                              </button>
                            )}
                          </div>
                        )}
                        
                        <span className="text-[7px] text-[#A3A19E] self-end block mt-1 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    ))}

                    {/* Bot Typing Simulator message */}
                    {isBotTyping && (
                      <div className="bg-white border border-[#ECE8E0] text-[#7A7875] p-2.5 rounded-2xl rounded-tl-none text-[9px] max-w-[50%] self-start flex items-center gap-1.5 shadow-sm">
                        <span className="font-bold">TribuBot está analizando</span>
                        <div className="flex gap-0.5">
                          <span className="w-1 h-1 bg-[#8C9B73] rounded-full animate-bounce"></span>
                          <span className="w-1 h-1 bg-[#8C9B73] rounded-full animate-bounce delay-100"></span>
                          <span className="w-1 h-1 bg-[#8C9B73] rounded-full animate-bounce delay-200"></span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* QUICK RESPOND BUTTONS OR NAVIGATION SUGGESTION */}
              {phoneTab === "chatbot" && (
                <div className="bg-[#efebe4] px-2.5 pb-1 select-none flex flex-wrap gap-1 items-center justify-start max-h-24 overflow-y-auto">
                  {/* Option micro-chips for easy, high-success guidance simulation */}
                  <button 
                    type="button"
                    onClick={() => handleQuickTap("Tengo mucha ansiedad y tristeza")}
                    className="text-[8px] bg-white hover:bg-gray-50 text-[#5A634D] border border-[#ECE8E0] rounded-full px-2.5 py-1 font-semibold transition-all shadow-sm shrink-0"
                  >
                    🧠 Tristeza / Ansiedad
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickTap("Consejería de Lactancia materna y grietas")}
                    className="text-[8px] bg-white hover:bg-gray-50 text-[#5A634D] border border-[#ECE8E0] rounded-full px-2.5 py-1 font-semibold transition-all shadow-sm shrink-0"
                  >
                    🤱 Grietas / Lactancia
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickTap("Acompañamiento doula para mi parto")}
                    className="text-[8px] bg-white hover:bg-gray-50 text-[#5A634D] border border-[#ECE8E0] rounded-full px-2.5 py-1 font-semibold transition-all shadow-sm shrink-0"
                  >
                    🤰 Doula / Parto
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickTap("Consultas sobre cólicos y mi bebé")}
                    className="text-[8px] bg-white hover:bg-gray-50 text-[#5A634D] border border-[#ECE8E0] rounded-full px-2.5 py-1 font-semibold transition-all shadow-sm shrink-0"
                  >
                    👶 Cólicos del Bebé
                  </button>
                </div>
              )}

              {/* CHAT CHOOSE OR INPUT BOX AT BOTTOM */}
              <div className="bg-white border-t border-[#ECE8E0] p-2 shrink-0">
                {phoneTab === "chatbot" ? (
                  <form onSubmit={handleBotSubmit} className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder="Describe lo que sientes..."
                      className="flex-1 bg-[#FBF9F4] border border-[#ECE8E0] text-[#2F3E46] text-[10px] rounded-full px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C9B73]"
                    />
                    <button
                      type="submit"
                      className="w-8 h-8 rounded-full bg-[#8C9B73] hover:bg-[#7d8c66] text-white flex items-center justify-center transition-all cursor-pointer shadow active:scale-90"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-[8px] text-gray-400 py-2.5 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                    <span>📢 CANAL DE TRASMISIÓN UNIDIRECCIONAL</span>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom hardware handle bar */}
            <div className="h-4 bg-[#2E3130] flex justify-center items-center shrink-0">
              <div className="w-24 h-1 bg-[#5A5D5C] rounded-full"></div>
            </div>
          </div>
          
          {/* Quick link button to Calendar when appointment schedules */}
          {showCalendarButton && onGoToCalendar && (
            <button
              type="button"
              onClick={onGoToCalendar}
              className="mt-4 flex items-center gap-1.5 bg-[#8C9B73]/15 text-[#5A634D] px-4 py-2 rounded-2xl hover:bg-[#8C9B73]/25 font-bold text-xs transition duration-150 shadow-sm animate-pulse cursor-pointer border border-[#8C9B73]/30"
            >
              <Calendar className="w-4 h-4 text-[#8C9B73]" />
              <span>Ver Cita en Calendario ➔</span>
            </button>
          )}
        </div>

        {/* CONTROLS, INSTRUCTIONS AND METRICS PANEL (cols 7) */}
        <div className="lg:col-span-7 space-y-6 text-xs text-[#7A7875]">
          
          {/* Channel Info and opt-in settings */}
          <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[8.5px] bg-[#8C9B73]/15 text-[#5A634D] px-2.5 py-0.5 rounded-full font-extrabold uppercase font-mono tracking-wider">
                  Configuración del Canal
                </span>
                <h4 className="text-base font-serif font-bold text-[#2F3E46]">Manual de Uso: Bot de Derivación Inteligente de Especialistas</h4>
                <p className="text-xs text-[#7A7875] leading-relaxed">
                  Para probar la comunicación de pacientes con nuestro bot y su derivación oportuna a especialistas:
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-[#5A634D] font-medium leading-relaxed">
                  <li>Selecciona la pestaña <span className="underline">Chat Bot Especialistas</span> en la pantalla del celular simulado.</li>
                  <li>Usa las burbujas rápidas o escribe síntomas como <span className="italic font-bold">"siento mucha tristeza y llanto"</span> o <span className="italic font-bold">"dolor al amamantar"</span>.</li>
                  <li>Mira cómo TribuBot analiza tu situación y te recomienda al especialista exacto.</li>
                  <li>Haz clic en <span className="font-bold underline">"Agendar Sesión de Prioridad ⚡"</span>; esto registrará automáticamente la cita en tu panel.</li>
                </ol>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#FBF9F4] p-4 rounded-3xl border border-[#ECE8E0] min-w-[140px] shrink-0">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Canal SMS/WPP</span>
                <button
                  type="button"
                  onClick={handleToggleWhatsApp}
                  className="cursor-pointer"
                  title="Activar o desactivar notificaciones de WhatsApp"
                >
                  {profile?.whatsappEnabled ? (
                    <ToggleRight className="w-14 h-14 text-[#8C9B73] hover:text-[#7d8c66] transition-colors" />
                  ) : (
                    <ToggleLeft className="w-14 h-14 text-gray-300 hover:text-gray-400 transition-colors" />
                  )}
                </button>
                <div className="text-[9px] text-center font-bold text-gray-500 mt-1">
                  {profile?.whatsappEnabled ? "ACTIVADO REAL" : "SOLO SIMULACIÓN"}
                </div>
              </div>
            </div>

            {profile?.whatsappEnabled && profile?.whatsappNumber ? (
              <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Canal activo y enlazado al teléfono registrado: <strong>+{profile.whatsappNumber}</strong></span>
              </p>
            ) : (
              <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl text-amber-900 text-[10px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Notificaciones automáticas deshabilitadas:</span> Para despachar avisos automáticos de visitas a tu dispositivo, cambia el switch e ingresa un número de móvil válido en tu pestaña de <strong>Perfil</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Quick Notification Template testing workspace */}
          {profile?.whatsappEnabled && (
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-[#2F3E46] text-sm">Disparar Alertas de Sistema Manuales (Vía Plantillas de Meta)</h4>
                <span className="text-[8px] bg-[#8C9B73]/15 text-[#5A634D] px-2 py-0.5 rounded font-extrabold uppercase font-mono tracking-wider">
                  Adaptabilidad Meta Business
                </span>
              </div>

              {isFreePlan && (
                <p className="text-[10px] text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Plan Libre / Gratuito:</strong> Las cuentas básicas disponen de un límite de hasta 3 alertas por SMS/WhatsApp. Para notificaciones y monitoreo sin restricciones, considera adquirir TribuMental Premium.
                  </span>
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {UTILITY_TEMPLATES.map((tmpl, idx) => (
                  <div 
                    key={idx}
                    className="p-4 border border-[#ECE8E0] rounded-3xl bg-[#FBF9F4] flex flex-col justify-between gap-3 relative"
                  >
                    <div>
                      <h5 className="font-bold text-[#2F3E46]">{tmpl.title}</h5>
                      <span className="text-[8px] bg-[#8C9B73]/15 text-[#5A634D] border border-[#8C9B73]/30 font-mono font-bold uppercase rounded-lg px-2 py-0.5 inline-block mt-1">
                        {tmpl.category}
                      </span>
                      <p className="text-[10px] text-[#7A7875] mt-2.5 line-clamp-3 leading-relaxed">
                        "{tmpl.body}"
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => handleSendTestTemplate(tmpl.body, tmpl.category)}
                      className="w-full text-center py-2 bg-[#F4F1ED] hover:bg-[#eae6e0] text-[#5A634D] text-[10px] font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Enviar Simulación ⚡
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing logs ledger & analytic metrics dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Meta cost accumulator ledger card */}
            <div className="p-4 rounded-[30px] bg-white border border-[#ECE8E0] space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-[#A3A19E] font-mono text-[9px] uppercase font-bold">
                <BarChart className="w-3.5 h-3.5 text-[#8C9B73]" />
                <span>Consumo Acumulado Simulador</span>
              </div>
              <p className="text-2xl font-semibold font-serif text-[#2F3E46] mt-2">${totalCost.toFixed(3)} USD</p>
              <p className="text-[8px] text-[#A3A19E] leading-relaxed font-light mt-1">
                Gasto Meta API según los mensajes recibidos e interactuados en el sistema transaccional.
              </p>
            </div>

            {/* Category summary cards */}
            <div className="p-4 rounded-[30px] bg-white border border-[#ECE8E0] space-y-1 shadow-sm sm:col-span-2">
              <div className="flex items-center gap-1 text-[#A3A19E] font-mono text-[9px] uppercase font-bold">
                <Clock className="w-3.5 h-3.5 text-[#8C9B73]" />
                <span>Precios Oficiales de Tránsito Meta</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 pt-3 text-[10px]">
                <div className="bg-[#A3B18A]/10 p-2 rounded-xl text-center border border-[#A3B18A]/20">
                  <span className="font-extrabold text-[#5A634D] shrink-0 font-mono">$0.011</span>
                  <p className="text-[8px] text-[#5A634D] font-semibold mt-1">Utility / Alertas</p>
                </div>
                <div className="bg-amber-50/50 p-2 rounded-xl text-center border border-amber-100">
                  <span className="font-extrabold text-amber-700 shrink-0 font-mono">$0.015</span>
                  <p className="text-[8px] text-amber-500 font-semibold mt-1">Marketing / Promo</p>
                </div>
                <div className="bg-blue-50/50 p-2 rounded-xl text-center border border-blue-100">
                  <span className="font-extrabold text-blue-800 shrink-0 font-mono">$0.005</span>
                  <p className="text-[8px] text-blue-500 font-semibold mt-1">Authentication</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical chat dispatch logging log list table */}
          {logs.length > 0 && (
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-5 shadow-sm space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#ECE8E0] pb-2">
                <h4 className="font-serif font-bold text-[#2F3E46] text-sm">Historial Total de Mensajería Despachada</h4>
                <span className="text-[9px] text-[#A3A19E] font-mono font-bold">Enviados: {logs.length}</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 border border-[#ECE8E0] rounded-2xl flex items-center justify-between bg-[#FBF9F4] text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8C9B73] shrink-0"></div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#2F3E46] truncate max-w-lg">"{log.body}"</p>
                        <p className="text-[10px] text-[#A3A19E] font-mono mt-0.5">Móvil: +{log.recipient} • {log.timestamp}</p>
                      </div>
                    </div>

                    <span className="text-[9px] bg-white border border-[#ECE8E0] font-mono uppercase font-bold text-[#5A634D] px-2 py-0.5 rounded-lg shadow-sm shrink-0">
                      {log.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
