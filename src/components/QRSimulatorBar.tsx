import React from 'react';
import { QrCode, RotateCcw, UtensilsCrossed, Globe, Sparkles, Clock, ChefHat } from 'lucide-react';
import { StoreInfo, OrderDetails } from '../types';
import { RESTAURANT_TABLES } from '../data/mockData';

interface QRSimulatorBarProps {
  storeInfo: StoreInfo;
  onUpdateDiningMode: (mode: 'dine-in' | 'takeaway') => void;
  onUpdateTable?: (table: string) => void;
  allowTableSelection?: boolean;
  onResetToIntro: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  currentOrder: OrderDetails | null;
  onOpenCurrentOrderModal: () => void;
}

export const QRSimulatorBar: React.FC<QRSimulatorBarProps> = ({
  storeInfo,
  onUpdateDiningMode,
  onUpdateTable,
  allowTableSelection = false,
  onResetToIntro,
  lang,
  onToggleLang,
  currentOrder,
  onOpenCurrentOrderModal,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="bg-[#101015]/95 backdrop-blur-md border-b border-white/10 px-3 py-2 text-xs text-neutral-300 flex items-center justify-between z-50 relative gap-2 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-medium">
          <QrCode className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[11px]">{isAr ? 'منيو الطاولة' : 'Table menu'}</span>
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
          allowTableSelection && onUpdateTable ? (
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-300">
              <span>{isAr ? 'اختر الطاولة' : 'Choose table'}</span>
              <select
                value={storeInfo.tableNumber}
                onChange={(event) => onUpdateTable(event.target.value)}
                className="bg-transparent text-amber-200 outline-none"
              >
                {RESTAURANT_TABLES.map((table) => (
                  <option key={table.id} value={table.id} className="bg-neutral-900 text-white">
                    {isAr ? `${table.label} • ${table.zone}` : `${table.labelEn} • ${table.zoneEn}`}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
              {isAr ? `طاولة ${storeInfo.tableNumber} من QR` : `Table ${storeInfo.tableNumber} via QR`}
            </span>
          )
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
