/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { SupportContact } from "../types";
import { AlertOctagon, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";

interface HelpCrisisCentreProps {
  contacts: SupportContact[];
}

export default function HelpCrisisCentre({ contacts }: HelpCrisisCentreProps) {
  // Breathing loop animation state
  const [breathingPhase, setBreathingPhase] = useState<"IDLE" | "INHALE" | "HOLD" | "EXHALE">("IDLE");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 4-7-8 Breathing settings: INHALE (4s), HOLD (7s), EXHALE (8s)
  const runBreathingCycle = () => {
    // 1. Inhale
    setBreathingPhase("INHALE");
    setSecondsLeft(4);
  };

  useEffect(() => {
    if (breathingPhase === "IDLE") return;

    if (secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else {
      // Transition phase
      if (breathingPhase === "INHALE") {
        setBreathingPhase("HOLD");
        setSecondsLeft(7);
      } else if (breathingPhase === "HOLD") {
        setBreathingPhase("EXHALE");
        setSecondsLeft(8);
      } else if (breathingPhase === "EXHALE") {
        // Loop again!
        setBreathingPhase("INHALE");
        setSecondsLeft(4);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [secondsLeft, breathingPhase]);

  const handleStartBreathing = () => {
    runBreathingCycle();
  };

  const handleStopBreathing = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBreathingPhase("IDLE");
    setSecondsLeft(0);
  };

  // Dynamic visual sizing and coloring of the breathing circle based on phase
  const getCircleState = () => {
    switch (breathingPhase) {
      case "INHALE":
        return {
          scale: "scale-140 bg-[#E9C4C4]/20 border-[#E9C4C4]/40",
          text: "Inhala profundamente...",
          color: "text-[#8B5E5E]"
        };
      case "HOLD":
        return {
          scale: "scale-140 bg-[#F4F1ED] border-[#ECE8E0] shadow-sm",
          text: "Retén el aire en tu pancita...",
          color: "text-[#5A634D]"
        };
      case "EXHALE":
        return {
          scale: "scale-100 bg-[#A3B18A]/15 border-[#A3B18A]/35",
          text: "Suelta el aire lento y suave...",
          color: "text-[#5A634D]"
        };
      default:
        return {
          scale: "scale-100 bg-[#FBF9F4] border-[#ECE8E0]",
          text: "Toca abajo para comenzar",
          color: "text-[#A3A19E]"
        };
    }
  };

  const circleStyle = getCircleState();

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* 1. SEVERE CRISIS EMERGENCY BANNER */}
      <div className="p-5 rounded-[40px] bg-rose-50 border-2 border-rose-200 text-rose-800 space-y-3.5 shadow-sm animate-pulse">
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-7 h-7 text-rose-600 shrink-0" />
          <div>
            <h4 className="text-sm font-serif font-bold text-rose-950 uppercase tracking-wide">¿Estás experimentando una crisis aguda?</h4>
            <p className="text-xs text-rose-700 leading-relaxed mt-0.5 font-medium">
              Si sientes ganas de lastimarte, tristeza insoportable sin escapatoria, llanto descontrolado crónico, o ideación suicidad, <strong>por favor no esperes</strong>. TribuMental es una ayuda electrónica, no un soporte clínico. Llama las 24 horas a los contactos humanos de inmediato:
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* EMERGENCY CONTACTS LIST */}
        <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm space-y-5 text-xs text-[#7A7875]">
          <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
            Líneas de Atención Inmediata Perinatal
          </h4>

          <div className="space-y-4">
            {contacts.map((c) => (
              <div 
                key={c.id} 
                className={`p-4 border rounded-2xl flex flex-col justify-between gap-3 bg-white ${
                  c.isEmergency ? "border-rose-100 bg-rose-50/10" : "border-[#ECE8E0]"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h5 className="font-bold text-[#2F3E46] text-xs flex items-center gap-1.5">
                      {c.isEmergency && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>}
                      {c.name}
                    </h5>
                    <p className="text-[10px] text-[#A3A19E] font-mono mt-0.5">{c.role} • {c.specialty}</p>
                  </div>

                  <a 
                    href={`tel:${c.phone}`}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold shrink-0 shadow-sm transition-all active:scale-95 ${
                      c.isEmergency 
                        ? "bg-rose-600 hover:bg-rose-700 text-white" 
                        : "bg-[#8C9B73] hover:bg-[#7d8c66] text-white"
                    }`}
                  >
                    📞 {c.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#FBF9F4] border border-[#ECE8E0] rounded-2xl text-[10px] text-[#7A7875] leading-relaxed font-medium">
            🚩 <strong>Nota ginecológica:</strong> Si estás embarazada y observas pérdida de líquido amniótico, sangrado vaginal, fiebre superior a 38 °C o ausencia prolongada de movimientos fetales, acude de inmediato a Urgencias Médicas de tu hospital obstétrico correspondiente.
          </div>
        </div>

        {/* INTERACTIVE MINDFULNESS BREATHING LOOP (4-7-8 TECHNIQUE) */}
        <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm flex flex-col items-center justify-between min-h-[420px]">
          <div className="text-center space-y-1">
            <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8C9B73]" />
              Entrenador de Respiración de Alivio
            </h4>
            <p className="text-[11px] text-[#7A7875] max-w-xs leading-relaxed mx-auto">
              Técnica calmante del Dr. Weil (4-7-8) para regular el ritmo cardíaco, oxigenar al bebé, y calmar el agobio agudo en el posparto o preparto.
            </p>
          </div>

          {/* Active Resizing Breathing Circle Visualizer */}
          <div className="my-10 flex items-center justify-center h-48 w-48 shrink-0">
            <div 
              className={`h-36 w-36 rounded-full border-4 flex flex-col items-center justify-center text-center transition-all duration-1000 transform-gpu shadow-inner ${circleStyle.scale}`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 block select-none ${circleStyle.color}`}>
                {circleStyle.text}
              </span>
              {secondsLeft > 0 && (
                <span className="text-3xl font-mono font-bold text-[#2F3E46] mt-2 block select-none">
                  {secondsLeft}s
                </span>
              )}
            </div>
          </div>

          {/* Breathing Cycle Controls */}
          <div className="w-full space-y-3">
            {breathingPhase === "IDLE" ? (
              <button
                type="button"
                onClick={handleStartBreathing}
                className="w-full py-3 bg-[#8C9B73] hover:bg-[#7d8c66] text-white font-semibold text-xs tracking-wide rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Comenzar Ejercicio de Respiración (4-7-8)
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={runBreathingCycle}
                  className="flex-1 py-2.5 border border-[#ECE8E0] hover:bg-[#FBF9F4] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white text-[#5A634D]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopBreathing}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl active:scale-95 cursor-pointer"
                >
                  Detener Ciclo
                </button>
              </div>
            )}
            
            <div className="text-[9px] text-center text-[#A3A19E] font-mono uppercase tracking-wider">
              Fase: {breathingPhase} {breathingPhase !== "IDLE" && "• Inhale (4s) -> Retenga (7s) -> Exhale (8s)"}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
