import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { PregnancyStatus } from '../types';

const STEPS = [
  { id: 1, title: '¿Cómo estás viviendo este momento?', subtitle: 'No hay respuestas correctas o incorrectas.' },
  { id: 2, title: '¿Cuánto tiempo llevas en esta etapa?', subtitle: 'Una aproximación es suficiente.' },
  { id: 3, title: '¿Qué te preocupa más ahora mismo?', subtitle: 'Esto nos ayuda a personalizar tu experiencia.' },
  { id: 4, title: '¿Te gustaría acompañamiento por WhatsApp?', subtitle: 'Recordatorios suaves y mensajes de apoyo. Siempre con tu consentimiento.' },
  { id: 5, title: 'Elige tu plan de inicio', subtitle: 'Puedes cambiar en cualquier momento.' },
];

const CONCERNS = [
  { id: 'anxiety', emoji: '😰', label: 'Ansiedad o preocupación constante' },
  { id: 'loneliness', emoji: '🤍', label: 'Sensación de soledad' },
  { id: 'exhaustion', emoji: '😴', label: 'Agotamiento físico y emocional' },
  { id: 'identity', emoji: '🌀', label: 'Cambios en mi identidad' },
  { id: 'relationship', emoji: '💑', label: 'Mi relación de pareja' },
  { id: 'information', emoji: '📚', label: 'Demasiada información, poca guía' },
  { id: 'medical', emoji: '🏥', label: 'Organizar mis citas y documentos médicos' },
  { id: 'other', emoji: '✨', label: 'Otro' },
];

const FREQUENCIES = [
  { id: 'daily', emoji: '🌤️', label: 'Todos los días', sublabel: 'Un pequeño recordatorio diario' },
  { id: 'every_2_days', emoji: '🌿', label: 'Cada 2 días', sublabel: 'Un equilibrio perfecto' },
  { id: 'weekly', emoji: '🗓️', label: 'Una vez por semana', sublabel: 'Solo cuando necesito recordarlo' },
  { id: 'none', emoji: '🔕', label: 'Prefiero sin recordatorios', sublabel: 'Entro cuando lo decida yo' },
];

interface OnboardingFlowProps {
  onComplete: (onboardingData: any) => void;
  userName: string;
}

export default function OnboardingFlow({ onComplete, userName }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    status: PregnancyStatus.PREGNANT,
    weeksOrMonths: '20',
    mainWorry: '',
    whatsappNumber: '',
    whatsappEnabled: false,
    reminderFrequency: 'daily',
    plan: 'free',
  });

  const progress = (step / STEPS.length) * 100;

  function updateData(updates: any) {
    setData(prev => ({ ...prev, ...updates }));
  }

  function canProceed() {
    if (step === 1) return !!data.status;
    if (step === 2) return true;
    if (step === 3) return !!data.mainWorry;
    if (step === 4) return true;
    if (step === 5) return true;
    return false;
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await onComplete({
        status: data.status,
        weeksOrMonths: parseInt(data.weeksOrMonths) || 1,
        mainWorry: data.mainWorry || "Organización integral",
        whatsappEnabled: data.whatsappEnabled,
        whatsappNumber: data.whatsappEnabled ? data.whatsappNumber : "",
        reminderFrequency: data.reminderFrequency,
        onboarded: true
      });

      // Redirect based on selected plan
      if (data.plan === 'premium') {
        navigate('/dashboard?upgrade=true'); // We'll handle upgrade modal in App/Pricing
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setSaving(false);
    }
  }

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 font-body">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <span className="text-2xl">🌸</span>
        <span className="font-heading text-xl text-foreground">TribuMental</span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>Paso {step} de {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-green rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-card rounded-3xl p-8 border border-border shadow-warm animate-slide-up">
        <h2 className="font-heading text-2xl text-foreground mb-2">
          {STEPS[step - 1].title}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          {STEPS[step - 1].subtitle}
        </p>

        {/* Step content */}
        {step === 1 && <Step1 data={data} onUpdate={updateData} />}
        {step === 2 && <Step2 data={data} onUpdate={updateData} />}
        {step === 3 && <Step3 data={data} onUpdate={updateData} />}
        {step === 4 && <Step4 data={data} onUpdate={updateData} />}
        {step === 5 && <Step5 data={data} onUpdate={updateData} />}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              Atrás
            </button>
          )}
          <button
            onClick={step === STEPS.length ? handleFinish : () => setStep(s => s + 1)}
            disabled={!canProceed() || saving}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium transition-all cursor-pointer",
              canProceed() && !saving
                ? "bg-foreground text-background hover:opacity-80"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Guardando...
              </span>
            ) : step === STEPS.length ? (
              <><Check size={16} /> ¡Comenzar mi espacio!</>
            ) : (
              <>Continuar <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-6 max-w-sm">
        TribuMental no reemplaza la atención médica o psicológica profesional.
      </p>
    </div>
  );
}

function Step1({ data, onUpdate }: any) {
  const options = [
    { id: PregnancyStatus.PREGNANT, emoji: '🤰', label: 'Estoy embarazada', desc: 'Viviendo el embarazo' },
    { id: PregnancyStatus.POSTPARTUM, emoji: '👶', label: 'Soy mamá reciente', desc: 'En el posparto' },
  ];

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onUpdate({ status: opt.id })}
          className={cn(
            "flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all text-center cursor-pointer",
            data.status === opt.id
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/30 hover:bg-muted/30"
          )}
        >
          <span className="text-4xl">{opt.emoji}</span>
          <p className="font-medium text-sm text-foreground">{opt.label}</p>
          <p className="text-xs text-muted-foreground">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
}

