import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Share2,
  Star,
  X,
} from 'lucide-react';
import { CATEGORIES, PRODUCTS, RESTAURANT_TABLES, SHOWLY_PRODUCTS } from '../data/mockData';
import { Product, ShowlyStore } from '../types';
import { trackShowlyEvent } from '../utils/showlyAnalytics';

type Language = 'ar' | 'fr' | 'en';

const labels = {
  ar: { catalog: 'الكتالوج', discover: 'اكتشف المنتجات', search: 'ابحث في الكتالوج...', all: 'الكل', details: 'التفاصيل', contact: 'تواصل عبر WhatsApp', available: 'متوفر الآن', unavailable: 'غير متوفر حالياً', specs: 'التفاصيل والمواصفات', ingredients: 'المكونات / المواصفات', share: 'مشاركة', save: 'حفظ', table: 'الطاولة', tableFromQr: 'من QR', chooseTable: 'اختر الطاولة', admin: 'الإدارة', back: 'العودة إلى Showly', viewAll: 'عرض الكل', featured: 'مختارات مميزة', quick: 'تجربة سريعة وسهلة', custom: 'مصمم لهويتك', noResults: 'لم نجد نتائج مطابقة.' },
  fr: { catalog: 'Catalogue', discover: 'Découvrez les produits', search: 'Rechercher dans le catalogue...', all: 'Tout', details: 'Détails', contact: 'Contacter via WhatsApp', available: 'Disponible', unavailable: 'Indisponible', specs: 'Détails et caractéristiques', ingredients: 'Composition / caractéristiques', share: 'Partager', save: 'Enregistrer', table: 'Table', tableFromQr: 'via QR', chooseTable: 'Choisir une table', admin: 'Administration', back: 'Retour à Showly', viewAll: 'Voir tout', featured: 'Sélection', quick: 'Simple et rapide', custom: 'À votre image', noResults: 'Aucun résultat.' },
  en: { catalog: 'Catalog', discover: 'Explore the products', search: 'Search the catalog...', all: 'All', details: 'Details', contact: 'Contact on WhatsApp', available: 'Available now', unavailable: 'Currently unavailable', specs: 'Details & specifications', ingredients: 'Ingredients / specifications', share: 'Share', save: 'Save', table: 'Table', tableFromQr: 'via QR', chooseTable: 'Choose table', admin: 'Admin', back: 'Back to Showly', viewAll: 'View all', featured: 'Featured picks', quick: 'Fast and easy', custom: 'Made for your brand', noResults: 'No matching results.' },
} as const;

const categoryLabels = {
  ar: { fashion: 'أزياء', accessories: 'إكسسوارات', shoes: 'أحذية', seating: 'جلسات', tables: 'طاولات', lighting: 'إضاءة', decor: 'ديكور', crepes: 'كريب ووافل', bakery: 'كرواسون ومخبوزات', desserts: 'حلويات فاخرة', coffee: 'قهوة مختصة', juices: 'عصائر وموكتيلات' },
  fr: { fashion: 'Mode', accessories: 'Accessoires', shoes: 'Chaussures', seating: 'Assises', tables: 'Tables', lighting: 'Luminaires', decor: 'Décoration', crepes: 'Crêpes & gaufres', bakery: 'Boulangerie', desserts: 'Desserts', coffee: 'Café', juices: 'Boissons' },
  en: { fashion: 'Fashion', accessories: 'Accessories', shoes: 'Footwear', seating: 'Seating', tables: 'Tables', lighting: 'Lighting', decor: 'Decor', crepes: 'Crepes & waffles', bakery: 'Bakery', desserts: 'Desserts', coffee: 'Coffee', juices: 'Drinks' },
} as const;

const industryLabel = {
  cafe: { ar: 'مقهى', fr: 'Café', en: 'Café' },
  restaurant: { ar: 'مطعم', fr: 'Restaurant', en: 'Restaurant' },
  bakery: { ar: 'مخبزة', fr: 'Boulangerie', en: 'Bakery' },
  retail: { ar: 'متجر', fr: 'Commerce', en: 'Retail' },
  fashion: { ar: 'أزياء', fr: 'Mode', en: 'Fashion' },
  beauty: { ar: 'تجميل', fr: 'Beauté', en: 'Beauty' },
  furniture: { ar: 'أثاث', fr: 'Mobilier', en: 'Furniture' },
  electronics: { ar: 'إلكترونيات', fr: 'Électronique', en: 'Electronics' },
  services: { ar: 'خدمات', fr: 'Services', en: 'Services' },
} as const;

