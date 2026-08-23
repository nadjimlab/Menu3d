import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Grid2X2, Heart, MessageCircle, Minus, Plus, Share2, ShoppingBag, X } from 'lucide-react';
import { PRODUCTS, RESTAURANT_TABLES, SHOWLY_PRODUCTS } from '../data/mockData';
import { Product, ShowlyStore } from '../types';
import { trackShowlyEvent } from '../utils/showlyAnalytics';

type Language = 'ar' | 'fr' | 'en';
type Direction = 1 | -1;
type CartLine = { product: Product; quantity: number };

const labels = {
  ar: { share: 'مشاركة المتجر', contact: 'تواصل مع المتجر', catalog: 'فتح كل المنتجات', cart: 'السلة', close: 'إغلاق', previous: 'المنتج السابق', next: 'المنتج التالي', save: 'حفظ المنتج', back: 'العودة إلى Showly', empty: 'السلة فارغة', emptyText: 'أضف المنتجات التي تريد طلبها.', total: 'الإجمالي', confirm: 'تأكيد الطلب عبر WhatsApp', customer: 'الاسم (اختياري)', note: 'ملاحظة للمتجر (اختياري)', sent: 'تم تجهيز طلبك', sentText: 'أرسلنا ملخص الطلب إلى WhatsApp. أكمل المحادثة مع المتجر لتأكيد التفاصيل.', continue: 'متابعة التصفح', quantity: 'الكمية' },
  fr: { share: 'Partager la boutique', contact: 'Contacter la boutique', catalog: 'Voir tous les produits', cart: 'Panier', close: 'Fermer', previous: 'Produit précédent', next: 'Produit suivant', save: 'Enregistrer le produit', back: 'Retour à Showly', empty: 'Panier vide', emptyText: 'Ajoutez les produits que vous souhaitez commander.', total: 'Total', confirm: 'Confirmer via WhatsApp', customer: 'Nom (facultatif)', note: 'Note pour la boutique (facultatif)', sent: 'Commande préparée', sentText: 'Le récapitulatif a été préparé pour WhatsApp. Finalisez la conversation avec la boutique.', continue: 'Continuer', quantity: 'Quantité' },
  en: { share: 'Share store', contact: 'Contact store', catalog: 'Open all products', cart: 'Cart', close: 'Close', previous: 'Previous product', next: 'Next product', save: 'Save product', back: 'Back to Showly', empty: 'Your cart is empty', emptyText: 'Add the products you want to order.', total: 'Total', confirm: 'Confirm via WhatsApp', customer: 'Name (optional)', note: 'Note for the store (optional)', sent: 'Order prepared', sentText: 'Your order summary was prepared for WhatsApp. Continue the conversation with the store to confirm details.', continue: 'Continue browsing', quantity: 'Quantity' },
} as const;

const variants = {
  enter: (direction: Direction) => ({ opacity: 0, scale: 1.08, x: direction > 0 ? 70 : -70 }),
  center: { opacity: 1, scale: 1, x: 0 },
  exit: (direction: Direction) => ({ opacity: 0, scale: 0.94, x: direction > 0 ? -70 : 70 }),
};