function Step2({ data, onUpdate }: any) {
  const stage = data.status;
  const label = stage === PregnancyStatus.PREGNANT ? 'semanas de embarazo' : 'meses desde el parto';
  const placeholder = stage === PregnancyStatus.PREGNANT ? 'Ej: 28' : 'Ej: 3';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          ¿Cuántas {label} aproximadamente?
        </label>
        <input
          type="number"
          placeholder={placeholder}
          value={data.weeksOrMonths}
          onChange={e => onUpdate({ weeksOrMonths: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sage-green"
          min="1"
          max={stage === PregnancyStatus.PREGNANT ? 42 : 24}
        />
        <p className="text-xs text-muted-foreground mt-2">Opcional — puedes dejarlo en blanco.</p>
      </div>
    </div>
  );
}

function Step3({ data, onUpdate }: any) {
  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }
  return (
    <div className="grid grid-cols-1 gap-2">
      {CONCERNS.map(concern => (
        <button
          key={concern.id}
          onClick={() => onUpdate({ mainWorry: concern.label })}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm cursor-pointer",
            data.mainWorry === concern.label
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/30 hover:bg-muted/30"
          )}
        >
          <span className="text-lg">{concern.emoji}</span>
          <span className="text-foreground">{concern.label}</span>
          {data.mainWorry === concern.label && (
            <Check size={16} className="ml-auto text-foreground" />
          )}
        </button>
      ))}
    </div>
  );
}

function Step4({ data, onUpdate }: any) {
  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }
  return (
    <div className="space-y-5">
      {/* Opt-in */}
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
        <div className="mt-0.5">
          <button
            onClick={() => onUpdate({ whatsappEnabled: !data.whatsappEnabled })}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
              data.whatsappEnabled ? "border-foreground bg-foreground" : "border-muted-foreground"
            )}
          >
            {data.whatsappEnabled && <Check size={14} className="text-background" />}
          </button>
        </div>
        <div className="cursor-pointer" onClick={() => onUpdate({ whatsappEnabled: !data.whatsappEnabled })}>
          <p className="text-sm font-medium text-foreground">Sí, quiero acompañamiento por WhatsApp</p>
          <p className="text-xs text-muted-foreground mt-1">
            Recibirás recordatorios suaves de check-in, alertas de tus citas y mensajes de apoyo.
            Puedes desactivarlo cuando quieras.
          </p>
        </div>
      </div>

      {data.whatsappEnabled && (
        <>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Tu número de WhatsApp
            </label>
            <input
              type="tel"
              placeholder="+57 300 123 4567"
              value={data.whatsappNumber}
              onChange={e => onUpdate({ whatsappNumber: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-sage-green"
            />
            <p className="text-xs text-muted-foreground mt-1">Incluye el código de país. Ej: +57, +52, +54</p>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-3">¿Con qué frecuencia?</p>
            <div className="grid grid-cols-1 gap-2">
              {FREQUENCIES.map(freq => (
                <button
                  key={freq.id}
                  onClick={() => onUpdate({ reminderFrequency: freq.id })}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all cursor-pointer",
                    data.reminderFrequency === freq.id
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/30"
                  )}
                >
                  <span className="text-lg">{freq.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{freq.label}</p>
                    <p className="text-xs text-muted-foreground">{freq.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Step5({ data, onUpdate }: any) {
  const options = [
    {
      id: 'free',
      emoji: '🌱',
      name: 'Plan Gratis',
      desc: 'Para empezar con calma',
      features: ['Check-ins diarios', '1 cita/mes', '3 documentos', 'Centro de emergencias'],
      price: 'Gratis para siempre',
    },
    {
      id: 'premium',
      emoji: '⭐',
      name: 'Premium',
      desc: 'Acompañamiento completo',
      features: ['Todo ilimitado', 'WhatsApp activo', 'Historial completo', 'OCR en documentos'],
      price: '$39.900/mes',
      highlight: true,
    },
  ];

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="space-y-3">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onUpdate({ plan: opt.id })}
          className={cn(
            "w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer",
            data.plan === opt.id
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/30",
            opt.highlight && data.plan !== opt.id ? "border-sage-green/40" : ""
          )}
        >
          <span className="text-2xl mt-0.5">{opt.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm text-foreground">{opt.name}</p>
              {opt.highlight && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sage-green/20 text-foreground">Recomendado</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">{opt.desc}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {opt.features.map((f, i) => (
                <span key={i} className="text-xs text-muted-foreground">✓ {f}</span>
              ))}
            </div>
            <p className="text-sm font-medium text-foreground mt-2">{opt.price}</p>
          </div>
          {data.plan === opt.id && (
            <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={12} className="text-background" />
            </div>
          )}
        </button>
      ))}
      {data.plan === 'premium' && (
        <p className="text-xs text-muted-foreground text-center">
          Te dirigiremos al checkout seguro de Wompi después de configurar tu espacio.
        </p>
      )}
    </div>
  );
}
