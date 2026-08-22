import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  QrCode,
  ArrowRight,
  ArrowLeft,
  X,
  Printer,
  ShoppingBag,
  Bell,
  Check,
} from 'lucide-react';
import { OrderDetails } from '../types';
import { sounds } from '../utils/soundEffects';

interface OrderConfirmationModalProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
  lang: 'ar' | 'en';
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onNewOrder,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() =>
    order ? order.estimatedMinutes * 60 : 480
  );

  // Sync remaining seconds when order changes
  useEffect(() => {
    if (order) {
      setSecondsRemaining(order.estimatedMinutes * 60);
    }
  }, [order?.orderId, order?.estimatedMinutes]);

  // Live timer countdown
  useEffect(() => {
    if (!isOpen || !order || order.status === 'served') return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, order?.status]);

  if (!order) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Status mapping
  const isReceived = order.status === 'received';
  const isPreparing = order.status === 'preparing' || order.status === 'confirmed';
  const isReady = order.status === 'ready';
  const isServed = order.status === 'served';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-[#121219]/95 backdrop-blur-2xl border border-white/15 p-6 shadow-2xl space-y-5 text-neutral-100"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with status badge */}
            <div className="text-center space-y-2 pt-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
                  isReady
                    ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-purple-500/20'
                    : isPreparing
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-amber-500/20'
                    : isServed
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20'
                    : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
                }`}
              >
                {isReady ? (
                  <Sparkles className="w-8 h-8 animate-bounce" />
                ) : isPreparing ? (
                  <ChefHat className="w-8 h-8 animate-pulse" />
                ) : isServed ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 animate-pulse" />
                )}
              </motion.div>

              <div className="flex items-center justify-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-mono font-bold tracking-wider">
                  {order.orderId}
                </span>
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  {order.diningMode === 'dine-in'
                    ? isAr
                      ? `طاولة ${order.tableNumber}`
                      : `Table ${order.tableNumber}`
                    : isAr
                    ? 'سفري'
                    : 'Takeaway'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-neutral-100 font-serif">
                {isReady
                  ? isAr
                    ? 'طلبيتك جاهزة للتقديم والتسليم!'
                    : 'Your Order is Ready!'
                  : isPreparing
                  ? isAr
                    ? 'الشيف يقوم بتحضير طلبك الآن'
                    : 'Chef is Preparing Your Order'
                  : isServed
                  ? isAr
                    ? 'تم تقديم الطلب بنجاح — بالصحة والعافية'
                    : 'Order Served — Enjoy!'
                  : isAr
                  ? 'تم إرسال واستلام الطلبية بنجاح'
                  : 'Order Confirmed & Received'}
              </h3>

              <p className="text-xs text-neutral-400">
                {order.diningMode === 'dine-in'
                  ? isAr
                    ? `سيتم تقديم الطلب مباشرة إلى طاولة ${order.tableNumber}`
                    : `Your items will be brought directly to Table ${order.tableNumber}`
                  : isAr
                  ? 'طلب سفري — سنقوم بالنداء على رقم طلبك فور الانتهاء'
                  : 'Takeaway order — you will be called once packed'}
              </p>
            </div>

            {/* Live Progress Stepper */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-200">
                  {isAr ? 'مراحل الطلب بالمطبخ:' : 'Kitchen Live Progress:'}
                </span>
                {!isServed && (
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>~ {formattedTime}</span>
                  </div>
                )}
              </div>

              {/* 3 Step indicators */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Step 1: Received */}
                <div
                  className={`p-2.5 rounded-xl text-center border transition-all ${
                    isReceived || isPreparing || isReady || isServed
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/5 text-neutral-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[10px] font-bold block leading-tight">
                    {isAr ? 'تم الاستلام' : 'Received'}
                  </span>
                </div>

                {/* Step 2: In Preparation */}
                <div
                  className={`p-2.5 rounded-xl text-center border transition-all ${
                    isPreparing || isReady || isServed
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-white/5 border-white/5 text-neutral-500'
                  }`}
                >
                  <ChefHat
                    className={`w-4 h-4 mx-auto mb-1 ${isPreparing ? 'animate-bounce' : ''}`}
                  />
                  <span className="text-[10px] font-bold block leading-tight">
                    {isAr ? 'قيد التحضير' : 'In Kitchen'}
                  </span>
                </div>

                {/* Step 3: Ready for Serving */}
                <div
                  className={`p-2.5 rounded-xl text-center border transition-all ${
                    isReady || isServed
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/5 text-neutral-500'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[10px] font-bold block leading-tight">
                    {isAr ? 'جاهز للتقديم' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="max-h-36 overflow-y-auto bg-black/30 p-3 rounded-2xl border border-white/5 space-y-1.5 no-scrollbar text-xs">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium mb-1">
                <span>{isAr ? 'الأصناف المطلوبة:' : 'Ordered Items:'}</span>
                <span className="font-mono text-neutral-400">
                  {order.paymentMethod === 'cash'
                    ? isAr ? 'دفع نقداً' : 'Cash'
                    : order.paymentMethod === 'baridimob'
                    ? 'BaridiMob'
                    : order.paymentMethod === 'card'
                    ? 'Card CIB'
                    : isAr ? 'عند الكاونتر' : 'Counter'}
                </span>
              </div>
              {order.items.map((item) => (
                <div key={item.cartItemId} className="flex items-center justify-between text-neutral-200">
                  <span className="truncate pr-2">
                    <span className="font-bold text-amber-400 font-mono">{item.quantity}x</span>{' '}
                    {isAr ? item.product.name : item.product.nameEn}
                  </span>
                  <span className="font-mono text-amber-400 flex-shrink-0">
                    {item.totalPrice} دج
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between font-bold text-neutral-100">
                <span>{isAr ? 'المجموع النهائي' : 'Total Amount'}</span>
                <span className="font-mono text-amber-400 text-sm">{order.total} دج</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onNewOrder}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-center"
              >
                {isAr ? 'متابعة التصفح وطلب المزيد' : 'Continue Browsing Menu'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
