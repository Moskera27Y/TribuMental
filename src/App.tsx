/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useTribuApi } from "./hooks/useTribuApi.tsx";
import { PregnancyStatus, SubscriptionPlan, AppointmentStatus } from "./types";
import ThemeLayout from "./components/ThemeLayout";
import LandingPage from "./components/LandingPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import OnboardingFlow from "./components/OnboardingFlow";
import DailyCheckIn from "./components/DailyCheckIn";
import MentalHealthTest from "./components/MentalHealthTest";
import CalendarModule from "./components/CalendarModule";
import { Share2, TrendingUp, Users } from "lucide-react";
import DocumentScanner from "./components/DocumentScanner";
import WhatsAppMonitor from "./components/WhatsAppMonitor";
import PricingCentre from "./components/PricingCentre";
import HelpCrisisCentre from "./components/HelpCrisisCentre";
import CompanionModule from "./components/CompanionModule";
import { 
  Heart, 
  Sparkles, 
  Clock, 
  MapPin, 
  CheckSquare, 
  AlertTriangle, 
  Calendar, 
  ArrowRight,
  User,
  Activity,
  UserRound,
  FileText,
  Shield,
  CreditCard,
  Wallet,
  Building2,
  Lock,
  ArrowLeft,
  MessageSquare
} from "lucide-react";

import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Browser } from '@capacitor/browser';

