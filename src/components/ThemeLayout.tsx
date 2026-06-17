import React, { useState } from "react";
import { 
  Heart, 
  Calendar, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  User, 
  Sparkles, 
  LogOut,
  Users,
  Menu,
  X
} from "lucide-react";
import { PregnancyStatus, SubscriptionPlan } from "../types";

interface ThemeLayoutProps {
  children: React.ReactNode;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  user: any;
  profile: any;
  subscription: any;
  viewOwnerId: string | null;
  setViewOwnerId: (ownerId: string | null) => void;
  companionRelations: { asPrimary: any[], asCompanion: any[] };
  receivedInvitations: any[];
  onLogout: () => void;
  onOpenCrisis: () => void;
}

export default function ThemeLayout({
  children,
  activeNav,
  setActiveNav,
  user,
  profile,
  subscription,
  viewOwnerId,
  setViewOwnerId,
  companionRelations,
  receivedInvitations,
  onLogout,
  onOpenCrisis
}: ThemeLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isPregnant = profile?.status === PregnancyStatus.PREGNANT;

  const navItems = [
    { id: "dashboard", label: "Mi Portal", icon: Heart },
    { id: "calendar", label: "Mis Citas", icon: Calendar },
    { id: "documents", label: "Mis Expedientes", icon: FileText },
    { id: "whatsapp_bot", label: "Bot de WhatsApp", icon: MessageSquare, isExternal: true },
    { id: "whatsapp", label: "Simulador WPP", icon: MessageSquare },
    { id: "companion", label: "Plan Familiar / Apoyo", icon: Users, badge: receivedInvitations?.length || 0 },
    { id: "pricing", label: "Suscripción", icon: Sparkles },
    { id: "profile", label: "Mi Cuenta", icon: User },
  ];

  const handleNavClick = (id: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open("https://wa.me/573000000000", "_blank");
    } else {
      setActiveNav(id);
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#2F3E46] font-sans flex flex-col antialiased">
      {/* Dynamic Top Announcement */}
      <div className="bg-[#E9C4C4]/20 text-[#8B5E5E] text-[10px] md:text-xs px-4 py-2 text-center font-medium border-b border-[#E9C4C4]/40 flex items-center justify-center gap-2">
        <span>🌸</span>
        <span className="truncate">
          TribuMental no reemplaza la consulta médica profesional.
        </span>
        <button 
          onClick={onOpenCrisis} 
          className="underline ml-1 text-[#8B5E5E] hover:text-[#6a4242] transition-all font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
          Ayuda
        </button>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#ECE8E0] px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F4F1ED] flex items-center justify-center border border-[#ECE8E0]">
            <Heart className="w-4 h-4 text-[#8C9B73]" />
          </div>
          <span className="font-serif font-bold text-lg">TribuMental</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-[#FBF9F4] text-[#5A634D] cursor-pointer"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Companion Viewing Banner */}
      {viewOwnerId && (
        <div className="bg-[#8C9B73]/10 text-[#5A634D] text-xs px-4 py-2 text-center font-semibold border-b border-[#8C9B73]/30 flex items-center justify-center gap-2">
          <span>👁️</span>
          <span>
            Viendo espacio de <strong>{companionRelations.asCompanion?.find(r => r.primaryUserId === viewOwnerId)?.primaryUserName || "tu compañera"}</strong>
          </span>
          <button 
            onClick={() => setViewOwnerId(null)} 
            className="underline ml-2 text-[#5A634D] hover:text-[#2F3E46] transition-all font-bold cursor-pointer"
          >
            Volver
          </button>
        </div>
      )}

      {/* Main Core Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Responsive Sidebar Menu */}
        <aside className={`
          fixed md:sticky top-0 left-0 z-40 h-full md:h-screen w-64 bg-white border-r border-[#ECE8E0] flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}>
          <div className="p-5 flex-1 overflow-y-auto">
            {/* Elegant Header Brand - Hidden on Mobile sidebar because of Mobile Header */}
            <div className="hidden md:flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#F4F1ED] flex items-center justify-center border border-[#ECE8E0]">
                <Heart className="w-5 h-5 text-[#8C9B73]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-[#2F3E46] font-serif">TribuMental</h1>
                <p className="text-[10px] text-[#A3A19E] uppercase tracking-widest mt-1">Acompañamiento Maternal</p>
              </div>
            </div>

            {/* Mother Progress Indicator Card */}
            {profile && (
              <div className="mb-6 p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE8E0] text-xs">
                <div className="font-serif text-[#5A634D] font-medium flex items-center justify-between">
                  <span>{isPregnant ? "🤰 Embarazo" : "👶 Posparto"}</span>
                  <span className="bg-[#F4F1ED] text-[#5A634D] px-1.5 py-0.5 rounded font-bold">
                    {profile.weeksOrMonths} {isPregnant ? "Sms" : "Meses"}
                  </span>
                </div>
                {/* Subscription Badge */}
                <div className="mt-3 pt-3 border-t border-[#ECE8E0] flex items-center justify-between">
                  <span className="text-[#A3A19E]">Tu Plan:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                    subscription?.plan === SubscriptionPlan.FAMILY 
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : subscription?.plan === SubscriptionPlan.PREMIUM
                      ? "bg-sage-green/20 text-sage-green border border-sage-green/30"
                      : "bg-[#F4F1ED] text-[#7A7875] border border-[#ECE8E0]"
                  }`}>
                    {subscription?.plan || "GRATUITO"}
                  </span>
                </div>
              </div>
            )}

            {/* Nav Menu */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, (item as any).isExternal)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? "bg-[#F4F1ED] text-[#5A634D] font-semibold border-l-4 border-[#8C9B73]"
                        : "text-[#7A7875] hover:bg-[#FBF9F4] hover:text-[#5A634D]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? "text-[#8C9B73]" : "text-[#A3A19E]"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === "companion" && !!item.badge && (
                      <span className="bg-[#E9C4C4] text-[#8B5E5E] text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Shared Companion Workspaces */}
            {companionRelations?.asCompanion?.length > 0 && (
              <div className="mt-8 pt-4 border-t border-[#ECE8E0]">
                <p className="text-[10px] text-[#A3A19E] uppercase tracking-widest font-semibold mb-2 px-1">Espacios Compartidos</p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setViewOwnerId(null);
                      handleNavClick("dashboard");
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      !viewOwnerId 
                        ? "bg-[#8C9B73]/10 text-[#5A634D]"
                        : "text-[#7A7875] hover:bg-[#FBF9F4] hover:text-[#5A634D]"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C9B73]"></span>
                    Mi Espacio
                  </button>
                  {companionRelations.asCompanion.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => {
                        setViewOwnerId(rel.primaryUserId);
                        handleNavClick("dashboard");
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        viewOwnerId === rel.primaryUserId
                          ? "bg-[#E9C4C4]/20 text-[#8B5E5E] font-bold border border-[#E9C4C4]/40"
                          : "text-[#7A7875] hover:bg-[#FBF9F4] hover:text-[#5A634D]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E9C4C4]"></span>
                      Apoyo: {rel.primaryUserName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#ECE8E0] space-y-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-[#F4F1ED] text-[#5A634D] border border-[#ECE8E0] flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "M"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-[#2F3E46] truncate">{user?.name || "Mamá Tribu"}</p>
                <p className="text-[10px] text-[#7A7875] truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#8B5E5E] hover:bg-[#E9C4C4]/10 font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Workspace Display Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      {profile?.whatsappEnabled && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setActiveNav("whatsapp")}
            className="flex items-center justify-center bg-[#25D366] text-white w-12 h-12 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-6 h-6 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}
