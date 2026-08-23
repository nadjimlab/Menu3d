import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Banknote,
  CreditCard,
  Store,
  User,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { CartItem, StoreInfo, PaymentMethod } from '../types';
import { sounds } from '../utils/soundEffects';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToOrder: (
    tableNumber: string,
    diningMode: 'dine-in' | 'takeaway',
    notes: string,
    customerName?: string,
    customerPhone?: string,
    paymentMethod?: PaymentMethod
  ) => void;
  storeInfo: StoreInfo;
  lang: 'ar' | 'en';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToOrder,
  storeInfo,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [diningMode, setDiningMode] = useState<'dine-in' | 'takeaway'>(storeInfo.diningMode);
  const [tableNumber, setTableNumber] = useState<string>(storeInfo.tableNumber);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal;

  const handleCheckout = () => {
    if (cartItems.length === 0 || isSending) return;
    setIsSending(true);
    sounds.playOrderPlacedChime();

    setTimeout(() => {
      onProceedToOrder(
        tableNumber,
        diningMode,
        orderNotes,
        customerName.trim() || undefined,
        customerPhone.trim() || undefined,
        paymentMethod
      );
      setIsSending(false);
    }, 450);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Slide-in Drawer Container */}
          <motion.div
            initial={{ x: isAr ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? '-100%' : '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md h-full bg-[#111116]/95 backdrop-blur-2xl border-x border-white/10 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100 font-serif">
                    {isAr ? 'قائمة طلباتك' : 'Your Order'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {cartItems.length}{' '}
                    {isAr
                      ? cartItems.length === 1
                        ? 'عنصر'
                        : 'عناصر'
                      : 'items'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title={isAr ? 'مسح الكل' : 'Clear all'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-neutral-200">
                      {isAr ? 'سلة الطلب فارغة حالياً' : 'Your cart is empty'}
                    </h4>
                    <p className="text-xs text-neutral-400 max-w-xs">
                      {isAr
                        ? 'استكشف القائمة وأضف إبداعاتك المفضلة من الكريب والكرواسون والقهوة'
                        : 'Explore the menu and add your favorite creations to start ordering'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                  >
                    {isAr ? 'ابدأ باختيار المنتجات' : 'Browse creations'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Dining Options Selector */}
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-300">
                        {isAr ? 'نوع الخدمة:' : 'Dining Mode:'}
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                        <button
                          onClick={() => setDiningMode('dine-in')}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            diningMode === 'dine-in'
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {isAr ? 'محلي / طاولة' : 'Dine-In'}
                        </button>
                        <button
                          onClick={() => setDiningMode('takeaway')}
                          className={`px-3 py-1 rounded text-xs transition-colors ${
                            diningMode === 'takeaway'
                              ? 'bg-amber-500 text-neutral-950 font-bold'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {isAr ? 'سفري' : 'Takeaway'}
                        </button>
                      </div>
                    </div>

                    {diningMode === 'dine-in' ? (
                      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                        <div>
                          <span className="block text-xs font-bold text-neutral-200">
                            {isAr ? `طاولة ${tableNumber}` : `Table ${tableNumber}`}
                          </span>
                          <span className="text-[11px] text-emerald-300">
                            {isAr ? 'تم تحديدها تلقائياً من QR' : 'Assigned automatically from QR'}
                          </span>
                        </div>
                        <span className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold text-emerald-300">
                          {isAr ? 'طلب محلي' : 'Dine-in'}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder={isAr ? 'اسم العميل (اختياري)' : 'Customer Name'}
                            className="bg-black/40 text-xs text-neutral-200 rounded-xl p-2 border border-white/10 focus:border-amber-500/50 focus:outline-none"
                          />
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder={isAr ? 'رقم الهاتف (اختياري)' : 'Phone Number'}
                            className="bg-black/40 text-xs text-neutral-200 rounded-xl p-2 border border-white/10 focus:border-amber-500/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-neutral-300 block">
                      {isAr ? 'طريقة الدفع المرجوة:' : 'Payment Method:'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: 'cash',
                          label: isAr ? 'نقداً للطاولة' : 'Cash on table',
                          icon: Banknote,
                        },
                        {
                          id: 'baridimob',
                          label: isAr ? 'بريدي موب' : 'BaridiMob',
                          icon: CreditCard,
                        },
                        {
                          id: 'card',
                          label: isAr ? 'بطاقة CIB' : 'Card POS',
                          icon: CreditCard,
                        },
                        {
                          id: 'counter',
                          label: isAr ? 'عند الكاونتر' : 'At Counter',
                          icon: Store,
                        },
                      ].map((pm) => {
                        const Icon = pm.icon;
                        const isSelected = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                            className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-black/20 text-neutral-400 border-white/5 hover:border-white/15'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="truncate">{pm.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => {
                      return (
                        <motion.div
                          key={item.cartItemId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 rounded-xl object-contain bg-black/40 p-1 flex-shrink-0"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-neutral-100">
                                  {isAr ? item.product.name : item.product.nameEn}
                                </h4>
                                <span className="text-xs font-mono font-bold text-amber-400">
                                  {item.unitPrice} {isAr ? 'دج' : 'DA'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.cartItemId)}
                              className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                              aria-label="حذف"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Selected Options List */}
                          {item.selectedOptions.length > 0 && (
                            <div className="text-[11px] text-neutral-400 bg-black/20 p-2 rounded-xl border border-white/5 space-y-0.5">
                              {item.selectedOptions.map((opt, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <span>• {opt.optionName}</span>
                                  {opt.extraPrice > 0 && (
                                    <span className="text-amber-400/90 font-mono">
                                      +{opt.extraPrice} دج
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {item.specialNotes && (
                            <p className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-1 rounded-lg">
                              {isAr ? 'ملاحظة:' : 'Note:'} {item.specialNotes}
                            </p>
                          )}

                          {/* Quantity and Line Total */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.cartItemId, item.quantity - 1)
                                }
                                className="w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-mono font-bold text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.cartItemId, item.quantity + 1)
                                }
                                className="w-6 h-6 rounded flex items-center justify-center text-neutral-300 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-mono font-extrabold text-neutral-100">
                              {item.totalPrice} {isAr ? 'دج' : 'DA'}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* General Order Notes */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      {isAr ? 'ملاحظات إضافية على كامل الطلب' : 'General Order Notes'}
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder={
                        isAr ? 'مثال: تقديم المشروبات أولاً، بدون سكر إضافي...' : 'E.g., drinks first...'
                      }
                      className="w-full bg-white/5 focus:bg-white/10 text-xs text-neutral-200 rounded-xl p-2.5 border border-white/10 focus:border-amber-500/50 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-neutral-950/90 backdrop-blur-xl space-y-3">
                <div className="space-y-1.5 text-xs text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-mono">{subtotal} {isAr ? 'دج' : 'DA'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isAr ? 'ضريبة الخدمة (مشملة)' : 'Service (Included)'}</span>
                    <span className="text-emerald-400 font-mono">0 دج</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-neutral-100 pt-2 border-t border-white/10">
                    <span>{isAr ? 'المجموع الإجمالي' : 'Total Amount'}</span>
                    <span className="font-mono text-base font-extrabold text-amber-400">
                      {total} {isAr ? 'دج' : 'DA'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-75"
                  id="btn-confirm-send-order"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                      <span>{isAr ? 'جاري إرسال الطلب للمطبخ...' : 'Sending to Kitchen...'}</span>
                    </>
                  ) : (
                    <>
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>{isAr ? 'إرسال وتأكيد الطلبية للمطبخ' : 'Send & Confirm Order'}</span>
                      {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
