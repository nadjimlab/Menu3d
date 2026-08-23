import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Info,
  Sparkles,
  Star,
  Clock,
  Plus,
  Minus,
  Check,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { Product, StoreInfo, CartItem } from '../types';

interface ProductHeroProps {
  products: Product[];
  currentProductIndex: number;
  onNavigateProduct: (index: number) => void;
  onBackToDiscovery: () => void;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenCart: () => void;
  cartItems: CartItem[];
  storeInfo: StoreInfo;
  lang: 'ar' | 'en';
}

export const ProductHero: React.FC<ProductHeroProps> = ({
  products,
  currentProductIndex,
  onNavigateProduct,
  onBackToDiscovery,
  onOpenDetails,
  onAddToCart,
  onOpenCart,
  cartItems,
  storeInfo,
  lang,
}) => {
  const isAr = lang === 'ar';
  const product = products[currentProductIndex] || products[0];
  const [quantity, setQuantity] = useState<number>(1);
  const [addedJustNow, setAddedJustNow] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [showCategoryQuickBar, setShowCategoryQuickBar] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax & 3D Tilt calculations
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 180, mass: 0.8 };

  // 3D Tilt (rotateX ±3deg, rotateY ±3deg, scale 1 -> 1.02)
  const rotateX = useSpring(useTransform(pointerY, [-250, 250], [3, -3]), springConfig);
  const rotateY = useSpring(useTransform(pointerX, [-250, 250], [-3, 3]), springConfig);
  const scaleSpring = useSpring(1, springConfig);

  // Parallax Layer Movements (Phase 6):
  // 1. Background: slow (10px)
  const bgParallaxX = useSpring(useTransform(pointerX, [-250, 250], [-10, 10]), springConfig);
  const bgParallaxY = useSpring(useTransform(pointerY, [-250, 250], [-10, 10]), springConfig);

  // 2. Ambient Glow: medium (20px)
  const glowParallaxX = useSpring(useTransform(pointerX, [-250, 250], [-20, 20]), springConfig);
  const glowParallaxY = useSpring(useTransform(pointerY, [-250, 250], [-20, 20]), springConfig);

  // 3. Product: medium (30px)
  const prodParallaxX = useSpring(useTransform(pointerX, [-250, 250], [-30, 30]), springConfig);
  const prodParallaxY = useSpring(useTransform(pointerY, [-250, 250], [-30, 30]), springConfig);

  // 4. Text & Info: subtle (10px)
  const textParallaxX = useSpring(useTransform(pointerX, [-250, 250], [-10, 10]), springConfig);
  const textParallaxY = useSpring(useTransform(pointerY, [-250, 250], [-10, 10]), springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    pointerX.set(e.clientX - centerX);
    pointerY.set(e.clientY - centerY);
    scaleSpring.set(1.02);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    scaleSpring.set(1);
  };

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setAddedJustNow(false);
  }, [product.id]);

  // Touch Swipe (Vertical) Navigation Handling
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - touchStartY.current;
    const deltaX = currentX - touchStartX.current;

    // Apply subtle touch tilt effect
    pointerX.set(deltaX * 0.4);
    pointerY.set(deltaY * 0.4);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    isSwiping.current = false;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const duration = Date.now() - touchStartTime.current;

    // Reset tilt
    pointerX.set(0);
    pointerY.set(0);

    // Fast flick or clear vertical swipe threshold
    const isQuickFlick = duration < 300 && Math.abs(deltaY) > 30;
    const isSignificantDrag = Math.abs(deltaY) > 55;

    if ((isQuickFlick || isSignificantDrag) && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0 && currentProductIndex < products.length - 1) {
        // Swipe Up -> Next Product
        setSlideDirection('next');
        onNavigateProduct(currentProductIndex + 1);
      } else if (deltaY > 0 && currentProductIndex > 0) {
        // Swipe Down -> Previous Product
        setSlideDirection('prev');
        onNavigateProduct(currentProductIndex - 1);
      }
    }
  };

  // Wheel listener for desktop trackpad / mouse scroll
  const wheelLock = useRef<boolean>(false);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (wheelLock.current) return;
      if (Math.abs(e.deltaY) > 35) {
        wheelLock.current = true;
        if (e.deltaY > 0 && currentProductIndex < products.length - 1) {
          setSlideDirection('next');
          onNavigateProduct(currentProductIndex + 1);
        } else if (e.deltaY < 0 && currentProductIndex > 0) {
          setSlideDirection('prev');
          onNavigateProduct(currentProductIndex - 1);
        }
        setTimeout(() => {
          wheelLock.current = false;
        }, 400);
      }
    },
    [currentProductIndex, products.length, onNavigateProduct]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentProductIndex < products.length - 1) {
          setSlideDirection('next');
          onNavigateProduct(currentProductIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentProductIndex > 0) {
          setSlideDirection('prev');
          onNavigateProduct(currentProductIndex - 1);
        }
      } else if (e.key === 'Escape') {
        onBackToDiscovery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProductIndex, products.length, onNavigateProduct, onBackToDiscovery]);

  const handleAddClick = () => {
    // If product has custom options, open details/customization sheet
    if (product.customizationGroups && product.customizationGroups.length > 0) {
      onOpenDetails(product);
    } else {
      onAddToCart(product, quantity);
      setAddedJustNow(true);
      setTimeout(() => {
        setAddedJustNow(false);
      }, 1500);
    }
  };

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Minimal counter format: "03 / 12"
  const formattedIndex = String(currentProductIndex + 1).padStart(2, '0');
  const formattedTotal = String(products.length).padStart(2, '0');

  // Animation variants for product slide with cubic-bezier(0.22, 1, 0.36, 1)
  const slideVariants = {
    initial: (dir: 'next' | 'prev') => ({
      y: dir === 'next' ? 80 : -80,
      scale: 0.94,
      opacity: 0,
    }),
    animate: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      y: dir === 'next' ? -80 : 80,
      scale: 0.94,
      opacity: 0,
      transition: {
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="relative h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#07070a] text-neutral-100 select-none transition-colors duration-700 safe-pt safe-pb"
      style={{
        background: product.palette.gradient,
      }}
    >
      {/* LAYER 1: Dynamic Mesh Gradient Background with Parallax */}
      <motion.div
        style={{
          x: bgParallaxX,
          y: bgParallaxY,
        }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 opacity-45 mix-blend-screen transition-all duration-700"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 35%, ${product.palette.primary} 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* LAYER 2: Ambient Product Radial Glow (Parallax: 20px) */}
      <motion.div
        key={`ambient-glow-${product.id}`}
        style={{
          x: glowParallaxX,
          y: glowParallaxY,
          background: product.palette.ambientGlow,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.75, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full blur-[95px] pointer-events-none z-0"
      />

      {/* Subtle Vignette for High-End Cinema Depth */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/85 pointer-events-none z-0" />

      {/* LAYER 5: MINIMAL TOP HEADER (← Store Name 🛒 + Counter) */}
      <header className="relative z-30 flex items-center justify-between px-4 pt-2.5 pb-2">
        {/* Back to Discovery Button */}
        <button
          onClick={onBackToDiscovery}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/40 hover:bg-black/60 text-neutral-200 hover:text-white border border-white/10 backdrop-blur-xl transition-all duration-200 active:scale-95 shadow-lg"
          aria-label={isAr ? 'العودة للقائمة' : 'Back to Menu'}
          id="btn-back-discovery"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span className="text-xs font-semibold">{isAr ? 'القائمة' : 'Menu'}</span>
        </button>

        {/* Center: Store Name & Minimal Counter (03 / 12) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-xl shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-neutral-200 font-serif">
              {isAr ? storeInfo.name : storeInfo.nameEn}
            </span>
            <span className="text-neutral-500 font-mono text-[11px] px-1">•</span>
            {/* Non-intrusive Minimal Counter */}
            <span className="font-mono text-xs font-bold tracking-wider text-amber-400">
              {formattedIndex}
            </span>
            <span className="text-neutral-500 font-mono text-[10px]">/</span>
            <span className="text-neutral-400 font-mono text-[11px]">
              {formattedTotal}
            </span>
          </div>

          {/* Category Switcher Popover Pill */}
          <button
            onClick={() => setShowCategoryQuickBar((prev) => !prev)}
            className={`p-2 rounded-2xl border transition-all active:scale-95 ${
              showCategoryQuickBar
                ? 'bg-amber-500 text-neutral-950 border-amber-400'
                : 'bg-black/40 text-neutral-300 hover:text-white border-white/10 backdrop-blur-xl'
            }`}
            title={isAr ? 'تصفية حسب التصنيف' : 'Filter Categories'}
            id="btn-category-toggle"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cart Quick Access Button */}
        <button
          onClick={onOpenCart}
          className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-black/40 hover:bg-black/60 text-amber-400 border border-white/10 backdrop-blur-xl transition-all duration-200 active:scale-95 shadow-lg"
          aria-label={isAr ? 'سلة الطلب' : 'Order Cart'}
          id="btn-hero-cart"
        >
          <ShoppingBag className="w-4 h-4" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-neutral-950 shadow-md">
              {totalCartCount}
            </span>
          )}
        </button>
      </header>

      {/* Category Quick Drawer / Popover */}
      <AnimatePresence>
        {showCategoryQuickBar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 inset-x-4 z-40 max-w-md mx-auto p-2.5 rounded-2xl bg-[#121218]/95 backdrop-blur-2xl border border-white/15 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2 pb-2 text-xs text-neutral-400 font-semibold border-b border-white/10">
              <span>{isAr ? 'الانتقال السريع للأصناف' : 'Quick Jump to Product'}</span>
              <button
                onClick={() => setShowCategoryQuickBar(false)}
                className="text-neutral-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-2 max-h-48 overflow-y-auto no-scrollbar">
              {products.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onNavigateProduct(idx);
                    setShowCategoryQuickBar(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-xl text-start text-xs transition-all ${
                    idx === currentProductIndex
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
                  }`}
                >
                  <img src={p.image} alt="" className="w-6 h-6 object-contain rounded-md" />
                  <span className="truncate">{isAr ? p.name : p.nameEn}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 3 & 4: HERO PRODUCT DISPLAY (Taking 55-70% Visual Attention, object-fit: contain, 3D Tilt + Parallax) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full perspective-1000 my-auto">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={product.id}
            custom={slideDirection}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              x: prodParallaxX,
              y: prodParallaxY,
              rotateX,
              rotateY,
              scale: scaleSpring,
              transformStyle: 'preserve-3d',
            }}
            className="w-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing will-change-transform"
          >
            {/* Minimal Floating Badge, Prep Time & 3D/AR Mode Switcher */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
              className="flex items-center gap-1.5 mb-2 flex-wrap justify-center"
            >
              {product.badge && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-md flex items-center gap-1"
                  style={{
                    backgroundColor: `${product.palette.primary}25`,
                    borderColor: `${product.palette.accent}60`,
                    color: product.palette.textColor,
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{product.badge}</span>
                </span>
              )}

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[11px] text-neutral-300 backdrop-blur-md">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{product.prepTime}</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[11px] text-neutral-300 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'صورة أصلية شهية' : 'Original food photography'}</span>
              </div>
            </motion.div>

            {/* Appetite-first product photography panel */}
            <div className="relative w-full aspect-square max-h-[40dvh] sm:max-h-[44dvh] max-w-[340px] sm:max-w-[400px] flex items-center justify-center">
              <div
                className="absolute bottom-2 inset-x-8 h-8 rounded-[100%] blur-xl opacity-70 pointer-events-none transform scale-95"
                style={{ backgroundColor: '#000000' }}
              />
              <motion.div
                layoutId={`product-image-container-${product.id}`}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-full flex items-center justify-center rounded-[2rem] overflow-hidden border border-white/10 bg-black/20"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                <motion.img
                  layoutId={`product-img-${product.id}`}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  src={product.image}
                  alt={product.name}
                  className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-[0_22px_32px_rgba(0,0,0,0.75)] pointer-events-none will-change-transform"
                  style={{ transform: 'translateZ(35px)' }}
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* LAYER 6: PRODUCT INFO COMPACT GLASS PANEL (Restrained to < 25% Viewport Height) */}
      <footer className="relative z-30 w-full max-w-xl mx-auto px-4 pb-3 pt-1 space-y-2">
        {/* Swipe Feedback / Up-Down Indicator */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium">
          <ChevronUp className="w-3 h-3 text-amber-400/80 animate-bounce" />
          <span>
            {isAr ? 'اسحب للأعلى أو الأسفل للتنقل بين الأطباق' : 'Swipe up or down for next dish'}
          </span>
        </div>

        {/* Compact Glass Panel (< 25% of screen height) */}
        <motion.div
          style={{
            x: textParallaxX,
            y: textParallaxY,
          }}
          className="bg-black/70 border border-white/15 backdrop-blur-2xl p-3.5 rounded-3xl shadow-2xl space-y-2.5 transition-all duration-300"
        >
          {/* Top Row: Title, Rating, & Price */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-neutral-100 font-serif truncate leading-snug">
                {isAr ? product.name : product.nameEn}
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-300/80 line-clamp-1 font-light">
                {isAr ? product.shortDesc : product.shortDesc}
              </p>
            </div>

            {/* Price */}
            <div className="text-end flex-shrink-0">
              <span className="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight">
                {product.price} <span className="text-xs font-semibold">{isAr ? 'دج' : 'DA'}</span>
              </span>
              <div className="flex items-center justify-end gap-1 text-[10px] text-amber-300 mt-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold">{product.rating}</span>
                <span className="text-neutral-400">({product.reviewsCount})</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Details Bottom Sheet Link */}
          <div className="flex items-center justify-between pt-0.5 text-xs">
            <button
              onClick={() => onOpenDetails(product)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white border border-white/10 text-[11px] font-medium backdrop-blur-md transition-all active:scale-95"
              id="btn-product-details-sheet"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'تفاصيل المكونات والقيمة الغذائية' : 'Ingredients & Nutrition'}</span>
            </button>

            {product.customizationGroups.length > 0 && (
              <button
                onClick={() => onOpenDetails(product)}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{isAr ? 'خيارات التخصيص' : 'Customize'}</span>
              </button>
            )}
          </div>

          {/* Bottom Action Bar: Quantity + Primary CTA */}
          <div className="flex items-center gap-2 pt-1">
            {/* Quantity Selector */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                aria-label={isAr ? 'تقليل الكمية' : 'Decrease Quantity'}
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="w-6 text-center font-mono font-bold text-xs text-neutral-100">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={isAr ? 'زيادة الكمية' : 'Increase Quantity'}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Primary CTA: [+ إضافة للطلب] / Add to Order */}
            <button
              onClick={handleAddClick}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-lg ${
                addedJustNow
                  ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/25'
              }`}
              id="btn-add-to-order-hero"
            >
              {addedJustNow ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isAr ? 'تمت الإضافة للطلب!' : 'Added to Order!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>
                    {product.customizationGroups.length > 0
                      ? isAr
                        ? 'تخصيص وإضافة للطلب'
                        : 'Customize & Add'
                      : isAr
                      ? 'إضافة للطلب'
                      : 'Add to Order'}
                  </span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/20 text-neutral-900 font-extrabold">
                    {product.price * quantity} {isAr ? 'دج' : 'DA'}
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </footer>
    </div>
  );
};
