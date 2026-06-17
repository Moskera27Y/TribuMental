import React, { useState } from "react";
import { MoodCheckIn } from "../types";
import { Smile, Activity, Sparkles, Send, ShieldAlert, Heart } from "lucide-react";

interface DailyCheckInProps {
  checkins: MoodCheckIn[];
  onAddCheckIn: (moodValue: number, moodEmoji: string, note?: string) => Promise<any>;
  viewOwnerId: string | null;
  onSendMessage: (checkInId: string, text: string) => Promise<any>;
}

const EMOJIS = [
  { val: 1, label: "Muy triste / Agotada", icon: "😢" },
  { val: 2, label: "Triste / Ansiosa", icon: "😔" },
  { val: 3, label: "Neutral / Cansada", icon: "😐" },
  { val: 4, label: "Alegre / Serena", icon: "😊" },
  { val: 5, label: "Muy feliz / Plena", icon: "🥰" }
];

export default function DailyCheckIn({ 
  checkins, 
  onAddCheckIn, 
  viewOwnerId, 
  onSendMessage 
}: DailyCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedCheckIn, setSavedCheckIn] = useState<MoodCheckIn | null>(null);

  // Chat Follow-Up states
  const [chatText, setChatText] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null || viewOwnerId) return;

    setSubmitting(true);
    try {
      const emojiChar = EMOJIS.find(item => item.val === selectedMood)?.icon || "😐";
      const saved = await onAddCheckIn(selectedMood, emojiChar, note.trim());
      setSavedCheckIn(saved);
      setNote("");
      setSelectedMood(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeCheckIn = checkedInToday || savedCheckIn;
    if (!chatText.trim() || !activeCheckIn || viewOwnerId) return;

    setChatSending(true);
    try {
      const updated = await onSendMessage(activeCheckIn.id, chatText.trim());
      // Upkeep current view with latest conversation thread
      setSavedCheckIn(updated);
      setChatText("");
    } catch (err) {
      console.error("No se pudo enviar el mensaje:", err);
    } finally {
      setChatSending(false);
    }
  };

  const getMoodColor = (val: number) => {
    if (val <= 2) return "bg-[#E9C4C4]/20 text-[#8B5E5E]";
    if (val === 3) return "bg-[#F4F1ED] text-[#7A7875]";
    return "bg-[#8C9B73]/15 text-[#5A634D]";
  };

  // Check if today was already checked in
  const todayString = new Date().toISOString().split("T")[0];
  const checkedInToday = checkins.find(c => c.date === todayString);
  const activeCheckIn = checkedInToday || savedCheckIn;

  return (
    <div className="space-y-8 font-sans">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ECE8E0] pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C9B73] font-bold">TERMÓMETRO EMOCIONAL DIARIO</span>
          <h3 className="text-2xl md:text-3xl font-bold font-serif text-[#2F3E46] mt-1">
            {viewOwnerId ? "Registros de Ánimo de tu Acompañada" : "Tu Check-In Diario"}
          </h3>
          <p className="text-xs text-[#7A7875] mt-1">
            {viewOwnerId 
              ? "Observa el estado de bienestar de la madre para asistirla oportunamente de forma empática." 
              : "Comparte cómo van tus emociones físicas y mentales hoy. Tu Tribu AI está lista para escucharte."
            }
          </p>
        </div>

        {viewOwnerId && (
          <div className="bg-[#8C9B73]/10 border border-[#8C9B73]/30 px-3 py-1.5 rounded-xl text-xs text-[#5A634D] font-bold flex items-center gap-1.5 shrink-0 max-w-sm">
            <ShieldAlert className="w-4 h-4 text-[#8C9B73]" />
            <span>Modo Compañero de Apoyo — Solo Lectura</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Check-In Logging Box */}
        <div className="lg:col-span-2 space-y-6">
          {activeCheckIn ? (
            <div className="bg-white rounded-3xl border border-[#ECE8E0] p-6 text-center space-y-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-6xl block animate-pulse">
                  {activeCheckIn.moodEmoji}
                </span>
                <h4 className="text-xl font-serif font-black text-[#2F3E46]">
                  {viewOwnerId ? "¡Registro diario activo!" : "¡Gracias por registrar tu ánimo hoy!"}
                </h4>
                <p className="text-xs text-[#7A7875] max-w-md mx-auto">
                  {viewOwnerId 
                    ? "Aquí se listan las emociones de la madre registradas para hoy y las sugerencias de autocuidado provistas por el terapeuta."
                    : "Tu registro diario ha sido guardado de forma privada. Tribu AI ha preparado estas pautas especiales de autocuidado para ti:"
                  }
                </p>
              </div>

              {/* Display AI recommendations */}
              {activeCheckIn.recommendations && activeCheckIn.recommendations.length > 0 && (
                <div className="bg-[#FBF9F4] border border-[#ECE8E0] rounded-2xl p-5 text-left space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8C9B73]">
                    <Sparkles className="w-4 h-4" />
                    <span>Sugerencias de Autocuidado del Terapeuta Perinatal</span>
                  </div>
                  
                  <ul className="space-y-2.5">
                    {activeCheckIn.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-[#2F3E46] flex items-start gap-2 leading-relaxed">
                        <span className="text-[#8C9B73] font-bold shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chat Thread Panel */}
              <div className="mt-8 pt-6 border-t border-[#ECE8E0] text-left space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C9B73]">
                  <Smile className="w-4.5 h-4.5 text-[#8C9B73]" />
                  <span>Diálogo Empático con Tribu AI</span>
                </div>
                
                {/* Messages Scroll Box */}
                <div className="space-y-3.5 max-h-72 overflow-y-auto bg-[#FBF9F4] p-4 rounded-2xl border border-[#ECE8E0]">
                  {(activeCheckIn.chatThread || []).map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-[#A3A19E] px-1 mb-0.5 uppercase tracking-wider font-semibold">
                        {msg.sender === "user" ? "Tú" : "Tribu AI"}
                      </span>
                      <div className={`p-3 max-w-[85%] rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#8C9B73] text-white rounded-tr-none"
                          : "bg-white text-[#2F3E46] border border-[#ECE8E0] rounded-tl-none shadow-sm"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Message box */}
                {!viewOwnerId ? (
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      required
                      disabled={chatSending}
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      placeholder="Desahógate de forma segura, cuéntame más..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] bg-white text-[#2F3E46] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={chatSending}
                      className="bg-[#8C9B73] hover:bg-[#77865F] text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                    >
                      {chatSending ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                ) : (
                  <p className="text-[10px] text-[#A3A19E] text-center italic bg-gray-50 p-2.5 rounded-xl border border-[#ECE8E0]">
                    Como compañero de apoyo de TribuMental, estás en Modo Lectura y no puedes responder al chat de Tribu AI.
                  </p>
                )}
              </div>

              {!viewOwnerId && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => { setSavedCheckIn(null); }}
                    className="text-xs font-bold text-[#8C9B73] underline hover:text-[#5A634D] cursor-pointer"
                  >
                    Actualizar o registrar de nuevo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#ECE8E0] p-6 shadow-sm">
              <h4 className="text-md font-serif font-medium text-[#2F3E46] mb-4 flex items-center gap-2">
                <Smile className="w-4.5 h-4.5 text-[#8C9B73]" />
                ¿Cómo te defines a nivel de energía y humor en este momento?
              </h4>

              {viewOwnerId ? (
                <div className="text-center py-8 text-xs text-[#A3A19E] space-y-2">
                  <Heart className="w-8 h-8 mx-auto stroke-1 text-[#E9C4C4]" />
                  <p>La usuaria aún no ha registrado su estado de ánimo el día de hoy.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Visual Emojis grid */}
                  <div className="grid grid-cols-5 gap-2.5">
                    {EMOJIS.map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setSelectedMood(item.val)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedMood === item.val
                            ? "border-[#8C9B73] bg-[#F4F1ED] ring-2 ring-[#8C9B73]/50"
                            : "border-[#ECE8E0] hover:bg-[#FBF9F4] bg-white"
                        }`}
                      >
                        <span className="text-3xl block filter drop-shadow">{item.icon}</span>
                        <span className="text-[10px] text-[#2F3E46] mt-2 font-medium line-clamp-1 leading-tight select-none">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Free Text Note */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#5A634D]">¿Qué tienes hoy en el corazón o la cabeza? (Opcional)</label>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={4}
                      placeholder="E.g. Sentí las primeras pataditas del bebé... O: Me siento culposa por estar tan inactiva hoy..."
                      className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] bg-[#FBF9F4] focus:outline-none text-[#2F3E46]"
                    />
                    <p className="text-[10px] text-[#A3A19E]">Suave: Tu registro emocional es 100% privado y seguro.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={selectedMood === null || submitting}
                    className={`w-full py-3.5 bg-[#8C9B73] hover:bg-[#77865F] text-white font-semibold rounded-xl text-xs tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                      selectedMood === null ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                    }`}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Analizando emociones con Tribu AI...</span>
                      </span>
                    ) : "Guardar Check-in Perinatal 🌸"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Emotions Timeline & History */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#ECE8E0] p-5 shadow-sm">
            <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest mb-4 flex items-center gap-1.5 font-sans">
              <Activity className="w-4 h-4 text-[#8C9B73]" />
              Historial de Estado de Ánimo
            </h4>

            {checkins.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#A3A19E]">
                Aún no hay registros de estados de ánimo anteriores para mostrar.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {checkins.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 border border-[#ECE8E0] rounded-2xl flex items-start gap-3 bg-white"
                  >
                    <span className="text-2xl pt-1 shrink-0">{item.moodEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] text-[#A3A19E] font-mono">
                        <span>{item.date}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${getMoodColor(item.moodValue)}`}>
                          {item.moodValue}/5
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-[#2F3E46] mt-1 line-clamp-3 italic leading-relaxed">
                          "{item.note}"
                        </p>
                      )}
                      
                      {/* Short Bullet of suggestions */}
                      {item.recommendations && item.recommendations.length > 0 && (
                        <div className="mt-2 text-[10px] text-[#5A634D] bg-[#F4F1ED]/50 p-2 rounded-xl flex items-start gap-1">
                          <span className="font-bold shrink-0">💡</span>
                          <span className="truncate">{item.recommendations[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
