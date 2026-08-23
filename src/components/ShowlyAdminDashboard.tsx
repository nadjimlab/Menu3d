import { useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  ChevronLeft,
  ExternalLink,
  Eye,
  Globe2,
  LayoutDashboard,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  QrCode,
  Save,
  Settings2,
  Store,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PRODUCTS, SHOWLY_STORES } from '../data/mockData';
import { ShowlyStore } from '../types';
import { readShowlyStoreMetrics } from '../utils/showlyAnalytics';

type Tab = 'overview' | 'stores' | 'catalog' | 'qr' | 'analytics';

type Copy = {
  ar: Record<string, string>;
  fr: Record<string, string>;
  en: Record<string, string>;
};

const copy: Copy = {
  ar: { dashboard: 'لوحة Showly', subtitle: 'إدارة تجربة منتجاتك من مكان واحد', overview: 'نظرة عامة', stores: 'المتاجر', catalog: 'الكتالوج', qr: 'رموز QR', analytics: 'الإحصائيات', live: 'منشور', draft: 'مسودة', totalStores: 'إجمالي المتاجر', monthlyViews: 'الزيارات هذا الشهر', interactions: 'تفاعلات العملاء', products: 'منتج / خدمة', manage: 'إدارة المتجر', open: 'فتح الصفحة', visit: 'زيارة', edit: 'تعديل', save: 'حفظ التغييرات', cancel: 'إلغاء', storeName: 'اسم المتجر', city: 'المدينة', whatsapp: 'WhatsApp', published: 'النشر العام', noData: 'لا توجد بيانات بعد', qrText: 'رمز QR الثابت', qrHint: 'اطبع الرمز مرة واحدة، ويمكنك تحديث المحتوى من هنا دون تغيير الرمز.', print: 'طباعة الرموز', newStore: 'إضافة متجر', recent: 'أداء المتاجر', views: 'زيارة', engagement: 'تفاعل', catalogHint: 'حدّث الأسعار والتوفر والصور من واجهة واحدة.', launch: 'تجربة المتجر', exit: 'واجهة الزبون', language: 'اللغة' },
  fr: { dashboard: 'Tableau Showly', subtitle: 'Gérez toutes vos expériences depuis un seul espace', overview: 'Vue d’ensemble', stores: 'Boutiques', catalog: 'Catalogue', qr: 'QR codes', analytics: 'Statistiques', live: 'Publié', draft: 'Brouillon', totalStores: 'Boutiques', monthlyViews: 'Visites ce mois', interactions: 'Interactions', products: 'Produit / service', manage: 'Gérer la boutique', open: 'Ouvrir la page', visit: 'Visiter', edit: 'Modifier', save: 'Enregistrer', cancel: 'Annuler', storeName: 'Nom de la boutique', city: 'Ville', whatsapp: 'WhatsApp', published: 'Publication publique', noData: 'Aucune donnée', qrText: 'QR permanent', qrHint: 'Imprimez une fois et mettez à jour le contenu sans changer le code.', print: 'Imprimer les codes', newStore: 'Ajouter une boutique', recent: 'Performance des boutiques', views: 'visites', engagement: 'interactions', catalogHint: 'Mettez à jour prix, disponibilité et visuels depuis un seul espace.', launch: 'Voir la boutique', exit: 'Vue client', language: 'Langue' },
  en: { dashboard: 'Showly dashboard', subtitle: 'Manage every product experience from one place', overview: 'Overview', stores: 'Stores', catalog: 'Catalog', qr: 'QR codes', analytics: 'Analytics', live: 'Published', draft: 'Draft', totalStores: 'Total stores', monthlyViews: 'Monthly views', interactions: 'Customer interactions', products: 'Products / services', manage: 'Manage store', open: 'Open page', visit: 'Visit', edit: 'Edit', save: 'Save changes', cancel: 'Cancel', storeName: 'Store name', city: 'City', whatsapp: 'WhatsApp', published: 'Public publishing', noData: 'No data yet', qrText: 'Permanent QR code', qrHint: 'Print once and update your content without changing the code.', print: 'Print codes', newStore: 'Add store', recent: 'Store performance', views: 'views', engagement: 'interactions', catalogHint: 'Update pricing, availability, and visuals from one place.', launch: 'View storefront', exit: 'Customer view', language: 'Language' },
};

const industryNames = { cafe: { ar: 'مقهى', fr: 'Café', en: 'Café' }, fashion: { ar: 'أزياء', fr: 'Mode', en: 'Fashion' }, furniture: { ar: 'أثاث', fr: 'Mobilier', en: 'Furniture' } } as const;