export function ShowlyExperienceViewer({ store }: { store: ShowlyStore }) {
  const [lang, setLang] = useState<Language>('ar');
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const t = labels[lang];
  const isAr = lang === 'ar';
  const products = useMemo(() => SHOWLY_PRODUCTS[store.slug] || PRODUCTS, [store.slug]);
  const product = products[index] || products[0];
  const tableId = new URLSearchParams(window.location.search).get('table');
  const table = RESTAURANT_TABLES.find((item) => item.id === tableId);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.title = `${store.nameEn} — Showly`;
    trackShowlyEvent(store.slug, 'store_view');
  }, [isAr, lang, store.nameEn, store.slug]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') move(1);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') move(-1);
      if (event.key === 'Escape') {
        setShowCatalog(false);
        setShowCart(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const move = (nextDirection: Direction) => {
    setDirection(nextDirection);
    setIndex((current) => (current + nextDirection + products.length) % products.length);
    trackShowlyEvent(store.slug, 'product_view');
  };

  const chooseProduct = (nextIndex: number) => {
    setDirection(nextIndex >= index ? 1 : -1);
    setIndex(nextIndex);
    setShowCatalog(false);
    trackShowlyEvent(store.slug, 'product_view');
  };

  const addToCart = (item: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === item.id);
      if (existing) return current.map((line) => line.product.id === item.id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { product: item, quantity: 1 }];
    });
    trackShowlyEvent(store.slug, 'cart_add');
  };

  const changeQuantity = (productId: string, delta: number) => {
    setCart((current) => current.flatMap((line) => {
      if (line.product.id !== productId) return [line];
      const quantity = line.quantity + delta;
      return quantity > 0 ? [{ ...line, quantity }] : [];
    }));
  };

  const openCart = () => {
    setShowCart(true);
    setConfirmed(false);
    trackShowlyEvent(store.slug, 'cart_open');
  };

  const productName = (item: Product) => lang === 'ar' ? item.name : item.nameEn;
  const storeName = lang === 'ar' ? store.name : store.nameEn;

  const shareStore = async () => {
    trackShowlyEvent(store.slug, 'share_click');
    if (navigator.share) await navigator.share({ title: store.nameEn, text: store.descriptionEn, url: window.location.href });
    else await navigator.clipboard?.writeText(window.location.href);
  };

  const openWhatsApp = () => {
    trackShowlyEvent(store.slug, 'whatsapp_click');
    const message = `Bonjour ${store.nameEn}, je suis intéressé(e) par ${productName(product)} (${product.price} DA).`;
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const confirmOrder = () => {
    const lines = cart.map((line) => `• ${line.quantity} × ${productName(line.product)} — ${line.product.price * line.quantity} DA`).join('\n');
    const order = [`Bonjour ${store.nameEn}, je souhaite confirmer cette commande :`, lines, `Total : ${cartTotal} DA`, table ? `Table : ${table.id}` : '', customerName ? `Nom : ${customerName}` : '', orderNote ? `Note : ${orderNote}` : ''].filter(Boolean).join('\n');
    trackShowlyEvent(store.slug, 'order_confirmed');
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(order)}`, '_blank', 'noopener,noreferrer');
    setConfirmed(true);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;
    pointerStart.current = null;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 36) return;
    if (Math.abs(deltaX) >= Math.abs(deltaY)) move(deltaX < 0 ? 1 : -1);
    else move(deltaY < 0 ? 1 : -1);
  };

  return (
    <main className="relative h-[100svh] min-h-[620px] overflow-hidden bg-[#070808] text-white" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null; }} style={{ touchAction: 'none' }}>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div key={product.id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.48, ease: [0.23, 1, 0.32, 1] }} className="absolute inset-0">
          <img src={product.image} alt={productName(product)} className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,5,5,.68)_0%,rgba(4,5,5,.02)_32%,rgba(4,5,5,.08)_52%,rgba(4,5,5,.9)_100%)]" />
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 42%, ${product.palette.ambientGlow}, transparent 42%)`, mixBlendMode: 'screen' }} />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-7">
        <header className="pointer-events-auto flex items-start justify-between gap-3">
          <a href={`${base}/`} aria-label={t.back} className="flex items-center gap-2.5 rounded-full border border-white/15 bg-black/20 px-2.5 py-2 backdrop-blur-xl transition hover:bg-black/40"><span className="grid h-9 w-9 place-items-center rounded-full text-xs font-black text-[#11140d]" style={{ background: store.accent }}>{store.logoMark}</span><span className="hidden max-w-[170px] truncate text-sm font-bold sm:block">{storeName}</span></a>
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 p-1 backdrop-blur-xl">
            <button type="button" onClick={shareStore} className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white" aria-label={t.share}><Share2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => setShowCatalog(true)} className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white" aria-label={t.catalog}><Grid2X2 className="h-4 w-4" /></button>
            <button type="button" onClick={openCart} className="relative grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white" aria-label={t.cart}><ShoppingBag className="h-4 w-4" />{cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d9ff58] px-1 text-[9px] font-black text-black">{cartCount}</span>}</button>
            {(['ar', 'fr', 'en'] as Language[]).map((item) => <button key={item} type="button" onClick={() => setLang(item)} className={`grid h-8 w-8 place-items-center rounded-full text-[10px] font-black uppercase transition ${lang === item ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>{item}</button>)}
          </div>
        </header>

        <div className="flex items-center justify-center"><div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-bold tracking-[.18em] text-white/75 backdrop-blur-xl"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d9ff58]" />{String(index + 1).padStart(2, '0')} <span className="text-white/30">/</span> {String(products.length).padStart(2, '0')}</div></div>

        <div className="pointer-events-auto flex items-end justify-between gap-4">
          <div className="max-w-xl" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold"><span className="rounded-full bg-white/90 px-3 py-1.5 text-black">{product.badge || 'Showly'}</span>{table && <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-white/80 backdrop-blur-md">{table.label}</span>}</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${product.id}-${lang}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <h1 className="max-w-2xl text-4xl font-black leading-[.98] tracking-[-.055em] drop-shadow-2xl sm:text-6xl">{productName(product)}</h1>
                <div className="mt-4 flex items-end gap-4"><span className="text-2xl font-black text-[#d9ff58] drop-shadow-lg sm:text-3xl">{product.price} <small className="text-xs text-white/65">DA</small></span></div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <button type="button" onClick={() => setSaved((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id])} className={`grid h-12 w-12 place-items-center rounded-full border border-white/20 backdrop-blur-xl transition hover:scale-105 ${saved.includes(product.id) ? 'bg-rose-500 text-white' : 'bg-black/25 text-white/75'}`} aria-label={t.save}><Heart className={`h-5 w-5 ${saved.includes(product.id) ? 'fill-current' : ''}`} /></button>
            <button type="button" onClick={() => addToCart(product)} className="grid h-12 w-12 place-items-center rounded-full bg-[#d9ff58] text-[#11140d] shadow-[0_8px_35px_rgba(217,255,88,.25)] transition hover:scale-105" aria-label={t.cart}><ShoppingBag className="h-5 w-5" /></button>
            <button type="button" onClick={openWhatsApp} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/25 text-white/80 backdrop-blur-xl transition hover:scale-105" aria-label={t.contact}><MessageCircle className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2 sm:bottom-7">
        <button type="button" onClick={() => move(-1)} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/25 text-white/70 backdrop-blur-xl transition hover:bg-black/45 hover:text-white" aria-label={t.previous}><ArrowRight className="h-4 w-4" /></button>
        <div className="flex max-w-[42vw] items-center gap-1.5 overflow-hidden rounded-full border border-white/15 bg-black/20 px-3 py-2 backdrop-blur-xl">{products.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => chooseProduct(itemIndex)} aria-label={productName(item)} className={`h-1.5 rounded-full transition-all ${itemIndex === index ? 'w-7 bg-[#d9ff58]' : 'w-1.5 bg-white/45 hover:bg-white'}`} />)}</div>
        <button type="button" onClick={() => move(1)} className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/25 text-white/70 backdrop-blur-xl transition hover:bg-black/45 hover:text-white" aria-label={t.next}><ArrowLeft className="h-4 w-4" /></button>
      </div>

      <AnimatePresence>
        {showCatalog && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 overflow-y-auto bg-[#080909]/95 p-5 backdrop-blur-2xl" style={{ touchAction: 'auto' }}><div className="mx-auto max-w-5xl"><div className="mb-7 flex items-center justify-between"><div><span className="text-[10px] font-bold uppercase tracking-[.3em] text-[#d9ff58]">Showly</span><h2 className="mt-2 text-3xl font-black">{storeName}</h2></div><button type="button" onClick={() => setShowCatalog(false)} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white" aria-label={t.close}><X className="h-5 w-5" /></button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => chooseProduct(itemIndex)} className={`group relative aspect-[.82] overflow-hidden rounded-[1.4rem] border text-start transition hover:-translate-y-1 ${itemIndex === index ? 'border-[#d9ff58]' : 'border-white/10'}`}><img src={item.image} alt={productName(item)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" /><div className="absolute inset-x-3 bottom-3"><span className="text-xs font-bold text-white">{productName(item)}</span><span className="mt-1 block text-sm font-black text-[#d9ff58]">{item.price} DA</span></div></button>)}</div></div></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {showCart && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-end justify-center bg-black/60 p-0 backdrop-blur-md sm:items-center sm:p-6" style={{ touchAction: 'auto' }}><motion.div initial={{ y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 35, opacity: 0 }} onPointerDown={(event) => event.stopPropagation()} className="max-h-[92svh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-[#f8f8f3] p-5 text-[#151614] sm:rounded-[2rem] sm:p-7" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-[.25em] text-black/35">Showly</span><h2 className="mt-2 text-3xl font-black">{t.cart} <span className="text-base text-black/35">({cartCount})</span></h2></div><button type="button" onClick={() => setShowCart(false)} className="grid h-10 w-10 place-items-center rounded-full bg-black/5 text-black/55" aria-label={t.close}><X className="h-5 w-5" /></button></div>
          {confirmed ? <div className="py-14 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div><h3 className="mt-5 text-2xl font-black">{t.sent}</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-black/55">{t.sentText}</p><button type="button" onClick={() => setShowCart(false)} className="mt-7 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white">{t.continue}</button></div> : cart.length === 0 ? <div className="py-16 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-black/20" /><h3 className="mt-4 text-lg font-black">{t.empty}</h3><p className="mt-2 text-sm text-black/45">{t.emptyText}</p></div> : <><div className="mt-7 space-y-3">{cart.map((line) => <div key={line.product.id} className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white p-3"><img src={line.product.image} alt={productName(line.product)} className="h-16 w-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-black">{productName(line.product)}</h3><p className="mt-1 text-xs font-bold text-black/45">{line.product.price} DA</p></div><div className="flex items-center gap-2 rounded-xl bg-black/5 p-1"><button type="button" onClick={() => changeQuantity(line.product.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg bg-white text-black/60" aria-label={`${t.quantity} -`}><Minus className="h-3 w-3" /></button><span className="min-w-5 text-center text-sm font-black">{line.quantity}</span><button type="button" onClick={() => changeQuantity(line.product.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-black text-white" aria-label={`${t.quantity} +`}><Plus className="h-3 w-3" /></button></div></div>)}</div><div className="mt-6 space-y-3"><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder={t.customer} className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/35" /><textarea value={orderNote} onChange={(event) => setOrderNote(event.target.value)} placeholder={t.note} rows={2} className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/35" /></div><div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5"><span className="text-sm font-bold text-black/45">{t.total}</span><strong className="text-2xl font-black">{cartTotal} <small className="text-xs text-black/45">DA</small></strong></div><button type="button" onClick={confirmOrder} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#11140d] px-5 py-4 text-sm font-black text-white transition hover:bg-black"><MessageCircle className="h-4 w-4 text-[#d9ff58]" />{t.confirm}</button></>}
        </motion.div></motion.div>}
      </AnimatePresence>
    </main>
  );
}
