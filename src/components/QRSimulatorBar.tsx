import React from 'react';
import { QrCode, RotateCcw, UtensilsCrossed, Globe, Sparkles, LayoutDashboard, Clock, ChefHat } from 'lucide-react';
import { StoreInfo, OrderDetails } from '../types';

interface QRSimulatorBarProps {
  storeInfo: StoreInfo;
  onUpdateTable: (table: string) => void;
  onUpdateDiningMode: (mode: 'dine-in' | 'takeaway') => void;
  onResetToIntro: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  onOpenDashboard: () => void;
  activeOrdersCount: number;
  currentOrder: OrderDetails | null;
  onOpenCurrentOrderModal: () => void;
}

export const QRSimulatorBar: React.FC<QRSimulatorBarProps> = ({
  storeInfo,
  onUpdateTable,
  onUpdateDiningMode,
  onResetToIntro,
  lang,
  onToggleLang,
  onOpenDashboard,
  activeOrdersCount,
  currentOrder,
  onOpenCurrentOrderModal,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="bg-[#101015]/95 backdrop-blur-md border-b border-white/10 px-3 py-2 text-xs text-neutral-300 flex items-center justify-between z-50 relative gap-2 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-medium">
          <QrCode className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[11px]">{isAr ? 'مسح QR طاولة' : 'QR Simulation'}</span>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => onUpdateDiningMode('dine-in')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              storeInfo.diningMode === 'dine-in'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isAr ? 'طاولة' : 'Table'} {storeInfo.tableNumber}
          </button>
          <button
            onClick={() => onUpdateDiningMode('takeaway')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              storeInfo.diningMode === 'takeaway'
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {isAr ? 'سفري' : 'Takeaway'}
          </button>
        </div>

        {storeInfo.diningMode === 'dine-in' && (
          <select
            value={storeInfo.tableNumber}
            onChange={(e) => onUpdateTable(e.target.value)}
            className="bg-neutral-800 text-neutral-200 text-[11px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="01">{isAr ? 'طاولة 01 (شرفة)' : 'Table 01 (Terrace)'}</option>
            <option value="04">{isAr ? 'طاولة 04 (الصالون)' : 'Table 04 (Lounge)'}</option>
            <option value="07">{isAr ? 'طاولة 07 (VIP)' : 'Table 07 (VIP)'}</option>
            <option value="12">{isAr ? 'طاولة 12 (الحديقة)' : 'Table 12 (Garden)'}</option>
          </select>
        )}

        {/* Floating Active Order Tracker Indicator */}
        {currentOrder && (
          <button
            onClick={onOpenCurrentOrderModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold animate-pulse transition-all"
            title={isAr ? 'عرض حالة طلبيتي' : 'View My Active Order'}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>
              {isAr ? 'طلبيتك' : 'Order'} {currentOrder.orderId}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Dashboard Access Button */}
        <button
          onClick={onOpenDashboard}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all text-[11px] font-bold active:scale-95 shadow-sm"
          title={isAr ? 'فتح لوحة تحكم المطبخ والإدارة' : 'Open Kitchen & Admin Dashboard'}
          id="btn-open-dashboard"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
          <span>{isAr ? 'لوحة التحكم' : 'Dashboard'}</span>
          {activeOrdersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono font-bold">
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all text-[11px]"
          title="تغيير اللغة / Change Language"
        >
          <Globe className="w-3 h-3 text-amber-400" />
          <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        <button
          onClick={onResetToIntro}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all text-[11px]"
          title={isAr ? 'إعادة شاشة البداية' : 'Replay Intro'}
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span className="hidden md:inline">{isAr ? 'البداية' : 'Intro'}</span>
        </button>
      </div>
    </header>
  );
};