export function ShowlyAdminDashboard() {
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar');
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedStoreId, setSelectedStoreId] = useState(SHOWLY_STORES[0].id);
  const [stores, setStores] = useState<ShowlyStore[]>(SHOWLY_STORES);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const t = copy[lang];
  const current = stores.find((store) => store.id === selectedStoreId) || stores[0];
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const metricsByStore = useMemo(() => new Map(stores.map((store) => [store.id, readShowlyStoreMetrics(store.slug, { views: store.views, interactions: store.interactions })])), [stores]);
  const metricsFor = (store: ShowlyStore) => metricsByStore.get(store.id) || { views: store.views, interactions: store.interactions };
  const totalViews = stores.reduce((sum, store) => sum + metricsFor(store).views, 0);
  const totalInteractions = stores.reduce((sum, store) => sum + metricsFor(store).interactions, 0);
  const tableQrUrl = `${window.location.origin}${base}/?store=${current.slug}`;
  const tabs: Array<[Tab, typeof LayoutDashboard, string]> = [[ 'overview', LayoutDashboard, t.overview ], [ 'stores', Store, t.stores ], [ 'catalog', Package, t.catalog ], [ 'qr', QrCode, t.qr ], [ 'analytics', BarChart3, t.analytics ]];

  const updateCurrent = (patch: Partial<ShowlyStore>) => setStores((items) => items.map((store) => store.id === current.id ? { ...store, ...patch } : store));
  const storefront = `${base}/?store=${current.slug}`;

  const showSaved = () => {
    setEditing(false);
    setNotice(lang === 'ar' ? 'تم حفظ تحديثات المتجر في هذه الجلسة.' : lang === 'fr' ? 'Les changements sont enregistrés dans cette session.' : 'Store changes saved for this session.');
    window.setTimeout(() => setNotice(''), 2800);
  };

  const nav = (next: Tab) => setTab(next);
  const handleAddStore = () => {
    const suffix = stores.length + 1;
    const newStore: ShowlyStore = {
      id: `store-${suffix}`,
      slug: `new-store-${suffix}`,
      name: `متجر جديد ${suffix}`,
      nameFr: `Nouvelle boutique ${suffix}`,
      nameEn: `New store ${suffix}`,
      description: 'أضف وصفاً يعبّر عن تجربة علامتك.',
      descriptionFr: 'Ajoutez une description qui exprime votre marque.',
      descriptionEn: 'Add a description that expresses your brand.',
      industry: 'retail',
      city: 'الجزائر',
      cityEn: 'Algiers',
      accent: '#d9ff58',
      coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
      logoMark: `N${suffix}`,
      phone: '+213555000000',
      whatsapp: '213555000000',
      isPublished: false,
      views: 0,
      interactions: 0,
      productsCount: 0,
    };
    setStores((items) => [...items, newStore]);
    setSelectedStoreId(newStore.id);
    setEditing(true);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#172018]">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e border-black/5 bg-[#10150f] p-5 text-white lg:block"><a href={`${base}/`} className="flex items-center gap-3 px-2"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#d9ff58] font-black text-[#11140d]">S</span><span><strong className="block text-lg">Showly</strong><small className="text-[9px] uppercase tracking-[.25em] text-white/35">Workspace</small></span></a><div className="mt-12 space-y-1">{tabs.map(([id, Icon, label]) => <button key={id} type="button" onClick={() => nav(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${tab === id ? 'bg-[#d9ff58] text-[#11140d]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</button>)}</div><div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="text-[10px] uppercase tracking-[.2em] text-white/35">{t.manage}</div><div className="mt-2 truncate text-sm font-bold">{current.name}</div><a href={storefront} className="mt-3 inline-flex items-center gap-2 text-xs text-[#d9ff58]">{t.launch}<ExternalLink className="h-3 w-3" /></a></div></aside>
      <main className="min-h-screen lg:ms-64">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f4f5f2]/90 backdrop-blur-xl"><div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8"><div className="flex items-center gap-3"><a href={`${base}/`} className="grid h-9 w-9 place-items-center rounded-xl bg-[#172018] font-black text-[#d9ff58] lg:hidden">S</a><div><h1 className="text-lg font-black sm:text-xl">{t.dashboard}</h1><p className="text-xs text-black/45">{t.subtitle}</p></div></div><div className="flex items-center gap-2"><select value={lang} onChange={(event) => setLang(event.target.value as 'ar' | 'fr' | 'en')} className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold outline-none"><option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option></select><a href={storefront} className="hidden items-center gap-2 rounded-full bg-[#172018] px-4 py-2.5 text-xs font-bold text-white sm:inline-flex">{t.exit}<ExternalLink className="h-3.5 w-3.5" /></a></div></div><div className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">{tabs.map(([id, Icon, label]) => <button key={id} type="button" onClick={() => nav(id)} className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${tab === id ? 'bg-[#172018] text-white' : 'bg-white text-black/50'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div></header>

        <div className="mx-auto max-w-7xl p-4 sm:p-8">{notice && <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><Check className="h-4 w-4" />{notice}</div>}
          {tab === 'overview' && <><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-xs font-black uppercase tracking-[.25em] text-black/35">Showly / Workspace</span><h2 className="mt-3 text-4xl font-black tracking-[-.06em] sm:text-6xl">{t.overview}</h2></div><button type="button" onClick={handleAddStore} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d9ff58] px-5 py-3 text-sm font-black text-[#11140d]"><Plus className="h-4 w-4" />{t.newStore}</button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Store} label={t.totalStores} value={String(stores.length)} accent="bg-[#d9ff58]" /><Metric icon={Eye} label={t.monthlyViews} value={totalViews.toLocaleString()} accent="bg-[#dce8ff]" /><Metric icon={MessageCircle} label={t.interactions} value={totalInteractions.toLocaleString()} accent="bg-[#ffe3c1]" /><Metric icon={Package} label={t.products} value={String(stores.reduce((sum, store) => sum + store.productsCount, 0))} accent="bg-[#f0dcff]" /></div><section className="mt-8 rounded-3xl border border-black/8 bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><h3 className="text-xl font-black">{t.recent}</h3><p className="mt-1 text-sm text-black/45">{t.catalogHint}</p></div><button type="button" onClick={() => setTab('analytics')} className="text-xs font-bold text-black/45 hover:text-black">{t.analytics} <ChevronLeft className="inline h-3 w-3" /></button></div><div className="mt-6 space-y-3">{stores.map((store) => <StoreRow key={store.id} store={{ ...store, ...metricsFor(store) }} lang={lang} t={t} selected={store.id === selectedStoreId} onSelect={() => setSelectedStoreId(store.id)} onOpen={() => window.open(`${base}/?store=${store.slug}`, '_blank')} />)}</div></section></>}

          {tab === 'stores' && <section><PageHeading eyebrow="01 / Workspace" title={t.stores} action={<button type="button" onClick={handleAddStore} className="inline-flex items-center gap-2 rounded-2xl bg-[#172018] px-4 py-3 text-xs font-bold text-white"><Plus className="h-4 w-4" />{t.newStore}</button>} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stores.map((store) => <StoreCard key={store.id} store={{ ...store, ...metricsFor(store) }} lang={lang} t={t} selected={store.id === selectedStoreId} onSelect={() => setSelectedStoreId(store.id)} onEdit={() => { setSelectedStoreId(store.id); setEditing(true); }} onOpen={() => window.open(`${base}/?store=${store.slug}`, '_blank')} />)}</div></section>}

          {tab === 'catalog' && <section><PageHeading eyebrow="02 / Content" title={t.catalog} action={<button type="button" onClick={() => setNotice(lang === 'ar' ? 'إضافة منتج جديدة متاحة في النسخة التالية.' : 'Product creation is ready for the next workspace step.')} className="inline-flex items-center gap-2 rounded-2xl bg-[#d9ff58] px-4 py-3 text-xs font-black text-[#11140d]"><Plus className="h-4 w-4" />{lang === 'ar' ? 'إضافة منتج' : lang === 'fr' ? 'Ajouter' : 'Add product'}</button>} /><div className="mb-5 flex flex-wrap items-center gap-3 rounded-3xl border border-black/8 bg-white p-5"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d9ff58] text-lg font-black text-[#11140d]">{current.logoMark}</div><div><div className="font-black">{current.name}</div><div className="text-xs text-black/45">{industryNames[current.industry][lang]} · {current.productsCount} {t.products}</div></div><div className="ms-auto"><a href={storefront} className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs font-bold">{t.open}<ExternalLink className="h-3 w-3" /></a></div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{PRODUCTS.slice(0, 6).map((product) => <div key={product.id} className="flex gap-3 rounded-2xl border border-black/8 bg-white p-3"><img src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{lang === 'ar' ? product.name : product.nameEn}</div><div className="mt-1 text-xs text-black/45">{product.price} DA · {product.isAvailable ? t.live : t.draft}</div><button type="button" onClick={() => setNotice(`${t.edit}: ${product.name}`)} className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-black/55"><Pencil className="h-3 w-3" />{t.edit}</button></div></div>)}</div></section>}

          {tab === 'qr' && <section><PageHeading eyebrow="03 / Distribution" title={t.qr} action={<button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-[#172018] px-4 py-3 text-xs font-bold text-white"><QrCode className="h-4 w-4" />{t.print}</button>} /><div className="mb-6 rounded-3xl border border-[#d9ff58]/30 bg-[#e9f6c7] p-5 text-sm text-[#39451d]"><strong>{t.qrText}</strong><p className="mt-1 opacity-70">{t.qrHint}</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{stores.map((store) => { const url = `${window.location.origin}${base}/?store=${store.slug}`; return <div key={store.id} className="rounded-3xl border border-black/8 bg-white p-5 text-center"><div className="text-start"><div className="text-sm font-black">{store.name}</div><div className="mt-1 text-xs text-black/45">showly / {store.slug}</div></div><div className="mx-auto my-5 w-fit rounded-2xl bg-white p-3 shadow-[0_8px_25px_rgba(0,0,0,.08)]"><QRCodeSVG value={url} size={170} level="M" includeMargin /></div><div className="flex items-center justify-center gap-2 text-xs text-black/45"><button type="button" onClick={() => navigator.clipboard?.writeText(url).then(() => setNotice(lang === 'ar' ? 'تم نسخ رابط QR.' : 'QR link copied.'))} className="rounded-xl border border-black/10 px-3 py-2 font-bold">{lang === 'ar' ? 'نسخ الرابط' : lang === 'fr' ? 'Copier' : 'Copy link'}</button><a href={url} target="_blank" rel="noreferrer" className="rounded-xl bg-[#172018] px-3 py-2 font-bold text-white">{t.open}</a></div></div>; })}</div></section>}

          {tab === 'analytics' && <section><PageHeading eyebrow="04 / Signals" title={t.analytics} action={<div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800"><TrendingUp className="h-3.5 w-3.5" />+24.8% engagement</div>} /><div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><div className="rounded-3xl border border-black/8 bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><div className="text-sm font-black">{t.monthlyViews}</div><div className="mt-2 text-4xl font-black">{totalViews.toLocaleString()}</div></div><div className="rounded-2xl bg-[#d9ff58] p-3"><BarChart3 className="h-5 w-5" /></div></div><div className="mt-10 flex h-44 items-end gap-2">{[42, 58, 47, 68, 62, 79, 72, 88, 81, 94, 86, 100].map((height, index) => <div key={index} className="group flex flex-1 flex-col justify-end gap-2"><div className="rounded-t-xl bg-[#d9ff58] transition group-hover:bg-[#172018]" style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] text-black/30"><span>01</span><span>07</span><span>14</span><span>21</span><span>30</span></div></div><div className="rounded-3xl border border-black/8 bg-[#172018] p-5 text-white sm:p-7"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d9ff58] text-[#11140d]"><Users className="h-5 w-5" /></div><div className="mt-10 text-5xl font-black">{Math.round((totalInteractions / totalViews) * 100)}%</div><div className="mt-2 text-sm text-white/50">{t.interactions} / {t.monthlyViews}</div><div className="mt-8 border-t border-white/10 pt-4 text-xs leading-6 text-white/45">{lang === 'ar' ? 'إحصائيات أولية قابلة للتوسع مع زيارات المنتجات والنقر على WhatsApp والمشاركة.' : 'A lightweight foundation for product views, WhatsApp clicks, and share events.'}</div></div></div><div className="mt-6 rounded-3xl border border-black/8 bg-white p-5 sm:p-7"><h3 className="text-lg font-black">{t.recent}</h3><div className="mt-5 grid gap-3 md:grid-cols-3">{stores.map((store) => { const metrics = metricsFor(store); return <div key={store.id} className="rounded-2xl bg-[#f4f5f2] p-4"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-black">{store.name}</span><span className="text-xs font-bold text-emerald-700">+{Math.round(metrics.interactions / Math.max(metrics.views, 1) * 100)}%</span></div><div className="mt-3 flex justify-between text-xs text-black/40"><span>{metrics.views.toLocaleString()} {t.views}</span><span>{metrics.interactions} {t.engagement}</span></div></div>; })}</div></div></section>}

          {editing && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="w-full max-w-lg rounded-t-[2rem] bg-white p-6 sm:rounded-[2rem]"><div className="flex items-center justify-between"><h3 className="text-xl font-black">{t.manage}</h3><button type="button" onClick={() => setEditing(false)} className="grid h-9 w-9 place-items-center rounded-full bg-black/5"><X className="h-4 w-4" /></button></div><div className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-xs font-bold text-black/50">{t.storeName}</span><input value={current.name} onChange={(event) => updateCurrent({ name: event.target.value })} className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none focus:border-black" /></label><label className="block"><span className="mb-2 block text-xs font-bold text-black/50">{t.city}</span><input value={current.city} onChange={(event) => updateCurrent({ city: event.target.value })} className="w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none focus:border-black" /></label><label className="flex items-center justify-between rounded-xl border border-black/10 p-4"><span><span className="block text-sm font-bold">{t.published}</span><small className="text-xs text-black/45">{current.isPublished ? t.live : t.draft}</small></span><button type="button" onClick={() => updateCurrent({ isPublished: !current.isPublished })} aria-label={t.published}>{current.isPublished ? <ToggleRight className="h-8 w-8 text-emerald-600" /> : <ToggleLeft className="h-8 w-8 text-black/30" />}</button></label></div><div className="mt-7 flex gap-3"><button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-sm font-bold">{t.cancel}</button><button type="button" onClick={showSaved} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#172018] px-4 py-3 text-sm font-bold text-white"><Save className="h-4 w-4" />{t.save}</button></div></div></div>}
        </div>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: typeof Store; label: string; value: string; accent: string }) { return <div className="rounded-3xl border border-black/8 bg-white p-5"><div className={`grid h-10 w-10 place-items-center rounded-xl ${accent}`}><Icon className="h-4 w-4" /></div><div className="mt-6 text-3xl font-black">{value}</div><div className="mt-1 text-xs text-black/45">{label}</div></div>; }
function PageHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) { return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-xs font-black uppercase tracking-[.25em] text-black/35">{eyebrow}</span><h2 className="mt-3 text-4xl font-black tracking-[-.06em] sm:text-6xl">{title}</h2></div>{action}</div>; }
function StoreRow({ store, lang, t, selected, onSelect, onOpen }: { store: ShowlyStore; lang: 'ar' | 'fr' | 'en'; t: Record<string, string>; selected: boolean; onSelect: () => void; onOpen: () => void }) { return <div className={`flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${selected ? 'border-[#b9d84f] bg-[#fbfff0]' : 'border-black/8 bg-[#fafaf8]'}`}><button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-start"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black" style={{ background: store.accent }}>{store.logoMark}</span><span className="min-w-0"><span className="block truncate text-sm font-black">{store.name}</span><span className="block text-xs text-black/40">{store.city} · {store.productsCount} {t.products}</span></span></button><div className="flex items-center gap-4 text-xs text-black/45"><span><strong className="text-black">{store.views.toLocaleString()}</strong> {t.views}</span><span><strong className="text-black">{store.interactions}</strong> {t.engagement}</span><button type="button" onClick={onOpen} className="rounded-xl bg-[#172018] px-3 py-2 font-bold text-white">{t.open}</button></div></div>; }
function StoreCard({ store, lang, t, selected, onSelect, onEdit, onOpen }: { store: ShowlyStore; lang: 'ar' | 'fr' | 'en'; t: Record<string, string>; selected: boolean; onSelect: () => void; onEdit: () => void; onOpen: () => void }) { return <article className={`overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-xl ${selected ? 'border-[#b9d84f]' : 'border-black/8'}`}><div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg, rgba(12,15,11,.8), transparent 70%), url(${store.coverImage})` }}><span className="absolute bottom-4 start-4 grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-black">{store.logoMark}</span><span className="absolute end-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-black">{store.isPublished ? t.live : t.draft}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-black">{store.name}</h3><p className="mt-1 text-xs text-black/45">{store.city} · {industryNames[store.industry][lang]}</p></div><button type="button" onClick={onEdit} className="grid h-9 w-9 place-items-center rounded-xl bg-black/5 text-black/50 hover:bg-black/10" aria-label={t.edit}><Pencil className="h-4 w-4" /></button></div><div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-[#f5f6f1] p-2"><div className="text-sm font-black">{store.views.toLocaleString()}</div><div className="text-[10px] text-black/40">{t.views}</div></div><div className="rounded-xl bg-[#f5f6f1] p-2"><div className="text-sm font-black">{store.interactions}</div><div className="text-[10px] text-black/40">{t.engagement}</div></div><div className="rounded-xl bg-[#f5f6f1] p-2"><div className="text-sm font-black">{store.productsCount}</div><div className="text-[10px] text-black/40">{t.products}</div></div></div><div className="mt-5 flex gap-2"><button type="button" onClick={onSelect} className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-xs font-bold">{t.manage}</button><button type="button" onClick={onOpen} className="inline-flex items-center gap-1 rounded-xl bg-[#172018] px-3 py-2 text-xs font-bold text-white">{t.visit}<ExternalLink className="h-3 w-3" /></button></div></div></article>; }
