/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  BrainCircuit,
  Heart
} from 'lucide-react';

const QUESTIONS = [
  { id: 1, text: "¿He podido reírme y ver el lado bueno de las cosas?", options: ["Como siempre", "No tanto ahora", "Mucho menos ahora", "No, nada"] },
  { id: 2, text: "¿He mirado hacia adelante con ilusión por las cosas?", options: ["Como siempre", "Menos de lo que solía hacer", "Mucho menos de lo que solía hacer", "Casi nada"] },
  { id: 3, text: "¿Me he culpado innecesariamente cuando las cosas no salían bien?", options: ["Sí, casi siempre", "Sí, a veces", "No muy a menudo", "No, nunca"] },
  { id: 4, text: "¿He estado ansiosa o preocupada sin motivo aparente?", options: ["No, nada", "Casi nada", "Sí, a veces", "Sí, muy a menudo"] },
  { id: 5, text: "¿He sentido miedo o pánico sin motivo alguno?", options: ["Sí, muy a menudo", "Sí, a veces", "No mucho", "No, nada"] },
  { id: 6, text: "¿Las cosas me oprime o me superan?", options: ["Sí, casi siempre", "Sí, a veces", "No, casi siempre he podido afrontarlas", "No, he podido afrontarlas tan bien como siempre"] },
  { id: 7, text: "¿Me he sentido tan infeliz que he tenido dificultades para dormir?", options: ["Sí, casi siempre", "Sí, a veces", "No muy a menudo", "No, nada"] },
  { id: 8, text: "¿Me he sentido triste o desgraciada?", options: ["Sí, casi siempre", "Sí, bastante a menudo", "No muy a menudo", "No, nada"] },
  { id: 9, text: "¿He estado tan infeliz que he estado llorando?", options: ["Sí, casi siempre", "Sí, bastante a menudo", "Ocasionalmente", "No, nunca"] },
  { id: 10, text: "¿He sentido que mi identidad como mujer se ha perdido en la maternidad?", options: ["Totalmente", "A veces lo siento", "Muy poco", "Para nada"] },
  { id: 11, text: "¿He sentido que mi pareja o familia no comprenden mi carga emocional?", options: ["Siempre", "A menudo", "Rara vez", "Me siento muy comprendida"] },
  { id: 12, text: "¿He sentido irritabilidad o cambios de humor repentinos?", options: ["Constantemente", "Varias veces al día", "A veces", "No, me siento estable"] },
  { id: 13, text: "¿He tenido dificultad para concentrarme en tareas sencillas?", options: ["Mucha dificultad", "Alguna dificultad", "Casi ninguna", "Ninguna"] },
  { id: 14, text: "¿Me siento agotada incluso después de haber descansado?", options: ["Sí, agotamiento total", "Bastante cansada", "Un poco", "Me siento con energía"] },
  { id: 15, text: "¿He tenido pensamientos de hacerme daño a mí misma o a otros?", options: ["Sí, a menudo", "A veces me cruza por la mente", "Rara vez", "No, nunca"] }
];

interface MentalHealthTestProps {
  onComplete: (answers: string[]) => Promise<void>;
  onClose: () => void;
}

export default function MentalHealthTest({ onComplete, onClose }: MentalHealthTestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);

  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(s => s + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onComplete(answers);
      setFinished(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (finished) {
    return (
      <div className="bg-white rounded-[40px] p-8 text-center space-y-6 shadow-sm border border-[#ECE8E0] animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-[#2F3E46]">Evaluación Completada</h3>
          <p className="text-sm text-[#7A7875] leading-relaxed">
            Tribu AI está analizando tus respuestas para crear tu perfil de bienestar personalizado.
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-[#2F3E46] text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all cursor-pointer"
        >
          Ir al Panel de Novedades
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] border border-[#ECE8E0] shadow-sm overflow-hidden flex flex-col min-h-[500px] animate-fadeIn">
      {/* Header */}
      <div className="p-6 border-b border-[#ECE8E0] bg-[#FBF9F4] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#8C9B73]/10 rounded-xl">
            <BrainCircuit className="w-5 h-5 text-[#8C9B73]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#2F3E46]">Tamizaje de Bienestar Perinatal</h4>
            <p className="text-[10px] text-[#A3A19E] font-medium uppercase tracking-widest">Pregunta {currentStep + 1} de {QUESTIONS.length}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-[#A3A19E] hover:text-[#2F3E46] transition-colors p-1">
          <XIcon size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-[#ECE8E0] w-full">
        <div
          className="h-full bg-[#8C9B73] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-8 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="space-y-8">
          <h2 className="text-xl md:text-2xl font-serif text-[#2F3E46] leading-snug text-center font-medium">
            {QUESTIONS[currentStep].text}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {QUESTIONS[currentStep].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 group flex items-center justify-between cursor-pointer ${
                  answers[currentStep] === option
                    ? "border-[#8C9B73] bg-[#8C9B73]/5 shadow-sm"
                    : "border-[#ECE8E0] hover:border-[#8C9B73]/30 hover:bg-[#FBF9F4]"
                }`}
              >
                <span className={`text-sm font-medium ${answers[currentStep] === option ? "text-[#5A634D]" : "text-[#7A7875]"}`}>
                  {option}
                </span>
                {answers[currentStep] === option && (
                  <CheckCircle2 className="w-5 h-5 text-[#8C9B73]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="p-6 bg-[#FBF9F4] border-t border-[#ECE8E0] flex items-center justify-between">
        <button
          disabled={currentStep === 0}
          onClick={() => setCurrentStep(s => s - 1)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-all ${currentStep === 0 ? "opacity-30 pointer-events-none" : "text-[#A3A19E] hover:text-[#2F3E46] cursor-pointer"}`}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        {currentStep === QUESTIONS.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!answers[currentStep] || submitting}
            className="bg-[#8C9B73] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-[#77865F] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                Finalizar Evaluación
              </>
            )}
          </button>
        ) : (
          <div className="text-[10px] text-[#A3A19E] font-bold uppercase tracking-widest">
            Selecciona una opción para continuar
          </div>
        )}
      </div>
    </div>
  );
}

function XIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
