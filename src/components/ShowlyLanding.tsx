import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Globe2,
  Layers3,
  MessageCircle,
  Palette,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from 'lucide-react';
import { SHOWLY_STORES } from '../data/mockData';

type Language = 'ar' | 'fr' | 'en';

const copy = {
  ar: {
    navPlatform: 'المنصة', navSectors: 'القطاعات', navDemo: 'تجربة مباشرة', navAdmin: 'دخول الإدارة',
    eyebrow: 'تجربة المنتج تبدأ من QR',
    title: 'اجعل كل منتج يُرى قبل أن يُشترى.',
    subtitle: 'Showly يحوّل رمز QR إلى تجربة تفاعلية أنيقة تعرض منتجاتك وخدماتك، وتقرّب العميل من قرار الشراء في لحظات.',
    primary: 'شاهد تجربة متجر', secondary: 'استكشف المنصة',
    live: 'تجربة حية', views: 'زيارة هذا الشهر', interactions: 'تفاعلات العملاء',
    platformTitle: 'واجهة واحدة، لكل نشاط تجاري.',
    platformText: 'من قائمة مطعم إلى كتالوج أزياء أو معرض أثاث؛ كل متجر يحصل على صفحة سريعة تحمل هويته وبياناته وروابطه.',
    sectorsTitle: 'مصمم ليعمل مع طريقة بيعك.',
    sectors: ['مطاعم ومقاهي', 'أزياء وأحذية', 'تجميل وعناية', 'أثاث وديكور', 'إلكترونيات', 'خدمات وحجوزات'],
    featureTitle: 'كل ما تحتاجه لتظهر بشكل احترافي.',
    features: [
      ['QR ثابت وقابل للتحديث', 'اطبع الرمز مرة واحدة، وغيّر المحتوى من لوحة التحكم متى شئت.', QrCode],
      ['كتالوج بصري سريع', 'صور كبيرة، تفاصيل منظمة، توفر واضح، وتجربة ممتازة على الهاتف.', Palette],
      ['تواصل مباشر عبر WhatsApp', 'حوّل اهتمام العميل إلى محادثة أو طلب بدون خطوات معقدة.', MessageCircle],
      ['إحصائيات مفهومة', 'اعرف ما الذي يراه عملاؤك وما المنتجات التي تثير اهتمامهم.', BarChart3],
    ],
    ctaTitle: 'منتجك يستحق واجهة أفضل.', ctaText: 'ابدأ من تجربة جاهزة، ثم خصّصها لهوية متجرك في دقائق.', ctaButton: 'افتح تجربة Maison Du Délice',
    footer: 'Showly — Interactive Product Experience', admin: 'لوحة الإدارة', language: 'اللغة',
  },
  fr: {
    navPlatform: 'Plateforme', navSectors: 'Secteurs', navDemo: 'Démo en direct', navAdmin: 'Administration',
    eyebrow: 'L’expérience produit commence par un QR',
    title: 'Faites voir chaque produit avant de le vendre.',
    subtitle: 'Showly transforme un QR code en une expérience interactive et élégante pour présenter vos produits et services.',
    primary: 'Voir une boutique', secondary: 'Découvrir la plateforme',
    live: 'Démo en direct', views: 'visites ce mois', interactions: 'interactions',
    platformTitle: 'Une interface pour chaque activité.',
    platformText: 'Menu de restaurant, catalogue de mode ou showroom mobilier : chaque boutique garde son identité et ses données.',
    sectorsTitle: 'Pensé pour votre façon de vendre.',
    sectors: ['Restaurants & cafés', 'Mode & chaussures', 'Beauté & soins', 'Mobilier & déco', 'Électronique', 'Services & rendez-vous'],
    featureTitle: 'Tout pour paraître professionnel.',
    features: [
      ['QR permanent et actualisable', 'Imprimez une fois et modifiez votre contenu depuis l’administration.', QrCode],
      ['Catalogue visuel rapide', 'Photos fortes, détails clairs, disponibilité et mobile-first.', Palette],
      ['Contact WhatsApp direct', 'Transformez l’intérêt en conversation ou en demande.', MessageCircle],
      ['Statistiques simples', 'Comprenez ce que vos clients regardent et recherchent.', BarChart3],
    ],
    ctaTitle: 'Votre produit mérite mieux.', ctaText: 'Commencez avec une expérience prête à présenter et adaptez-la en quelques minutes.', ctaButton: 'Ouvrir Maison Du Délice',
    footer: 'Showly — Interactive Product Experience', admin: 'Administration', language: 'Langue',
  },
  en: {
    navPlatform: 'Platform', navSectors: 'Sectors', navDemo: 'Live demo', navAdmin: 'Admin access',
    eyebrow: 'The product experience starts with a QR',
    title: 'Let every product be seen before it is sold.',
    subtitle: 'Showly turns a QR code into a polished interactive experience for presenting products and services and moving customers closer to action.',
    primary: 'View a live store', secondary: 'Explore the platform',
    live: 'Live demo', views: 'visits this month', interactions: 'customer interactions',
    platformTitle: 'One interface, every business.',
    platformText: 'From a restaurant menu to a fashion catalog or furniture showroom, every store keeps its own identity, content, and links.',
    sectorsTitle: 'Built around how you sell.',
    sectors: ['Restaurants & cafés', 'Fashion & footwear', 'Beauty & care', 'Furniture & décor', 'Electronics', 'Services & bookings'],
    featureTitle: 'Everything you need to look professional.',
    features: [
      ['Permanent, updateable QR', 'Print once and update your content from the dashboard whenever you need.', QrCode],
      ['Fast visual catalog', 'Strong imagery, clear details, availability, and mobile-first browsing.', Palette],
      ['Direct WhatsApp contact', 'Turn attention into a conversation or an enquiry with fewer steps.', MessageCircle],
      ['Simple analytics', 'See what customers view and which products spark interest.', BarChart3],
    ],
    ctaTitle: 'Your product deserves a better stage.', ctaText: 'Start with a ready-to-show experience and adapt it to your brand in minutes.', ctaButton: 'Open Maison Du Délice',
    footer: 'Showly — Interactive Product Experience', admin: 'Admin dashboard', language: 'Language',
  },
} as const;

