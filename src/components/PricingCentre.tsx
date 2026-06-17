/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SubscriptionPlan, Subscription } from "../types";
import { Sparkles, ShieldCheck, Check } from "lucide-react";

interface PricingCentreProps {
  subscription: Subscription | null;
  onUpgrade: (plan: string) => Promise<any>;
  onCancelRenew: () => Promise<any>;
}

export default function PricingCentre({
  subscription,
  onUpgrade,
  onCancelRenew
}: PricingCentreProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpgradePlan = async (plan: string) => {
    setLoading(plan);
    setSuccessMsg("");
    try {
      await onUpgrade(plan);
      setSuccessMsg(`¡Plan ${plan} activado con éxito! Se ha enrutado un webhook de confirmación a tu móvil.`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleToggleRenewal = async () => {
    setLoading("renew");
    try {
      await onCancelRenew();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = subscription?.plan || SubscriptionPlan.FREE;
  const isPremium = currentPlan === SubscriptionPlan.PREMIUM;
  const isFamily = currentPlan === SubscriptionPlan.FAMILY;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-serif text-[#2F3E46] font-medium">Centro de Suscripción</h3>
        <p className="text-xs text-[#7A7875] mt-1">Gestiona tu plan de TribuMental, visualiza tus comprobantes ficticios y actualiza tus deudas o coberturas familiares 🌸</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold animate-fadeIn flex items-center gap-2">
          <span>🎉</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Subscription Active Billing Card */}
      <div className="p-6 rounded-[35px] bg-white border border-[#ECE8E0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5A634D] bg-[#FBF9F4] border border-[#ECE8E0] px-3 py-1 rounded-full">
            Tu Cobertura Vigente
          </span>
          <h4 className="text-xl font-serif font-semibold text-[#2F3E46] mt-2">
            Plan {currentPlan === SubscriptionPlan.FREE ? "Tribu Libre (Básico)" : currentPlan === SubscriptionPlan.PREMIUM ? "Tribu Premium Perinatal" : "Tribu Familiar Cooperativo"}
          </h4>
          
          <div className="text-xs text-[#7A7875] flex flex-wrap gap-x-4 gap-y-1 font-medium">
            <p>Estado de Facturación: <strong className="text-emerald-600 font-bold">Activo</strong></p>
            {subscription?.currentPeriodEnd && (
              <p>Próxima Renovación: <strong className="text-[#2F3E46] font-mono">{new Date(subscription.currentPeriodEnd).toLocaleDateString("es-ES")}</strong></p>
            )}
            <p>Pasarela: <strong className="text-sky-600 font-semibold">Wompi (Bancolombia)</strong></p>
          </div>
        </div>

        {currentPlan !== SubscriptionPlan.FREE && (
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={handleToggleRenewal}
              disabled={loading === "renew"}
              className="text-xs font-semibold border border-[#ECE8E0] hover:bg-[#F4F1ED] px-4.5 py-2.5 rounded-xl transition-all cursor-pointer text-[#5A634D]"
            >
              {subscription?.cancelAtPeriodEnd ? "Reactivar Auto-renovación" : "Cancelar Auto-renovación ⚠️"}
            </button>
            <button
              onClick={() => handleUpgradePlan("FREE")}
              className="text-xs font-semibold bg-rose-50 hover:bg-[#E9C4C4]/20 text-rose-600 border border-rose-100 px-4.5 py-2.5 rounded-xl cursor-pointer"
            >
              Downgrade a Tribu Libre
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-4">
        {/* Plan Upgrade options */}

        {/* FREE PLAN CARD */}
        <div className={`p-6 rounded-[35px] border flex flex-col justify-between bg-white ${
          currentPlan === SubscriptionPlan.FREE ? "ring-2 ring-[#5A634D] border-[#5A634D] relative" : "border-[#ECE8E0] opacity-80"
        }`}>
          {currentPlan === SubscriptionPlan.FREE && (
            <span className="absolute -top-3 left-6 text-[8px] bg-[#5A634D] text-white uppercase font-extrabold px-3 py-0.5 rounded-full">Activo</span>
          )}
          <div className="space-y-4">
            <h5 className="text-md font-serif font-semibold text-[#2F3E46]">Tribu Libre</h5>
            <div className="text-3xl font-serif font-bold text-[#2F3E46]">$0 COP</div>
            <p className="text-xs text-[#7A7875]">Seguimiento emocional humano básico, sin cargo transaccional.</p>
            
            <ul className="space-y-2 pt-3 border-t border-[#ECE8E0] text-[11px] text-[#7A7875] font-medium">
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Check-in de ánimo diario</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Calendario obstétrico</li>
              <li className="flex items-start gap-1.5 text-rose-400 font-light">• Canal de WhatsApp limitado: 3 alertas</li>
              <li className="flex items-start gap-1.5 text-rose-400 font-light">• Sin OCR Gemini de recetas</li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentPlan === SubscriptionPlan.FREE}
            onClick={() => handleUpgradePlan("FREE")}
            className="w-full text-center mt-6 py-2.5 rounded-xl border border-[#ECE8E0] font-bold text-xs hover:bg-[#F4F1ED] disabled:opacity-50 cursor-pointer text-[#7A7875]"
          >
            {currentPlan === SubscriptionPlan.FREE ? "Tu cobertura actual" : "Downgrade"}
          </button>
        </div>

        {/* PREMIUM PLAN CARD */}
        <div className={`p-6 rounded-[35px] border flex flex-col justify-between bg-white ${
          isPremium ? "ring-2 ring-[#8C9B73] border-[#8C9B73] relative" : "border-[#ECE8E0] bg-[#FBF9F4] shadow-sm hover:shadow"
        }`}>
          {isPremium && (
            <span className="absolute -top-3 left-6 text-[8px] bg-[#8C9B73] text-white uppercase font-extrabold px-3 py-0.5 rounded-full">Tu Cobertura Premium</span>
          )}
          <div className="space-y-4">
            <h5 className="text-md font-serif font-semibold text-[#2F3E46] flex items-center gap-1.5 ">
              <span>Tribu Premium</span>
              <Sparkles className="w-4.5 h-4.5 text-[#8C9B73]" />
            </h5>
            <div className="text-3xl font-serif font-bold text-[#2F3E46]">$39.900 COP <span className="text-[12px] text-[#7A7875] font-normal">/ mes</span></div>
            <p className="text-xs text-[#7A7875]">El portal obstétrico inteligente y de calma definitivo.</p>

            <ul className="space-y-2 pt-3 border-t border-[#ECE8E0] text-[11px] text-[#7A7875] font-medium">
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8C9B73]" /> Acompañamiento ilimitado por WhatsApp</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8C9B73]" /> Escáner OCR ilimitado con Gemini AI</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8C9B73]" /> Consejos médicos automatizados y seguros</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#8C9B73]" /> Alertas 24h antes de tus visitas ginecológicas</li>
            </ul>
          </div>

          <button
            type="button"
            disabled={isPremium || loading === "PREMIUM"}
            onClick={() => handleUpgradePlan("PREMIUM")}
            className={`w-full text-center mt-6 py-2.5 rounded-xl font-bold text-xs transition-transform cursor-pointer ${
              isPremium 
                ? "bg-slate-100 text-slate-400 pointer-events-none border border-[#ECE8E0]" 
                : "bg-[#8C9B73] text-white hover:bg-[#7d8c66] shadow"
            }`}
          >
            {isPremium ? "Tu cobertura actual" : loading === "PREMIUM" ? "Procesando..." : "Pasar a Premium ⚡"}
          </button>
        </div>

        {/* FAMILY PLAN CARD */}
        <div className={`p-6 rounded-[35px] border flex flex-col justify-between bg-white ${
          isFamily ? "ring-2 ring-amber-500 border-amber-500 relative" : "border-[#ECE8E0] bg-amber-50/10 hover:shadow"
        }`}>
          {isFamily && (
            <span className="absolute -top-3 left-6 text-[8px] bg-amber-500 text-white uppercase font-extrabold px-3 py-0.5 rounded-full">Activo</span>
          )}
          <div className="space-y-4">
            <h5 className="text-md font-serif font-semibold text-[#2F3E46]">Tribu Familiar</h5>
            <div className="text-3xl font-serif font-bold text-[#2F3E46]">$59.900 COP <span className="text-[12px] text-[#7A7875] font-normal">/ mes</span></div>
            <p className="text-xs text-[#7A7875]">Perfecto para enlazar con tu pareja, doula o familiar cuidador secundario.</p>

            <ul className="space-y-2 pt-3 border-t border-[#ECE8E0] text-[11px] text-[#7A7875] font-medium">
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-500" /> Todo lo del plan Premium</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-500" /> Chat simultáneo para 2 cuidadores</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-500" /> Envío de alertas de WhatsApp al cuidador</li>
              <li className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-500" /> Consejos prácticos de apoyo al parto</li>
            </ul>
          </div>

          <button
            type="button"
            disabled={isFamily || loading === "FAMILY"}
            onClick={() => handleUpgradePlan("FAMILY")}
            className={`w-full text-center mt-6 py-2.5 rounded-xl font-bold text-xs transition-transform cursor-pointer ${
              isFamily 
                ? "bg-slate-100 text-slate-400 pointer-events-none border border-[#ECE8E0]" 
                : "bg-[#5A634D] hover:bg-[#4d5441] text-white shadow"
            }`}
          >
            {isFamily ? "Tu cobertura actual" : loading === "FAMILY" ? "Procesando..." : "Pasar a Familia 🧪"}
          </button>
        </div>
      </div>

      {/* Security validation badge bar */}
      <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE8E0] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#A3A19E] mt-8">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
          <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
          Pasarela Segura Conforme a Estándares de la Industria (Garantizado por Wompi)
        </span>
        <span className="hidden sm:inline">•</span>
        <span>Suscripción mensual recurrente cancelable con un solo clic.</span>
      </div>
    </div>
  );
}