export function ShowlyStorefront({ store }: { store: ShowlyStore }) {
  const [lang, setLang] = useState<Language>('ar');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const params = new URLSearchParams(window.location.search);
  const tableId = params.get('table');
  const table = RESTAURANT_TABLES.find((item) => item.id === tableId);
  const t = labels[lang];
  const isAr = lang === 'ar';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const storeProducts = SHOWLY_PRODUCTS[store.slug] || PRODUCTS;
  const storeCategories = Array.from(new Set(storeProducts.map((product) => product.category))).map((id) => {
    const source = CATEGORIES.find((category) => category.id === id);
    const fallback = categoryLabels[lang][id as keyof typeof categoryLabels.ar];
    return { id, label: source ? (lang === 'ar' ? source.name : source.nameEn) : fallback || id };
  });

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.title = `${store.nameEn} — Showly`;
    trackShowlyEvent(store.slug, 'store_view');
  }, [isAr, lang, store.nameEn, store.slug, store.views]);

  const filteredProducts = useMemo(() => storeProducts.filter((product) => {
    const matchesQuery = `${product.name} ${product.nameEn} ${product.shortDesc}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesQuery && matchesCategory;
  }), [activeCategory, query, storeProducts]);

  const openWhatsApp = (product?: Product) => {
    trackShowlyEvent(store.slug, 'whatsapp_click');
    const message = product ? `Bonjour, je suis intéressé(e) par ${product.nameEn} (${product.price} DA).` : `Bonjour ${store.nameEn}, je souhaite découvrir votre catalogue.`;
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const shareStore = async () => {
    trackShowlyEvent(store.slug, 'share_click');
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: store.nameEn, text: store.descriptionEn, url });
    else await navigator.clipboard?.writeText(url);
  };

  useEffect(() => {
    if (selectedProduct) trackShowlyEvent(store.slug, 'product_view');
  }, [selectedProduct, store.slug]);

  const productName = (product: Product) => lang === 'ar' ? product.name : product.nameEn;
  const productDescription = (product: Product) => lang === 'ar' ? product.shortDesc : product.fullDesc;

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#161716]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f5f4ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href={`${base}/`} className="flex shrink-0 items-center gap-2.5" aria-label={t.back}><span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-black text-[#11140d]" style={{ background: store.accent }}>{store.logoMark}</span><span className="hidden sm:block"><strong className="block text-sm tracking-tight">{lang === 'ar' ? store.name : store.nameEn}</strong><small className="block text-[10px] text-black/45">{industryLabel[store.industry][lang]}</small></span></a>
          <div className="flex items-center gap-1.5"><button type="button" onClick={shareStore} className="hidden rounded-full p-2 text-black/50 transition hover:bg-black/5 hover:text-black sm:block" aria-label={t.share}><Share2 className="h-4 w-4" /></button>{(['ar', 'fr', 'en'] as Language[]).map((item) => <button key={item} type="button" onClick={() => setLang(item)} className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item === lang ? 'bg-black text-white' : 'text-black/35 hover:text-black'}`}>{item}</button>)}</div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 sm:pt-8">
          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] bg-[#191b19] text-white sm:min-h-[490px]" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,10,8,.94) 0%, rgba(8,10,8,.54) 52%, rgba(8,10,8,.1) 100%), url(${store.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.22),transparent_28%)]" />
            <div className="relative flex min-h-[430px] max-w-2xl flex-col justify-between p-7 sm:min-h-[490px] sm:p-12">
              <div className="flex items-start justify-between gap-4"><div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs backdrop-blur-md"><span className="h-2 w-2 rounded-full bg-emerald-300" />{store.isPublished ? t.available : t.unavailable}</div><div className="rounded-2xl border border-white/15 bg-black/20 px-3 py-2 text-end backdrop-blur-md"><div className="text-lg font-black">{store.isPublished ? '4.9' : '—'} <Star className="inline h-3.5 w-3.5 fill-current text-amber-300" /></div><div className="text-[10px] text-white/55">Showly verified</div></div></div>
              <div><div className="mb-5 flex flex-wrap gap-2"><span className="rounded-full px-3 py-1.5 text-[11px] font-bold text-[#11140d]" style={{ background: store.accent }}>{industryLabel[store.industry][lang]}</span>{table && <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">{t.table} {table.id} {t.tableFromQr}</span>}</div><h1 className="max-w-xl text-5xl font-black leading-[.95] tracking-[-.06em] sm:text-7xl">{lang === 'ar' ? store.name : store.nameEn}</h1><p className="mt-5 max-w-lg text-base leading-7 text-white/65 sm:text-lg">{lang === 'ar' ? store.description : lang === 'fr' ? store.descriptionFr : store.descriptionEn}</p><div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/55"><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{lang === 'ar' ? store.city : store.cityEn}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{t.quick}</span><button type="button" onClick={() => openWhatsApp()} className="inline-flex items-center gap-1.5 font-bold text-white transition hover:text-[#d9ff58]"><MessageCircle className="h-3.5 w-3.5" />{t.contact}</button></div></div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><span className="text-xs font-black uppercase tracking-[.24em] text-black/35">{t.catalog}</span><h2 className="mt-2 text-4xl font-black tracking-[-.05em] sm:text-5xl">{t.discover}</h2></div><div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/65 px-3 py-2.5 sm:min-w-[270px]"><Search className="h-4 w-4 text-black/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="w-full bg-transparent text-sm outline-none placeholder:text-black/30" aria-label={t.search} /></div></div>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{[{ id: 'all', label: t.all }, ...storeCategories].map((category) => <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${activeCategory === category.id ? 'border-black bg-black text-white' : 'border-black/10 bg-white/50 text-black/55 hover:border-black/30 hover:text-black'}`}>{category.label}</button>)}</div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product, index) => <article key={product.id} className="group overflow-hidden rounded-[1.6rem] border border-black/8 bg-white shadow-[0_10px_35px_rgba(26,25,18,.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(26,25,18,.12)]" role="button" tabIndex={0} onClick={() => setSelectedProduct(product)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedProduct(product); }}><div className="block w-full text-start"><div className="relative aspect-[1.14] overflow-hidden bg-black/5"><img src={product.image} alt={productName(product)} loading={index < 3 ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2"><span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold backdrop-blur">{product.badge || t.featured}</span><button type="button" onClick={(event) => { event.stopPropagation(); setSaved((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id]); }} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-black/45 backdrop-blur hover:text-rose-500" aria-label={t.save}><Heart className={`h-4 w-4 ${saved.includes(product.id) ? 'fill-current text-rose-500' : ''}`} /></button></div></div><div className="p-5"><div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-lg font-black leading-tight">{productName(product)}</h3><span className="shrink-0 text-sm font-black">{product.price} <small className="text-[10px] font-bold text-black/40">DA</small></span></div><p className="line-clamp-2 text-sm leading-6 text-black/50">{productDescription(product)}</p><div className="mt-4 flex items-center justify-between text-[11px] text-black/40"><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{product.rating} ({product.reviewsCount})</span><span className="font-bold text-black/55">{t.details} <ArrowLeft className="inline h-3 w-3" /></span></div></div></div></article>)}</div>
          {filteredProducts.length === 0 && <div className="rounded-3xl border border-dashed border-black/15 py-16 text-center text-black/45">{t.noResults}</div>}
        </section>
      </main>

      {selectedProduct && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={productName(selectedProduct)}><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-[#f8f7f2] sm:rounded-[2rem]"><div className="relative aspect-[1.8] overflow-hidden sm:aspect-[2.2]"><img src={selectedProduct.image} alt={productName(selectedProduct)} className="h-full w-full object-cover" /><button type="button" onClick={() => setSelectedProduct(null)} className="absolute end-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur" aria-label="Close"><X className="h-5 w-5" /></button></div><div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-5"><div><span className="text-xs font-bold text-black/40">{t.details}</span><h2 className="mt-2 text-3xl font-black tracking-tight">{productName(selectedProduct)}</h2></div><div className="text-end text-2xl font-black">{selectedProduct.price}<small className="ms-1 text-xs text-black/40">DA</small></div></div><p className="mt-5 text-base leading-8 text-black/60">{productDescription(selectedProduct)}</p><div className="mt-7 rounded-2xl border border-black/8 bg-white/70 p-4"><h3 className="text-sm font-black">{t.specs}</h3><p className="mt-3 text-sm leading-7 text-black/55">{selectedProduct.ingredients.join(' • ')}</p></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => openWhatsApp(selectedProduct)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#11140d] px-5 py-4 font-bold text-white transition hover:bg-black"><MessageCircle className="h-4 w-4 text-[#d9ff58]" />{t.contact}</button><button type="button" onClick={shareStore} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 px-5 py-4 font-bold text-black/70 transition hover:border-black/30"><Share2 className="h-4 w-4" />{t.share}</button></div></div></div></div>}
      <footer className="border-t border-black/10 bg-[#ebeae4] px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-black/40 sm:flex-row sm:items-center sm:justify-between"><span>Powered by <strong className="text-black">Showly</strong></span><div className="flex items-center gap-4"><a href={`${base}/admin`} className="hover:text-black">{t.admin}</a><span>{store.slug}</span></div></div></footer>
    </div>
  );
}
