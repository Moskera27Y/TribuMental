import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, FileText, MessageCircle, Shield, Check, Star, ChevronRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  return (
    <div className="min-h-screen bg-[#FBF9F4] font-sans text-[#2F3E46]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#ECE8E0]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="font-serif text-xl font-bold text-[#2F3E46]">TribuMental</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-[#7A7875] hover:text-[#2F3E46] transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-[#2F3E46] text-white text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero pt-16 pb-24 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8C9B73]/20 text-[#2F3E46] mb-8 text-xs font-semibold">
            <Sparkles size={14} />
            Acompañamiento emocional para mamás
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#2F3E46] leading-tight mb-6">
            No tienes que cargar<br />
            <em className="not-italic text-[#E9C4C4] italic">esto sola.</em>
          </h1>
          <p className="text-lg text-[#7A7875] max-w-2xl mx-auto mb-10 leading-relaxed">
            TribuMental es tu espacio de calma durante el embarazo y el posparto.
            Check-ins emocionales, calendario médico y organización de documentos —
            todo en un lugar pensado para ti.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            <Link
              to="/register"
              className="px-8 py-4 rounded-full bg-[#2F3E46] text-white font-medium text-base hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              Comenzar gratis <ChevronRight size={18} />
            </Link>
            <a
              href={`https://wa.me/573001234567?text=${encodeURIComponent('Hola, quiero saber más sobre TribuMental')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border border-[#ECE8E0] bg-white text-[#2F3E46] font-medium text-base hover:bg-[#FBF9F4] transition-colors flex items-center gap-2"
            >
              <WhatsAppIcon size={18} />
              Hablar por WhatsApp
            </a>
          </div>
          <p className="text-xs text-[#A3A19E]">
            Sin tarjeta de crédito · Comienza hoy · Cancela cuando quieras
          </p>
        </div>

        {/* Dashboard preview cards */}
        <div className="max-w-4xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
          <PreviewCard emoji="💭" title="Check-in de hoy" desc="¿Cómo te sientes?" color="bg-[#E9C4C4]/20" />
          <PreviewCard emoji="🗓️" title="Próxima cita" desc="Control prenatal · Sem. 32" color="bg-[#8C9B73]/20" />
          <PreviewCard emoji="📄" title="Documentos" desc="Ecografía 28 semanas" color="bg-[#2F3E46]/5" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-[#2F3E46] mb-4 font-bold">
              Todo lo que necesitas en un lugar
            </h2>
            <p className="text-[#7A7875] max-w-xl mx-auto">
              Diseñado con ternura para que el embarazo y el posparto sean un poco más livianos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              emoji="💗"
              title="Check-in emocional diario"
              description="Un momento tuyo cada día. Registra cómo te sientes y recibe sugerencias suaves de autocuidado adaptadas a tu estado."
              bgColor="bg-[#E9C4C4]/20"
            />
            <FeatureCard
              emoji="💬"
              title="Acompañamiento por WhatsApp"
              description="Recibe recordatorios cálidos, mensajes de apoyo y alertas de tus citas directamente en WhatsApp, cuando lo necesites."
              bgColor="bg-[#8C9B73]/20"
            />
            <FeatureCard
              emoji="🗓️"
              title="Calendario médico completo"
              description="Organiza todas tus citas: prenatal, laboratorio, psicología, pediatría. Con recordatorios y estado de cada cita."
              bgColor="bg-[#2F3E46]/5"
            />
            <FeatureCard
              emoji="📋"
              title="Documentos médicos organizados"
              description="Sube órdenes, resultados, ecografías y fórmulas. Quédan vinculados a tu cita, siempre a mano cuando los necesitas."
              bgColor="bg-[#E9C4C4]/20"
            />
            <FeatureCard
              emoji="🛡️"
              title="Centro de ayuda y emergencias"
              description="Si algo no va bien, no estás sola. Acceso directo a líneas de crisis, contactos de emergencia y recursos de apoyo."
              bgColor="bg-[#8C9B73]/20"
            />
            <FeatureCard
              emoji="✨"
              title="Planes de autocuidado"
              description="Ejercicios de respiración, tips de descanso, recordatorios de hidratación. Pequeñas acciones que hacen una gran diferencia."
              bgColor="bg-[#2F3E46]/5"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 gradient-warm">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-[#2F3E46] mb-3 font-bold">Palabras de mamás como tú</h2>
            <p className="text-[#7A7875]">Reales, honestas, nuestras.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="Antes perdía todos mis documentos médicos en la galería del celular. Ahora los tengo organizados por fecha y cita. Parece simple, pero para mí fue un alivio enorme."
              name="Valentina, 32 semanas"
              stage="Embarazada"
            />
            <TestimonialCard
              quote="El check-in emocional me ayudó a darme cuenta de que llevaba semanas sintiéndome muy baja. Ese reconocimiento fue el primer paso para buscar ayuda."
              name="Mariana, 3 meses posparto"
              stage="Posparto"
            />
            <TestimonialCard
              quote="El recordatorio de WhatsApp del día anterior a mi cita prenatal nunca falla. Y el tono del mensaje es tan cálido que se siente como un mensaje de una amiga."
              name="Sara, 28 semanas"
              stage="Embarazada"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-[#2F3E46] mb-4 font-bold">Elige tu plan</h2>
            <p className="text-[#7A7875] mb-6">Comienza gratis. Actualiza cuando sientas que lo necesitas.</p>
            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#FBF9F4]">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${billingPeriod === 'monthly' ? 'bg-white shadow-sm text-[#2F3E46] font-medium' : 'text-[#7A7875]'}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${billingPeriod === 'annual' ? 'bg-white shadow-sm text-[#2F3E46] font-medium' : 'text-[#7A7875]'}`}
              >
                Anual <span className="text-xs text-[#8C9B73] font-medium ml-1">-36%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              name="Gratis"
              price="$0"
              period=""
              description="Para explorar con calma"
              features={[
                'Check-ins emocionales diarios',
                'Historial 7 días',
                '1 cita médica por mes',
                '3 documentos médicos',
                'Centro de emergencias',
              ]}
              cta="Comenzar gratis"
              ctaLink="/register"
              highlight={false}
            />
            <PricingCard
              name="Premium"
              price={billingPeriod === 'annual' ? '$39.900' : '$49.900'}
              period={billingPeriod === 'annual' ? '/mes (COP)' : '/mes (COP)'}
              description="Acompañamiento completo"
              features={[
                'Todo lo del plan Gratis',
                'Citas médicas ilimitadas',
                'Documentos ilimitados',
                'Recordatorios por WhatsApp',
                'Historial completo de ánimo',
                'Búsqueda en documentos',
                '5 contactos de emergencia',
              ]}
              cta="Comenzar Premium"
              ctaLink="/register?plan=premium"
              highlight={true}
            />
            <PricingCard
              name="Familia"
              price={billingPeriod === 'annual' ? '$59.900' : '$69.900'}
              period={billingPeriod === 'annual' ? '/mes (COP)' : '/mes (COP)'}
              description="Para ti y tu cuidador"
              features={[
                'Todo lo del plan Premium',
                '2 cuentas vinculadas',
                'Dashboard compartido',
                'Alertas al cuidador principal',
              ]}
              cta="Plan Familia"
              ctaLink="/register?plan=family"
              highlight={false}
            />
          </div>

          <p className="text-center text-xs text-[#A3A19E] mt-8">
            Pagos seguros con Wompi · Cancela en cualquier momento · Sin penalizaciones
          </p>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 px-4 bg-[#FBF9F4]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-6">🌸</div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#2F3E46] mb-4 font-bold">
            Empieza hoy.<br />Tu bienestar puede esperar, pero no debería.
          </h2>
          <p className="text-[#7A7875] mb-8 leading-relaxed">
            Cada día que pasas sin herramientas de apoyo es un día más cargada.
            TribuMental no reemplaza a nadie — te acompaña.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#2F3E46] text-white font-medium text-base hover:opacity-80 transition-opacity"
          >
            Comenzar gratis <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ECE8E0] py-10 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <span className="font-serif font-bold">TribuMental</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[#7A7875] justify-center">
              <Link to="/" className="hover:text-[#2F3E46] transition-colors">Privacidad</Link>
              <Link to="/" className="hover:text-[#2F3E46] transition-colors">Términos</Link>
              <Link to="/" className="hover:text-[#2F3E46] transition-colors">Ayuda</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-[#ECE8E0]">
            <p className="text-xs text-[#A3A19E] text-center max-w-2xl mx-auto leading-relaxed">
              ⚠️ TribuMental es una herramienta de acompañamiento emocional. No reemplaza la atención médica, psicológica ni psiquiátrica profesional. Si estás viviendo una crisis de salud mental o una emergencia médica, busca atención profesional de inmediato. En caso de emergencia, llama al número de emergencias de tu país.
            </p>
          </div>
          <p className="text-center text-xs text-[#A3A19E] mt-4">
            © {new Date().getFullYear()} TribuMental. Hecho con 💗
          </p>
        </div>
      </footer>
    </div>
  );
}

function PreviewCard({ emoji, title, desc, color }: any) {
  return (
    <div className={`${color} rounded-2xl p-5 text-left`}>
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="font-medium text-sm text-[#2F3E46]">{title}</p>
      <p className="text-xs text-[#7A7875] mt-1">{desc}</p>
    </div>
  );
}

function FeatureCard({ emoji, title, description, bgColor }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ECE8E0] hover:shadow-card-hover transition-shadow">
      <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
        {emoji}
      </div>
      <h3 className="font-serif text-lg text-[#2F3E46] mb-2 font-bold">{title}</h3>
      <p className="text-sm text-[#7A7875] leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, stage }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ECE8E0]">
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={14} fill="#8C9B73" className="text-[#8C9B73]" />
        ))}
      </div>
      <p className="text-sm text-[#2F3E46] leading-relaxed mb-4 italic">"{quote}"</p>
      <div>
        <p className="text-sm font-medium text-[#2F3E46]">{name}</p>
        <p className="text-xs text-[#7A7875]">{stage}</p>
      </div>
    </div>
  );
}

function PricingCard({ name, price, period, description, features, cta, ctaLink, highlight }: any) {
  return (
    <div className={`relative rounded-2xl p-6 border ${highlight ? 'border-[#2F3E46] bg-[#2F3E46]/5 shadow-warm' : 'border-[#ECE8E0] bg-white'}`}>
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#2F3E46] text-white text-xs font-medium">
          Más popular
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-serif text-xl text-[#2F3E46] font-bold">{name}</h3>
        <p className="text-xs text-[#7A7875] mt-0.5">{description}</p>
      </div>
      <div className="mb-6">
        <span className="font-serif text-3xl text-[#2F3E46] font-bold">{price}</span>
        <span className="text-sm text-[#7A7875] ml-1">{period}</span>
      </div>
      <ul className="space-y-2.5 mb-8">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#2F3E46]">
            <Check size={15} className="text-[#8C9B73] mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to={ctaLink}
        className={`block w-full text-center py-3 rounded-full font-medium text-sm transition-opacity cursor-pointer ${
          highlight
            ? 'bg-[#2F3E46] text-white hover:opacity-80'
            : 'border border-[#ECE8E0] bg-white text-[#2F3E46] hover:bg-[#FBF9F4]'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