const industryIcons = [Store, Sparkles, ShieldCheck, Layers3, Zap, ScanLine];

export function ShowlyLanding() {
  const [lang, setLang] = useState<Language>('ar');
  const t = copy[lang];
  const isAr = lang === 'ar';
  const metrics = useMemo(() => {
    const views = SHOWLY_STORES.reduce((sum, store) => sum + store.views, 0);
    const interactions = SHOWLY_STORES.reduce((sum, store) => sum + store.interactions, 0);
    return { views: views.toLocaleString(), interactions: interactions.toLocaleString() };
  }, []);

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.title = 'Showly — Interactive Product Experience';
  }, [isAr, lang]);

  const openStore = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    window.location.href = `${base}/?store=maison-du-delice`;
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#08090d] text-white selection:bg-[#d9ff58] selection:text-[#10130d]">
      <div className="pointer-events-none fixed inset-0 opacity-60" style={{ background: 'radial-gradient(circle at 75% 4%, rgba(217,255,88,.18), transparent 25%), radial-gradient(circle at 4% 45%, rgba(94,80,255,.16), transparent 28%)' }} />
      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="Showly home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d9ff58] text-[#11140d] shadow-[0_0_30px_rgba(217,255,88,.22)]"><ScanLine className="h-5 w-5" /></span>
          <span><strong className="block text-lg tracking-tight">Showly</strong><small className="block text-[9px] uppercase tracking-[.32em] text-white/40">Interactive Product Experience</small></span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-white/55 md:flex">
          <a href="#platform" className="transition hover:text-white">{t.navPlatform}</a>
          <a href="#sectors" className="transition hover:text-white">{t.navSectors}</a>
          <button type="button" onClick={openStore} className="transition hover:text-white">{t.navDemo}</button>
          <a href={`${import.meta.env.BASE_URL}admin`} className="rounded-full border border-white/15 px-4 py-2 text-white transition hover:border-[#d9ff58]/70 hover:text-[#d9ff58]">{t.navAdmin}</a>
        </div>
        <div className="flex items-center gap-2">
          {(['ar', 'fr', 'en'] as Language[]).map((item) => (
            <button key={item} type="button" onClick={() => setLang(item)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition ${lang === item ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`} aria-label={`${t.language}: ${item}`}>{item}</button>
          ))}
        </div>
      </nav>

      <main id="top" className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8 lg:pb-36 lg:pt-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9ff58]/25 bg-[#d9ff58]/[.07] px-3 py-2 text-xs font-semibold text-[#d9ff58]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d9ff58]" />{t.eyebrow}</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.06em] sm:text-6xl lg:text-8xl">{t.title}</h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/55 sm:text-lg">{t.subtitle}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={openStore} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d9ff58] px-6 py-4 font-bold text-[#11140d] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(217,255,88,.2)]">{t.primary}<ArrowUpRight className="h-4 w-4" /></button>
              <a href="#platform" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-4 font-bold text-white transition hover:border-white/35">{t.secondary}</a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-xs text-white/45"><span><strong className="mr-1 text-xl text-white">{metrics.views}</strong>{t.views}</span><span><strong className="mr-1 text-xl text-white">{metrics.interactions}</strong>{t.interactions}</span><span className="inline-flex items-center gap-1.5 text-[#d9ff58]"><Check className="h-3.5 w-3.5" />No commission by default</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute -inset-8 rounded-[3rem] bg-[#d9ff58]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#11141a]/90 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
              <div className="flex items-center justify-between px-3 py-3"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d9ff58] font-black text-[#11140d]">MD</span><div><div className="text-sm font-bold">Maison Du Délice</div><div className="text-[10px] text-white/40">{isAr ? 'تجربة متجر مباشرة' : lang === 'fr' ? 'Expérience boutique' : 'Live storefront experience'}</div></div></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">● Live</span></div>
              <div className="relative aspect-[1.04] overflow-hidden rounded-[1.4rem]" style={{ backgroundImage: `linear-gradient(180deg, transparent 25%, rgba(7,8,10,.88) 100%), url(${SHOWLY_STORES[0].coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="absolute inset-x-5 bottom-5"><span className="rounded-full bg-[#d9ff58] px-3 py-1 text-[10px] font-bold text-[#11140d]">{t.live}</span><h3 className="mt-3 text-3xl font-black tracking-tight">{isAr ? 'اكتشف ما يميزك.' : lang === 'fr' ? 'Révélez ce qui vous distingue.' : 'Show what makes you different.'}</h3><div className="mt-4 flex items-center justify-between rounded-2xl border border-white/15 bg-black/25 p-3 backdrop-blur-md"><span className="text-xs text-white/70">{isAr ? 'كتالوج تفاعلي • محدث دائماً' : lang === 'fr' ? 'Catalogue interactif • toujours à jour' : 'Interactive catalog • always up to date'}</span><ArrowUpRight className="h-4 w-4 text-[#d9ff58]" /></div></div></div>
              <div className="grid grid-cols-3 gap-2 p-1 pt-3"><div className="rounded-2xl bg-white/[.04] p-3"><div className="text-[10px] text-white/40">{isAr ? 'عرض المنتج' : lang === 'fr' ? 'Produit vu' : 'Product views'}</div><div className="mt-1 text-xl font-black">+48%</div></div><div className="rounded-2xl bg-white/[.04] p-3"><div className="text-[10px] text-white/40">{isAr ? 'تواصل' : lang === 'fr' ? 'Contacts' : 'Contacts'}</div><div className="mt-1 text-xl font-black">+31%</div></div><div className="rounded-2xl bg-white/[.04] p-3"><div className="text-[10px] text-white/40">{isAr ? 'متاجر' : lang === 'fr' ? 'Boutiques' : 'Stores'}</div><div className="mt-1 text-xl font-black">3</div></div></div>
            </div>
          </div>
        </section>

        <section id="platform" className="mx-auto max-w-7xl scroll-mt-10 px-5 py-20 lg:px-8 lg:py-28"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><span className="text-xs font-bold uppercase tracking-[.28em] text-[#d9ff58]">01 / {t.navPlatform}</span><h2 className="mt-5 text-4xl font-black tracking-[-.04em] sm:text-6xl">{t.platformTitle}</h2></div><p className="max-w-xl text-base leading-8 text-white/50">{t.platformText}</p></div><div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{t.features.map(([title, text, Icon]) => <article key={title} className="group rounded-3xl border border-white/10 bg-white/[.035] p-6 transition hover:-translate-y-1 hover:border-[#d9ff58]/35 hover:bg-[#d9ff58]/[.05]"><div className="mb-12 grid h-11 w-11 place-items-center rounded-2xl bg-[#d9ff58]/10 text-[#d9ff58]"><Icon className="h-5 w-5" /></div><h3 className="text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-7 text-white/45">{text}</p></article>)}</div></section>

        <section id="sectors" className="scroll-mt-10 border-y border-white/10 bg-white/[.025] px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><span className="text-xs font-bold uppercase tracking-[.28em] text-[#d9ff58]">02 / {t.navSectors}</span><div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end"><h2 className="max-w-2xl text-4xl font-black tracking-[-.04em] sm:text-6xl">{t.sectorsTitle}</h2><p className="max-w-sm text-sm leading-7 text-white/45">{isAr ? 'غيّر النشاط، لا تغيّر المنصة. نفس الجودة البصرية مع محتوى يناسب جمهورك.' : lang === 'fr' ? 'Changez de secteur, pas de plateforme. La même qualité visuelle, adaptée à votre audience.' : 'Change the industry, not the platform. The same visual quality, adapted to your audience.'}</p></div><div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{t.sectors.map((sector, index) => { const Icon = industryIcons[index]; return <div key={sector} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c0e13] p-5"><div className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] text-[#d9ff58]"><Icon className="h-5 w-5" /></span><span className="font-semibold">{sector}</span></div><ArrowUpRight className="h-4 w-4 text-white/25" /></div>; })}</div></div></section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-32"><div className="relative overflow-hidden rounded-[2rem] border border-[#d9ff58]/25 bg-[#d9ff58] p-8 text-[#11140d] sm:p-14"><div className="absolute -right-10 -top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" /><div className="relative max-w-2xl"><span className="text-xs font-bold uppercase tracking-[.28em] opacity-60">03 / Showly</span><h2 className="mt-6 text-4xl font-black tracking-[-.05em] sm:text-6xl">{t.ctaTitle}</h2><p className="mt-5 max-w-lg text-base leading-8 opacity-70">{t.ctaText}</p><button type="button" onClick={openStore} className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#11140d] px-5 py-4 font-bold text-white transition hover:bg-black">{t.ctaButton}<ArrowUpRight className="h-4 w-4" /></button></div></div></section>
      </main>
      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 px-5 py-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>{t.footer}</span><div className="flex items-center gap-5"><a href={`${import.meta.env.BASE_URL}admin`} className="transition hover:text-white">{t.admin}</a><span className="inline-flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" />{lang.toUpperCase()}</span></div></footer>
    </div>
  );
}
