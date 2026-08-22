import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShoppingBag,
  Search,
  Flame,
  Croissant,
  Cake,
  Coffee,
  GlassWater,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  LayoutDashboard,
} from 'lucide-react';
import { Product, Category, StoreInfo, CartItem } from '../types';

interface DiscoveryScreenProps {
  products: Product[];
  categories: Category[];
  storeInfo: StoreInfo;
  cartItems: CartItem[];
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
  onOpenDashboard?: () => void;
  activeOrdersCount?: number;
  lang: 'ar' | 'en';
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  products,
  categories,
  storeInfo,
  cartItems,
  onSelectProduct,
  onOpenCart,
  onOpenDashboard,
  activeOrdersCount = 0,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'chef' | 'under400'>('all');

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalCartAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.nameEn.toLowerCase().includes(query) ||
        p.shortDesc.toLowerCase().includes(query);
      
      // Quick filter
      let matchQuick = true;
      if (activeFilter === 'popular') matchQuick = p.badge?.includes('الأكثر') || p.rating >= 4.95;
      if (activeFilter === 'chef') matchQuick = p.badge?.includes('الشيف') || p.isFeatured === true;
      if (activeFilter === 'under400') matchQuick = p.price <= 400;

      return matchCategory && matchSearch && matchQuick;
    });
  }, [products, selectedCategory, searchQuery, activeFilter]);

  const featuredProduct = useMemo(() => {
    return products.find((p) => p.isFeatured && p.id === 'crepe-strawberry-chocolate') || products[0];
  }, [products]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'Croissant':
        return <Croissant className="w-4 h-4" />;
      case 'Cake':
        return <Cake className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'GlassWater':
        return <GlassWater className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-[calc(100dvh-40px)] bg-[#09090d] text-neutral-100 pb-24 select-none">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#09090d]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/5 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-sm">
              MD
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100 leading-tight">
                {isAr ? storeInfo.name : storeInfo.nameEn}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {storeInfo.diningMode === 'dine-in'
                    ? `${isAr ? 'طاولة' : 'Table'} ${storeInfo.tableNumber}`
                    : isAr
                    ? 'طلب سفري'
                    : 'Takeaway'}
                </span>
                <span>•</span>
                <span>{storeInfo.prepTimeEstimate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all text-xs font-semibold"
                title={isAr ? 'لوحة تحكم وإدارة المطعم' : 'Admin & Kitchen Dashboard'}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
                {activeOrdersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono font-bold">
                    {activeOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Quick Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all duration-200 active:scale-95"
              aria-label="سلة الطلب"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 ? (
                <span className="text-xs font-bold font-mono">
                  {totalCartAmount} {isAr ? 'دج' : 'DA'}
                </span>
              ) : (
                <span className="text-xs font-medium">{isAr ? 'الطلب' : 'Order'}</span>
              )}
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-neutral-950 shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-5xl mx-auto mt-3">
          <div className="relative flex items-center">
            <Search className="absolute right-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن كريب، كرواسون، قهوة، موهيتو...' : 'Search crepes, bakery, coffee...'}
              className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 text-neutral-100 text-xs rounded-xl pr-10 pl-4 py-2.5 border border-white/10 focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-neutral-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 text-xs text-neutral-400 hover:text-white px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-6">
        {/* Categories Horizontal Carousel */}
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? products.length
                : products.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                }`}
              >
                <span className={isActive ? 'text-neutral-950' : 'text-amber-400'}>
                  {getCategoryIcon(cat.iconName)}
                </span>
                <span>{isAr ? cat.name : cat.nameEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-neutral-900' : 'bg-white/10 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Featured Spotlight Banner (Shown when no search query and 'all' is selected) */}
        {!searchQuery && selectedCategory === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => onSelectProduct(featuredProduct)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose-950/40 via-neutral-900 to-black p-5 shadow-2xl transition-all duration-300 hover:border-rose-500/40"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-rose-600/25 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>{isAr ? 'الإصدار المميز اليوم' : "Chef's Daily Highlight"}</span>
                </div>

                <h3 className="text-xl font-bold text-neutral-100 font-serif leading-snug group-hover:text-rose-200 transition-colors">
                  {isAr ? featuredProduct.name : featuredProduct.nameEn}
                </h3>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-light">
                  {isAr ? featuredProduct.shortDesc : featuredProduct.shortDesc}
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-lg font-bold text-amber-400 font-mono">
                    {featuredProduct.price} {isAr ? 'دج' : 'DA'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{featuredProduct.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{featuredProduct.rating}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 group-hover:underline">
                    <span>{isAr ? 'استكشف بالتفصيل' : 'Explore Hero View'}</span>
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </div>
              </div>

              {/* Spotlight Product Image with Shared Layout */}
              <div className="relative aspect-[4/3] sm:aspect-square flex items-center justify-center p-2">
                <motion.div
                  layoutId={`product-image-container-${featuredProduct.id}`}
                  className="w-full h-full relative flex items-center justify-center"
                >
                  <motion.img
                    layoutId={`product-img-${featuredProduct.id}`}
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 text-neutral-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isAr ? 'المنتجات المعروضة' : 'Showing'} ({filteredProducts.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeFilter === 'all'
                  ? 'bg-neutral-800 text-white font-medium border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setActiveFilter('popular')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeFilter === 'popular'
                  ? 'bg-neutral-800 text-white font-medium border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'الأكثر طلباً' : 'Popular'}
            </button>
            <button
              onClick={() => setActiveFilter('chef')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeFilter === 'chef'
                  ? 'bg-neutral-800 text-white font-medium border border-white/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isAr ? 'اختيار الشيف' : "Chef's Choice"}
            </button>
          </div>
        </div>

        {/* Product Cards Feed / Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/5 rounded-3xl border border-white/10 space-y-3">
            <Info className="w-8 h-8 text-neutral-500 mx-auto" />
            <p className="text-sm text-neutral-300 font-medium">
              {isAr ? 'لم نجد أي منتجات تطابق بحثك' : 'No items match your search'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveFilter('all');
              }}
              className="text-xs text-amber-400 underline font-medium"
            >
              {isAr ? 'إعادة ضبط البحث' : 'Reset filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              return (
                <motion.div
                  key={product.id}
                  layoutId={`product-card-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative cursor-pointer flex flex-col justify-between overflow-hidden rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-white/20 p-4 transition-all duration-300 shadow-lg hover:shadow-2xl"
                  style={{
                    background: `linear-gradient(180deg, rgba(25, 25, 35, 0.7) 0%, rgba(12, 12, 18, 0.9) 100%)`,
                  }}
                >
                  {/* Subtle Ambient Product Tint Glow */}
                  <div
                    className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500"
                    style={{ backgroundColor: product.palette.primary }}
                  />

                  {/* Top Badges & Price */}
                  <div className="flex items-center justify-between gap-2 mb-2 z-10">
                    {product.badge ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-200 border border-white/15 text-[10px] font-bold backdrop-blur-md">
                        {product.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                        {product.category}
                      </span>
                    )}

                    <span className="text-sm font-bold text-amber-400 font-mono">
                      {product.price} {isAr ? 'دج' : 'DA'}
                    </span>
                  </div>

                  {/* Product Visual - The Hero of the Card (Shared Element Target) */}
                  <div className="relative my-2 aspect-[4/3] flex items-center justify-center p-2">
                    <motion.div
                      layoutId={`product-image-container-${product.id}`}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full h-full relative flex items-center justify-center"
                    >
                      <motion.img
                        layoutId={`product-img-${product.id}`}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </motion.div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1.5 pt-2 z-10">
                    <h4 className="text-sm font-bold text-neutral-100 group-hover:text-amber-300 transition-colors leading-tight font-serif">
                      {isAr ? product.name : product.nameEn}
                    </h4>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-light">
                      {isAr ? product.shortDesc : product.shortDesc}
                    </p>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400 border-t border-white/5">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-neutral-500">({product.reviewsCount})</span>
                      </div>

                      <div className="flex items-center gap-1 text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>{product.prepTime}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar when items are present */}
      <AnimatePresence>
        {totalCartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40"
          >
            <button
              onClick={onOpenCart}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-neutral-950 text-amber-400 text-xs font-mono font-bold">
                  {totalCartCount}
                </span>
                <span className="text-sm font-bold">
                  {isAr ? 'عرض سلة الطلب' : 'View Order Cart'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-extrabold">
                  {totalCartAmount} {isAr ? 'دج' : 'DA'}
                </span>
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