export default function App() {
  const api = useTribuApi();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeNav, setActiveNav] = useState("dashboard");
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paidPlan, setPaidPlan] = useState("");
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [showMentalTest, setShowMentalTest] = useState(false);

  const [wompiModalData, setWompiModalData] = useState<any | null>(null);
  const [wompiTab, setWompiTab] = useState<"card" | "pse" | "nequi">("card");
  
  const [testCard, setTestCard] = useState("4242 4242 4242 4242");
  const [testExpiry, setTestExpiry] = useState("12/28");
  const [testCvv, setTestCvv] = useState("123");
  const [testName, setTestName] = useState("Madre Tribu");
  const [testBank, setTestBank] = useState("Bancolombia");
  const [testCell, setTestCell] = useState("3101234567");
  const [wompiLoading, setWompiLoading] = useState(false);

  useEffect(() => {
    if (api.user) {
      setTestName(api.user.name || "Madre Tribu");
    }
    if (api.profile) {
      setTestCell(api.profile.whatsappNumber || "3101234567");
    }
  }, [api.user, api.profile]);

  // Handle flow redirects
  useEffect(() => {
    if (!api.loading && !transitionLoading) {
      if (!api.user) {
        if (!["/", "/login", "/register"].includes(location.pathname)) {
          navigate("/");
        }
      } else if (api.profile && !api.profile.onboarded) {
        if (location.pathname !== "/onboarding") {
          navigate("/onboarding");
        }
      } else if (api.profile && api.profile.onboarded) {
        if (["/", "/login", "/register", "/onboarding"].includes(location.pathname)) {
          navigate("/dashboard");
        }
      }
    }
  }, [api.user, api.profile, api.loading, location.pathname, navigate]);

  const handleBeginCheckout = async (plan: string) => {
    try {
      const data = await api.handleCheckout(plan);

      // Si estamos en un dispositivo móvil (APK), usamos el navegador del sistema para mayor seguridad
      const isMobile = /Android|iPhone/i.test(navigator.userAgent);

      if (data.isRealWompi) {
        if (isMobile) {
          // Flujo profesional para APK: Abrir checkout en navegador externo
          const checkoutUrl = `https://checkout.wompi.co/p/?public_key=${data.publicKey}&currency=${data.currency}&amount_in_cents=${data.amountInCents}&reference=${data.reference}&signature:integrity=${data.signature}&redirect_url=${encodeURIComponent(data.redirectUrl)}`;
          await Browser.open({ url: checkoutUrl });
          return;
        }

        setWompiLoading(true);
        const loadScript = (url: string): Promise<boolean> => {
          return new Promise((resolve) => {
            if ((window as any).WidgetCheckout) { resolve(true); return; }
            const script = document.createElement("script");
            script.src = url;
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };
        const loaded = await loadScript("https://checkout.wompi.co/widget.js");
        setWompiLoading(false);
        if (loaded && (window as any).WidgetCheckout) {
          const checkout = new (window as any).WidgetCheckout({
            currency: 'COP',
            amountInCents: data.amountInCents,
            reference: data.reference,
            publicKey: data.publicKey,
            signature: data.signature,
            redirectUrl: data.redirectUrl,
            customerData: {
              email: data.userEmail,
              fullName: data.userName,
              phoneNumber: data.userMobile,
              phoneNumberPrefix: '+57'
            }
          });
          checkout.open(function ( result: any ) {
            var transaction = result.transaction;
            if (transaction.status === "APPROVED") {
               window.location.href = data.redirectUrl;
            }
          });
        } else {
          setWompiModalData(data);
        }
      } else {
        setWompiModalData(data);
      }
    } catch (err: any) {
      console.error("Wompi Checkout Error:", err);
      setWompiModalData({ plan, amountInCents: plan === "PREMIUM" ? 3990000 : 5990000 });
    }
  };

  const handleConfirmSimulationPayment = async () => {
    if (!wompiModalData) return;
    setWompiLoading(true);
    try {
      const res = await fetch("/api/wompi/simulate-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: wompiModalData.plan,
          testCard,
          testName,
          isPSE: wompiTab === "pse"
        })
      });
      if (res.ok) {
        await api.refreshSession();
        setPaidPlan(wompiModalData.plan);
        setWompiModalData(null);
        setShowPaymentSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWompiLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout_status") === "success" || params.get("checkout") === "success") {
      const plan = params.get("plan") || "PREMIUM";
      setPaidPlan(plan);
      setShowPaymentSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCompleteOnboarding = async (onboardingData: any) => {
    setTransitionLoading(true);
    try {
      await api.updateProfile(onboardingData);
      setTimeout(() => {
        setTransitionLoading(false);
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Onboarding saving failed:", err);
      setTransitionLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
  };

  const nextAppointment = api.appointments
    .filter(a => a.status === AppointmentStatus.SCHEDULED && new Date(a.date).getTime() >= new Date().setHours(0,0,0,0))
    .sort((a,b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime())[0];

  if (api.loading || transitionLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F4] flex flex-col items-center justify-center text-center p-6 antialiased">
        <div className="w-16 h-16 rounded-full bg-[#F4F1ED] flex items-center justify-center border border-[#ECE8E0] mb-6 animate-pulse">
          <Heart className="w-8 h-8 text-[#8C9B73] animate-bounce" />
        </div>
        <h2 className="text-2xl font-serif text-[#2F3E46] font-light max-w-sm mt-2">
          "Un espacio de calma para la madre que le da vida al mundo."
        </h2>
        <p className="text-xs text-[#7A7875] mt-4 animate-fadeIn">Cargando tu espacio TribuMental...</p>
      </div>
    );
  }

  const Dashboard = () => {
    const isPregnant = api.profile?.status === PregnancyStatus.PREGNANT;
    const hasMentalScore = api.profile?.lastMentalHealthScore !== undefined;

    return (
      <div className="space-y-8 animate-fadeIn">
        {showMentalTest && (
          <div className="fixed inset-0 z-[60] bg-[#2F3E46]/60 backdrop-blur-md flex items-center justify-center p-4 antialiased">
            <div className="max-w-2xl w-full">
              <MentalHealthTest
                onComplete={async (answers) => { await api.analyzeMentalHealth(answers); }}
                onClose={() => setShowMentalTest(false)}
              />
            </div>
          </div>
        )}

        <div className="bg-white border border-[#ECE8E0] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-[#A3A19E] uppercase font-bold flex items-center gap-1.5 font-sans">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Acompañamiento Perinatal
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2F3E46] font-light">
              Hola, <span className="font-semibold">{api.user?.name}</span>. Semana <span className="text-[#8C9B73] font-serif font-bold italic">{api.profile?.weeksOrMonths}</span> de {isPregnant ? "embarazo" : "posparto"} 🌸
            </h2>
          </div>
          <button
            onClick={() => setActiveNav("profile")}
            className="text-xs font-semibold text-[#5A634D] bg-[#F4F1ED] border border-[#ECE8E0] px-4.5 py-2.5 rounded-xl hover:bg-[#eae6e0] transition-colors cursor-pointer shrink-0"
          >
            Ajustar Datos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Panel de Novedades de Bienestar */}
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] overflow-hidden shadow-sm">
              <div className="bg-[#8C9B73]/10 p-5 border-b border-[#ECE8E0] flex justify-between items-center">
                <h3 className="text-xs font-bold text-[#5A634D] uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#8C9B73]" />
                  Novedades de Bienestar
                </h3>
                {hasMentalScore && (
                  <button
                    onClick={() => setShowMentalTest(true)}
                    className="text-[10px] font-bold text-[#8C9B73] hover:underline cursor-pointer"
                  >
                    Repetir Evaluación
                  </button>
                )}
              </div>
              <div className="p-6">
                {!hasMentalScore ? (
                  <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-14 h-14 bg-[#F4F1ED] rounded-full flex items-center justify-center border border-[#ECE8E0]">
                      <BrainCircuit className="w-7 h-7 text-[#8C9B73]" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-serif font-semibold text-[#2F3E46]">Conoce tu Perfil de Bienestar</h4>
                      <p className="text-xs text-[#7A7875] max-w-xs leading-relaxed">
                        Realiza nuestra evaluación profesional de 15 preguntas para que Tribu AI analice tu estado emocional actual.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMentalTest(true)}
                      className="bg-[#2F3E46] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
                    >
                      Iniciar Evaluación Profesional
                    </button>
                  </div>
                ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Indicador y Perfil */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full border-4 border-[#8C9B73]/20 flex items-center justify-center relative">
                                <span className="text-sm font-bold text-[#2F3E46]">{api.profile?.lastMentalHealthScore}</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                  <circle
                                    cx="24" cy="24" r="20" fill="transparent" stroke="#8C9B73" strokeWidth="4"
                                    strokeDasharray={`${(api.profile?.lastMentalHealthScore || 0) * 12.56} 125.6`}
                                    className="transition-all duration-1000"
                                  />
                                </svg>
                              </div>
                              <span className="text-[8px] font-bold text-[#A3A19E] uppercase mt-1">Score</span>
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <p className="text-xs font-bold text-[#2F3E46]">Perfil de Tribu AI:</p>
                              <p className="text-[11px] text-[#7A7875] leading-relaxed italic border-l-2 border-[#8C9B73]/30 pl-3">
                                "{api.profile?.mentalHealthProfile}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Mini Gráfico de Tendencia */}
                        {api.profile?.mentalHealthHistory && api.profile.mentalHealthHistory.length > 1 && (
                          <div className="w-full md:w-48 p-4 bg-[#FBF9F4] rounded-3xl border border-[#ECE8E0] space-y-2">
                            <div className="flex items-center gap-1.5 mb-2">
                              <TrendingUp size={12} className="text-[#8C9B73]" />
                              <span className="text-[9px] font-bold text-[#A3A19E] uppercase tracking-wider">Tendencia</span>
                            </div>
                            <div className="h-16 flex items-end justify-between gap-1 px-1">
                              {api.profile.mentalHealthHistory.slice(-7).map((h, i) => (
                                <div
                                  key={i}
                                  className="w-full bg-[#8C9B73]/40 rounded-t-sm relative group"
                                  style={{ height: `${h.score * 10}%` }}
                                >
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#2F3E46] text-white text-[8px] py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {h.score}/10
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-[8px] text-[#A3A19E] text-center">Últimas evaluaciones</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-[#A3A19E] uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-[#8C9B73]" />
                            Sugerencias de la IA para hoy
                          </p>
                          <button
                            onClick={() => {
                              const message = `Hola 🌸, Tribu AI analizó mi estado hoy y me sugirió esto para que me ayudes:\n\n${api.profile?.mentalHealthSuggestions?.map(s => `• ${s}`).join('\n')}\n\nGracias por estar conmigo ❤️`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="text-[9px] font-bold text-[#5A634D] bg-white border border-[#ECE8E0] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-[#F4F1ED] transition-all shadow-sm cursor-pointer"
                          >
                            <Share2 size={10} />
                            Compartir con mi Apoyo
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {api.profile?.mentalHealthSuggestions?.map((sug, idx) => (
                            <div key={idx} className="p-3 bg-[#FBF9F4] border border-[#ECE8E0] rounded-2xl flex items-center gap-2.5 group hover:border-[#8C9B73]/30 transition-colors">
                              <div className="w-2 h-2 rounded-full bg-[#8C9B73] shrink-0 group-hover:scale-125 transition-transform" />
                              <p className="text-[10px] text-[#5A634D] leading-tight font-medium">{sug}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    {(api.profile?.lastMentalHealthScore || 0) > 7 && (
                      <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-rose-700 uppercase">Aviso de Soporte</p>
                          <p className="text-[10px] text-rose-600 leading-tight">Tu puntuación indica que podrías beneficiarte de hablar con un profesional. Considera usar nuestro botón SOS.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {nextAppointment ? (
              <div className="p-5 rounded-3xl bg-white border border-[#ECE8E0] shadow-sm space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-[#8C9B73]"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[9px] font-sans tracking-wider font-extrabold uppercase text-[#8C9B73]">Próxima Cita</p>
                    <h4 className="text-sm font-serif font-medium text-[#2F3E46] mt-1">{nextAppointment.title}</h4>
                  </div>
                  <button onClick={() => setActiveNav("calendar")} className="text-[10px] font-bold text-[#8C9B73] hover:underline">Ver Agenda</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5 text-[11px] text-[#7A7875] font-medium border-t border-[#ECE8E0]">
                  <p className="flex items-center gap-1.5 truncate"><Clock size={14} /> {nextAppointment.date} • {nextAppointment.time}</p>
                  <p className="flex items-center gap-1.5 truncate"><UserRound size={14} /> {nextAppointment.doctor}</p>
                  <p className="flex items-center gap-1.5 truncate"><MapPin size={14} /> {nextAppointment.location}</p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-3xl bg-white border border-[#ECE8E0] text-center space-y-2.5">
                <p className="text-xs text-[#7A7875]">¿Tienes control prenatal próximamente?</p>
                <button onClick={() => setActiveNav("calendar")} className="text-xs font-semibold text-[#8C9B73] border-b border-[#8C9B73] hover:text-[#7d8c66]">
                  + Agendar control médico
                </button>
              </div>
            )}

            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest flex items-center gap-1.5">
                <CheckSquare className="w-4.5 h-4.5 text-[#8C9B73]" />
                Plan del Día
              </h3>
              <div className="space-y-4">
                {api.careplanTasks.length === 0 ? (
                   <p className="text-xs text-[#A3A19E] italic">Descansa hoy, mamá.</p>
                ) : api.careplanTasks.map((task) => (
                  <div key={task.id} className="p-4 border border-[#ECE8E0] rounded-2xl flex items-start gap-3.5 bg-[#FBF9F4]">
                    <span className="text-xl pt-0.5 shrink-0">{task.category === "autocuidado" ? "🌸" : "🩺"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-[10px] text-[#A3A19E] font-bold uppercase">
                        <span>{task.category}</span>
                        {task.durationMinutes && <span>{task.durationMinutes} min</span>}
                      </div>
                      <h4 className="text-xs font-semibold text-[#2F3E46] mt-0.5">{task.title}</h4>
                      <p className="text-xs text-[#7A7875] mt-1 leading-relaxed font-light">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#ECE8E0] pb-2">
                <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-4 h-4 text-[#8C9B73]" />
                  Check-In
                </h4>
              </div>
              <DailyCheckIn
                checkins={api.checkins}
                onAddCheckIn={api.addCheckIn}
                viewOwnerId={api.viewOwnerId}
                onSendMessage={api.addCheckInConversationMessage}
              />
            </div>

            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-5 shadow-sm space-y-3">
              <p className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest mb-1">Accesos Rápidos</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button onClick={() => setActiveNav("documents")} className="p-3 rounded-2xl bg-[#F4F1ED] border border-[#ECE8E0] text-[#5A634D] text-center hover:bg-[#eae6e0] transition-all font-semibold flex flex-col justify-center items-center gap-1 cursor-pointer">
                  <FileText className="w-4.5 h-4.5" />
                  <span>Subir Receta</span>
                </button>
                <button onClick={() => setActiveNav("crisis")} className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-center hover:bg-rose-100 transition-all font-semibold flex flex-col justify-center items-center gap-1 cursor-pointer">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                  <span>S.O.S</span>
                </button>
              </div>
              <button
                onClick={() => window.open("https://chat.whatsapp.com/invite/latribu", "_blank")}
                className="w-full p-3 rounded-2xl bg-[#E9C4C4]/10 border border-[#E9C4C4]/30 text-[#8B5E5E] text-center hover:bg-[#E9C4C4]/20 transition-all font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Users size={16} />
                <span className="text-xs">Comunidad "La Tribu" 🌸</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={
          api.user ? <OnboardingFlow userName={api.user.name} onComplete={handleCompleteOnboarding} /> : <Navigate to="/login" />
        } />
        <Route path="/dashboard/*" element={
          api.user && api.profile?.onboarded ? (
            <ThemeLayout
              activeNav={showCrisisAlert ? "crisis" : activeNav}
              setActiveNav={(nav) => { setShowCrisisAlert(false); setActiveNav(nav); }}
              user={api.user}
              profile={api.profile}
              subscription={api.subscription}
              viewOwnerId={api.viewOwnerId}
              setViewOwnerId={api.setViewOwnerId}
              companionRelations={api.companionRelations}
              receivedInvitations={api.receivedInvitations}
              onLogout={handleLogout}
              onOpenCrisis={() => setShowCrisisAlert(true)}
            >
              {showCrisisAlert ? (
                <HelpCrisisCentre contacts={api.supportContacts} />
              ) : (
                <>
                  {activeNav === "dashboard" && <Dashboard />}
                  {activeNav === "calendar" && <CalendarModule appointments={api.appointments} documents={api.documents} onAddAppointment={api.addAppointment} onUpdateAppointment={api.updateAppointment} onDeleteAppointment={api.deleteAppointment} onLinkDocument={async (docId, apptId) => api.updateDocument(docId, { appointmentId: apptId })} viewOwnerId={api.viewOwnerId} />}
                  {activeNav === "documents" && <DocumentScanner documents={api.documents} appointments={api.appointments} onAddDocument={api.addDocument} onDeleteDocument={api.deleteDocument} onAnalyzeDocument={api.analyzeDocument} onLinkDocument={async (docId, apptId) => api.updateDocument(docId, { appointmentId: apptId })} viewOwnerId={api.viewOwnerId} />}
                  {activeNav === "companion" && <CompanionModule subscription={api.subscription} sentInvitations={api.sentInvitations} receivedInvitations={api.receivedInvitations} companionRelations={api.companionRelations} sendCompanionInvitation={api.sendCompanionInvitation} respondToInvitation={api.respondToInvitation} updateCompanionPermissions={api.updateCompanionPermissions} revokeCompanionRelation={api.revokeCompanionRelation} handleCheckout={handleBeginCheckout} />}
                  {activeNav === "whatsapp" && <WhatsAppMonitor logs={api.whatsappLogs} profile={api.profile} subscription={api.subscription} onUpdateProfile={api.updateProfile} onSendMessage={api.sendWhatsAppMessage} onAddAppointment={api.addAppointment} onGoToCalendar={() => setActiveNav("calendar")} />}
                  {activeNav === "pricing" && <PricingCentre subscription={api.subscription} onUpgrade={handleBeginCheckout} onCancelRenew={() => handleBeginCheckout("FREE")} />}
                  {activeNav === "profile" && api.profile && (
                    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn text-xs text-[#7A7875] pb-20">
                      {/* Información de Cuenta */}
                      <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 md:p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-[#ECE8E0] pb-4">
                          <h4 className="text-lg font-serif font-semibold text-[#2F3E46] flex items-center gap-2">
                            <User className="w-5 h-5 text-[#8C9B73]" />
                            Perfil Materno
                          </h4>
                          <span className="px-3 py-1 rounded-full bg-[#8C9B73]/10 text-[#5A634D] font-bold text-[10px] uppercase tracking-wider">
                            Plan {api.subscription?.plan || 'Gratis'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Datos Básicos */}
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold text-[#A3A19E] uppercase tracking-widest">Datos Personales</p>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre Completo</label>
                              <input
                                type="text"
                                value={api.user?.name}
                                onChange={(e) => api.login(e.target.value, api.user?.email || '')}
                                className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] focus:outline-none focus:ring-2 focus:ring-[#8C9B73]/20 transition-all bg-[#FBF9F4]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ciudad / Ubicación</label>
                              <input
                                type="text"
                                value={api.profile.city || ''}
                                onChange={(e) => api.updateProfile({ city: e.target.value })}
                                placeholder="Ej: Madrid, España"
                                className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] focus:outline-none focus:ring-2 focus:ring-[#8C9B73]/20 transition-all bg-[#FBF9F4]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre de Pareja / Acompañante</label>
                              <input
                                type="text"
                                value={api.profile.partnerName || ''}
                                onChange={(e) => api.updateProfile({ partnerName: e.target.value })}
                                placeholder="Nombre de tu apoyo"
                                className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] focus:outline-none focus:ring-2 focus:ring-[#8C9B73]/20 transition-all bg-[#FBF9F4]"
                              />
                            </div>
                          </div>

                          {/* Estado de Maternidad */}
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold text-[#A3A19E] uppercase tracking-widest">Etapa Actual</p>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Estado</label>
                              <select
                                value={api.profile.status}
                                onChange={e => api.updateProfile({ status: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] focus:outline-none bg-[#FBF9F4] font-medium"
                              >
                                <option value={PregnancyStatus.PREGNANT}>Embarazada 🤰</option>
                                <option value={PregnancyStatus.POSTPARTUM}>Posparto / Mamá Reciente 👶</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                  {api.profile.status === PregnancyStatus.PREGNANT ? 'Semanas' : 'Meses'}
                                </label>
                                <input
                                  type="number"
                                  value={api.profile.weeksOrMonths}
                                  onChange={e => api.updateProfile({ weeksOrMonths: parseInt(e.target.value) || 0 })}
                                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] focus:outline-none bg-[#FBF9F4]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                  {api.profile.status === PregnancyStatus.PREGNANT ? 'Fecha Parto' : 'Nacimiento'}
                                </label>
                                <input
                                  type="date"
                                  value={api.profile.status === PregnancyStatus.PREGNANT ? api.profile.expectedDueDate : api.profile.babyBirthDate}
                                  onChange={e => api.updateProfile(api.profile?.status === PregnancyStatus.PREGNANT ? { expectedDueDate: e.target.value } : { babyBirthDate: e.target.value })}
                                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] focus:outline-none bg-[#FBF9F4] text-[10px]"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Frecuencia Recordatorios</label>
                              <select
                                value={api.profile.reminderFrequency}
                                onChange={e => api.updateProfile({ reminderFrequency: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-2xl border border-[#ECE8E0] focus:outline-none bg-[#FBF9F4]"
                              >
                                <option value="daily">Diarios (Recomendado)</option>
                                <option value="weekly">Semanales</option>
                                <option value="none">Ninguno</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Botón Cerrar Sesión */}
                        <div className="pt-6 border-t border-[#ECE8E0] flex justify-end">
                          <button
                            onClick={handleLogout}
                            className="px-6 py-3 rounded-2xl border border-rose-100 text-rose-500 font-bold hover:bg-rose-50 transition-all flex items-center gap-2"
                          >
                            <Lock size={16} />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#FBF9F4] p-6 rounded-[32px] border border-dashed border-[#ECE8E0] text-center">
                        <p className="text-[10px] text-[#A3A19E] leading-relaxed italic">
                          "Tus datos nos ayudan a que Tribu AI entienda mejor tu etapa y te brinde recomendaciones de salud perinatal más precisas."
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </ThemeLayout>
          ) : <DashboardRedirect />
        } />
        {/* Fallback to Dashboard which will redirect to / if not logged in */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>

      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 antialiased">
          <div className="bg-white border border-[#ECE8E0] rounded-[36px] max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#F37021] flex items-center justify-center mx-auto scale-110">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest text-[#243959] uppercase font-bold">¡Pago Procesado!</span>
              <h3 className="text-2xl font-serif text-[#2F3E46] font-bold">¡Bienvenida! 🌸</h3>
            </div>
            <p className="text-xs text-[#7A7875] leading-relaxed">
              Tu plan <strong className="text-[#5A634D] font-bold">{paidPlan === "FAMILY" ? "Familiar" : "Premium"}</strong> ha sido activado exitosamente.
            </p>
            <button
              onClick={() => { setShowPaymentSuccess(false); setActiveNav("dashboard"); }}
              className="w-full bg-[#8C9B73] hover:bg-[#77865F] text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              Comenzar 🌸
            </button>
          </div>
        </div>
      )}

      {wompiModalData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 antialiased">
          <div className="bg-[#F8F9FA] border border-gray-200 rounded-[36px] max-w-lg w-full overflow-hidden shadow-2xl relative font-sans flex flex-col">
            <div className="bg-[#243959] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white text-[#243959] flex items-center justify-center font-extrabold text-sm">W</div>
                <h3 className="text-sm font-bold tracking-tight">Wompi Checkout</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono">
                  ${wompiModalData.amountInCents ? (wompiModalData.amountInCents / 100).toLocaleString("es-CO") : "39.900"} COP
                </span>
              </div>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex gap-2.5">
                <Shield className="w-5 h-5 text-[#243959] shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <p className="font-bold">Ambiente de Simulación</p>
                  <p className="text-[10.5px] text-gray-600 leading-relaxed">Procesa un pago interactivo con datos simulados.</p>
                </div>
              </div>
              <div className="flex bg-gray-200/50 p-1 rounded-xl">
                <button type="button" onClick={() => setWompiTab("card")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${wompiTab === "card" ? "bg-white text-gray-800 shadow" : "text-gray-500"}`}><CreditCard size={16} /> Tarjeta</button>
                <button type="button" onClick={() => setWompiTab("pse")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${wompiTab === "pse" ? "bg-white text-gray-850 shadow" : "text-gray-500"}`}><Building2 size={16} /> PSE</button>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200">
                {wompiTab === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500">Número de Tarjeta</label>
                      <input type="text" value={testCard} onChange={(e) => setTestCard(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none" placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500">Nombre</label>
                      <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none" placeholder="Nombre completo" />
                    </div>
                  </div>
                )}
                {wompiTab === "pse" && (
                   <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500">Banco</label>
                      <select value={testBank} onChange={(e) => setTestBank(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none cursor-pointer">
                        <option value="Bancolombia">Bancolombia S.A.</option>
                        <option value="Nequi">Nequi</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-5 bg-gray-50 flex items-center justify-between border-t border-gray-200">
              <button type="button" onClick={() => setWompiModalData(null)} className="text-xs text-gray-500 hover:text-gray-800 font-bold">Cancelar</button>
              <button type="button" onClick={handleConfirmSimulationPayment} disabled={wompiLoading} className="bg-[#243959] hover:bg-[#1a2b44] text-white py-3 px-6 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
                {wompiLoading ? <span>Procesando...</span> : <><span>Pagar COP 🌸</span><ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DashboardRedirect() {
  return <div className="min-h-screen bg-background" />;
}
