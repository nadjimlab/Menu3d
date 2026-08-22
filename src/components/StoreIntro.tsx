import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Utensils, Clock, MapPin, ChevronLeft, ChevronRight, QrCode } from 'lucide-react';
import { StoreInfo } from '../types';

interface StoreIntroProps {
  storeInfo: StoreInfo;
  onStartDiscovery: () => void;
  lang: 'ar' | 'en';
}

export const StoreIntro: React.FC<StoreIntroProps> = ({
  storeInfo,
  onStartDiscovery,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    return localStorage.getItem('digimenu_auto_skip') === 'true';
  });

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('digimenu_auto_skip', 'true');
    } else {
      localStorage.removeItem('digimenu_auto_skip');
    }
    onStartDiscovery();
  };

  return (
    <div className="relative min-h-[calc(100dvh-40px)] w-full flex flex-col justify-between overflow-hidden bg-[#0a0a0f] text-neutral-100 p-6 md:p-10 select-none">
      {/* Ambient background glow & subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {/* Store Logo with ambient ring */}
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-neutral-900 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-950/40">
            <span className="font-serif text-xl font-bold text-amber-400 tracking-wider">MD</span>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <h1 className="text-lg font-bold text-neutral-100 tracking-tight leading-tight">
              {isAr ? storeInfo.name : storeInfo.nameEn}
            </h1>
            <p className="text-xs text-neutral-400 font-light flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-500/80" />
              <span>{storeInfo.location}</span>
            </p>
          </div>
        </div>

        {/* Live Open Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isAr ? 'مفتوح الآن' : 'Open Now'}</span>
        </div>
      </motion.div>

      {/* Middle Hero Presentation */}
      <div className="relative z-10 my-auto py-6 flex flex-col items-center text-center">
        {/* Featured Hero Media Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative group w-full max-w-sm aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 p-1 mb-6 bg-gradient-to-b from-white/10 to-transparent"
        >
          <div className="w-full h-full rounded-[22px] overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85"
              alt="Maison Du Délice Hero"
              className="w-full h-full object-cover transform scale-100 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-black/20" />
            
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-xs text-neutral-200 backdrop-blur-md bg-black/40 px-3 py-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'تجربة ضيافة حصرية' : 'Exclusive Dining Experience'}</span>
              </div>
              <div className="flex items-center gap-1 text-neutral-400">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>{storeInfo.prepTimeEstimate}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title & Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
            <Utensils className="w-3 h-3" />
            <span>{isAr ? storeInfo.tagline : storeInfo.taglineEn}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-100 tracking-tight leading-tight mb-2 font-serif">
            {isAr ? 'اكتشف منتجاتنا' : 'Discover Our Menu'}
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed font-light">
            {isAr
              ? 'تصفح قائمة الطعام بطريقة تفاعلية سلسة ومصممة بأعلى معايير الفخامة'
              : 'Browse our signature gourmet creations in an interactive, visual journey'}
          </p>
        </motion.div>
      </div>

      {/* Bottom CTA Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-4 w-full max-w-sm mx-auto"
      >
        <button
          onClick={handleStart}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 p-[1px] shadow-xl shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-center gap-3 rounded-[15px] bg-neutral-950 px-6 py-4 transition-all duration-300 group-hover:bg-opacity-80">
            <span className="text-base font-bold text-neutral-100 tracking-wide">
              {isAr ? 'ابدأ الاستكشاف' : 'Start Discovery'}
            </span>
            {isAr ? (
              <ChevronLeft className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:-translate-x-1" />
            ) : (
              <ChevronRight className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </div>
        </button>

        {/* Auto-skip toggle */}
        <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded bg-neutral-800 border-white/20 text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer accent-amber-500"
          />
          <span>{isAr ? 'تخطي الشاشة الترحيبية مستقبلاً' : 'Skip welcome intro next time'}</span>
        </label>
      </motion.div>
    </div>
  );
};
