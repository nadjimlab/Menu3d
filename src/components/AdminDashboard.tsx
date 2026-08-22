import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  UtensilsCrossed,
  Printer,
  Search,
  Filter,
  Check,
  X,
  Volume2,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Coffee,
  Plus,
  Edit3,
  Flame,
  Phone,
  User,
  CreditCard,
  Banknote,
  Store,
} from 'lucide-react';
import { OrderDetails, OrderStatus, Product, StoreInfo } from '../types';
import { sounds } from '../utils/soundEffects';

interface AdminDashboardProps {
  orders: OrderDetails[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, adjustedMinutes?: number) => void;
  products: Product[];
  onToggleProductAvailability: (productId: string) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  storeInfo: StoreInfo;
  onUpdateStoreInfo: (updated: Partial<StoreInfo>) => void;
  onCloseDashboard: () => void;
  lang: 'ar' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onUpdateOrderStatus,
  products,
  onToggleProductAvailability,
  onUpdateProductPrice,
  storeInfo,
  onUpdateStoreInfo,
  onCloseDashboard,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'stats' | 'settings'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderDetails | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Status counters
  const receivedOrders = orders.filter((o) => o.status === 'received');
  const preparingOrders = orders.filter((o) => o.status === 'preparing' || o.status === 'confirmed');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const servedOrders = orders.filter((o) => o.status === 'served');

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      if (statusFilter === 'active') {
        if (order.status === 'served' || order.status === 'cancelled') return false;
      } else {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.orderId.toLowerCase().includes(q);
      const matchTable = order.tableNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName?.toLowerCase().includes(q);
      const matchItem = order.items.some((i) =>
        i.product.name.toLowerCase().includes(q) || i.product.nameEn.toLowerCase().includes(q)
      );
      return matchId || matchTable || matchCustomer || matchItem;
    }
    return true;
  });

  // Calculate statistics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const dineInCount = orders.filter((o) => o.diningMode === 'dine-in').length;
  const takeawayCount = orders.filter((o) => o.diningMode === 'takeaway').length;

  // Most popular items aggregation
  const itemCounts: { [name: string]: { count: number; totalRev: number; image: string } } = {};
  orders.forEach((o) => {
    if (o.status !== 'cancelled') {
      o.items.forEach((item) => {
        const key = isAr ? item.product.name : item.product.nameEn;
        if (!itemCounts[key]) {
          itemCounts[key] = { count: 0, totalRev: 0, image: item.product.image };
        }
        itemCounts[key].count += item.quantity;
        itemCounts[key].totalRev += item.totalPrice;
      });
    }
  });

  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus, extraMins?: number) => {
    if (newStatus === 'ready') {
      sounds.playOrderReadyChime();
    } else if (newStatus === 'confirmed' || newStatus === 'preparing') {
      sounds.playOrderPlacedChime();
    }
    onUpdateOrderStatus(orderId, newStatus, extraMins);
  };

  const handleSavePrice = (productId: string) => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num) && num > 0) {
      onUpdateProductPrice(productId, num);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-neutral-100 flex flex-col font-sans antialiased">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f16]/95 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-semibold border border-white/10 transition-all active:scale-95"
            id="btn-admin-back-client"
          >
            {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isAr ? 'عرض الزبائن (Menu)' : 'Customer View'}</span>
          </button>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-neutral-100 font-serif leading-none">
                  {isAr ? 'لوحة تحكم وإدارة المطعم' : 'Restaurant & Kitchen Hub'}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {isAr ? storeInfo.name : storeInfo.nameEn}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
            id="tab-admin-orders"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{isAr ? 'الطلبيات الحية' : 'Live Orders'}</span>
            {receivedOrders.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono font-black animate-pulse">
                {receivedOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
            id="tab-admin-menu"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{isAr ? 'إدارة الأصناف' : 'Menu Inventory'}</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
            id="tab-admin-stats"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isAr ? 'المبيعات والتقارير' : 'Analytics'}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
            id="tab-admin-settings"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'الإعدادات' : 'Settings'}</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* ======================= TAB 1: LIVE ORDERS ======================= */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setStatusFilter('received')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  statusFilter === 'received'
                    ? 'bg-rose-500/20 border-rose-500/50 shadow-lg'
                    : 'bg-[#12121a] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span>{isAr ? 'طلبات جديدة بانتظار التأكيد' : 'Incoming / Pending'}</span>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black font-mono text-rose-400">
                  {receivedOrders.length}
                </div>
              </div>

              <div
                onClick={() => setStatusFilter('preparing')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  statusFilter === 'preparing'
                    ? 'bg-amber-500/20 border-amber-500/50 shadow-lg'
                    : 'bg-[#12121a] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span>{isAr ? 'قيد التحضير في المطبخ' : 'In Preparation'}</span>
                  <ChefHat className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {preparingOrders.length}
                </div>
              </div>

              <div
                onClick={() => setStatusFilter('ready')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  statusFilter === 'ready'
                    ? 'bg-purple-500/20 border-purple-500/50 shadow-lg'
                    : 'bg-[#12121a] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span>{isAr ? 'جاهزة للتقديم والتسليم' : 'Ready for Serving'}</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black font-mono text-purple-400">
                  {readyOrders.length}
                </div>
              </div>

              <div
                onClick={() => setStatusFilter('served')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  statusFilter === 'served'
                    ? 'bg-emerald-500/20 border-emerald-500/50 shadow-lg'
                    : 'bg-[#12121a] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                  <span>{isAr ? 'تم التقديم بنجاح' : 'Served & Completed'}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {servedOrders.length}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111118] p-3 rounded-2xl border border-white/10">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isAr
                      ? 'بحث برقم الطلب #DM، رقم الطاولة، اسم العميل...'
                      : 'Search by Order ID, Table, Customer name...'
                  }
                  className="w-full bg-black/40 text-xs text-neutral-200 rounded-xl pr-9 pl-3 py-2 border border-white/10 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              {/* Status filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { key: 'all', label: isAr ? 'الكل' : 'All' },
                  { key: 'active', label: isAr ? 'النشطة فقط' : 'Active Only' },
                  { key: 'received', label: isAr ? 'جديد' : 'Received' },
                  { key: 'preparing', label: isAr ? 'قيد التحضير' : 'Preparing' },
                  { key: 'ready', label: isAr ? 'جاهز' : 'Ready' },
                  { key: 'served', label: isAr ? 'مكتمل' : 'Served' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setStatusFilter(item.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      statusFilter === item.key
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Grid / Cards */}
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-[#111118] rounded-3xl border border-white/10 space-y-3">
                <UtensilsCrossed className="w-10 h-10 text-neutral-500 mx-auto" />
                <h3 className="text-sm font-bold text-neutral-200">
                  {isAr ? 'لا توجد طلبيات مطابقة للفلتر المحدد' : 'No orders match the filter'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isAr
                    ? 'ستظهر أي طلبية جديدة يرسلها الزبون مباشرة هنا في الوقت الفعلي مع تنبيه صوتي.'
                    : 'Any new orders sent by customers will appear here in real-time with chime notification.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const isReceived = order.status === 'received';
                  const isConfirmedOrPreparing =
                    order.status === 'confirmed' || order.status === 'preparing';
                  const isReady = order.status === 'ready';
                  const isServed = order.status === 'served';

                  return (
                    <motion.div
                      key={order.orderId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative rounded-3xl border p-4 space-y-3 flex flex-col justify-between transition-all ${
                        isReceived
                          ? 'bg-rose-950/20 border-rose-500/40 shadow-xl shadow-rose-950/20'
                          : isConfirmedOrPreparing
                          ? 'bg-amber-950/20 border-amber-500/40 shadow-lg'
                          : isReady
                          ? 'bg-purple-950/20 border-purple-500/40 shadow-lg'
                          : 'bg-[#111118] border-white/10 opacity-75'
                      }`}
                    >
                      {/* Top Order Badge & Info */}
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-amber-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                              {order.orderId}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                order.diningMode === 'dine-in'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              }`}
                            >
                              {order.diningMode === 'dine-in'
                                ? isAr
                                  ? `طاولة ${order.tableNumber}`
                                  : `Table ${order.tableNumber}`
                                : isAr
                                ? 'سفري / Takeaway'
                                : 'Takeaway'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Payment details if provided */}
                        {(order.customerName || order.paymentMethod) && (
                          <div className="flex items-center justify-between text-[11px] text-neutral-300 bg-white/5 px-2.5 py-1.5 rounded-xl mt-2 border border-white/5">
                            {order.customerName && (
                              <div className="flex items-center gap-1 font-semibold">
                                <User className="w-3 h-3 text-amber-400" />
                                <span>{order.customerName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 font-mono text-neutral-400">
                              {order.paymentMethod === 'cash' && (
                                <>
                                  <Banknote className="w-3 h-3 text-emerald-400" />
                                  <span>{isAr ? 'نقداً' : 'Cash'}</span>
                                </>
                              )}
                              {order.paymentMethod === 'baridimob' && (
                                <>
                                  <CreditCard className="w-3 h-3 text-amber-400" />
                                  <span>{isAr ? 'بريدي موب' : 'BaridiMob'}</span>
                                </>
                              )}
                              {order.paymentMethod === 'card' && (
                                <>
                                  <CreditCard className="w-3 h-3 text-blue-400" />
                                  <span>{isAr ? 'بطاقة CIB' : 'Card'}</span>
                                </>
                              )}
                              {order.paymentMethod === 'counter' && (
                                <>
                                  <Store className="w-3 h-3 text-neutral-400" />
                                  <span>{isAr ? 'عند الكاونتر' : 'Counter'}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Items List */}
                        <div className="py-2.5 space-y-1.5">
                          {order.items.map((item) => (
                            <div
                              key={item.cartItemId}
                              className="flex items-start justify-between text-xs text-neutral-200"
                            >
                              <div className="flex-1">
                                <span className="font-bold text-amber-300 font-mono pl-1">
                                  {item.quantity}x
                                </span>{' '}
                                <span className="font-semibold">
                                  {isAr ? item.product.name : item.product.nameEn}
                                </span>
                                {item.selectedOptions.length > 0 && (
                                  <div className="text-[10px] text-neutral-400 pr-4">
                                    {item.selectedOptions.map((o) => o.optionName).join(' • ')}
                                  </div>
                                )}
                                {item.specialNotes && (
                                  <div className="text-[10px] text-amber-400/90 font-italic pr-4">
                                    "{item.specialNotes}"
                                  </div>
                                )}
                              </div>
                              <span className="font-mono font-bold text-neutral-300">
                                {item.totalPrice} دج
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* General Notes if any */}
                        {order.notes && (
                          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-[11px] text-amber-300 mb-2">
                            <span className="font-bold">{isAr ? 'ملاحظة الطلب:' : 'Note:'}</span>{' '}
                            {order.notes}
                          </div>
                        )}

                        {/* Total Amount */}
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-200 pt-2 border-t border-white/10">
                          <span>{isAr ? 'المجموع الإجمالي:' : 'Total:'}</span>
                          <span className="text-sm font-black text-amber-400 font-mono">
                            {order.total} {isAr ? 'دج' : 'DA'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Controls for Kitchen & Manager */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        {/* Step-by-step Status Actions */}
                        {isReceived && (
                          <div className="space-y-1.5">
                            <button
                              onClick={() => handleStatusChange(order.orderId, 'confirmed')}
                              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{isAr ? 'تأكيد الطلبية وبدء التحضير' : 'Confirm & Start Prep'}</span>
                            </button>

                            <div className="flex items-center gap-1 text-[11px]">
                              <button
                                onClick={() => handleStatusChange(order.orderId, 'confirmed', 5)}
                                className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-[10px]"
                              >
                                +5 {isAr ? 'دقائق' : 'mins'}
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.orderId, 'confirmed', 10)}
                                className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-[10px]"
                              >
                                +10 {isAr ? 'دقائق' : 'mins'}
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.orderId, 'cancelled')}
                                className="py-1 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px]"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        )}

                        {isConfirmedOrPreparing && (
                          <button
                            onClick={() => handleStatusChange(order.orderId, 'ready')}
                            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>{isAr ? 'تم الانتهاء — جاهز للتسليم' : 'Mark as Ready'}</span>
                          </button>
                        )}

                        {isReady && (
                          <button
                            onClick={() => handleStatusChange(order.orderId, 'served')}
                            className="w-full py-2.5 px-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isAr ? 'تم التسليم والتقديم للزبون' : 'Mark as Served'}</span>
                          </button>
                        )}

                        {/* View / Print Digital Receipt */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isAr ? 'طباعة الوصل الإلكتروني' : 'Print / View Receipt'}</span>
                          </button>

                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isReceived
                                ? 'bg-rose-500/20 text-rose-300'
                                : isConfirmedOrPreparing
                                ? 'bg-amber-500/20 text-amber-300'
                                : isReady
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 2: MENU & INVENTORY ======================= */}
        {activeTab === 'menu' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111118] p-4 rounded-2xl border border-white/10">
              <div>
                <h3 className="text-sm font-bold text-neutral-100 font-serif">
                  {isAr ? 'إدارة توفر الأصناف والأسعار' : 'Menu Inventory & Pricing'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isAr
                    ? 'يمكنك بنقرة واحدة إيقاف صنف نفذ من المخزون أو تعديل سعره بالدينار الجزائري مباشرة.'
                    : 'Toggle availability or adjust prices instantly in DA.'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                  {products.filter((p) => p.isAvailable).length} {isAr ? 'متوفر' : 'Available'}
                </span>
                <span className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  {products.filter((p) => !p.isAvailable).length} {isAr ? 'غير متوفر' : 'Out'}
                </span>
              </div>
            </div>

            {/* Products Table/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {products.map((p) => {
                const isEditing = editingPriceId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      p.isAvailable
                        ? 'bg-[#111118] border-white/10 hover:border-white/20'
                        : 'bg-rose-950/10 border-rose-500/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-contain bg-black/40 p-1 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-neutral-100 truncate">
                          {isAr ? p.name : p.nameEn}
                        </h4>
                        <span className="text-[11px] text-neutral-400 block truncate">
                          {p.category} • {p.prepTime}
                        </span>

                        {/* Price Edit Box */}
                        {isEditing ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-16 bg-black text-amber-400 text-xs font-mono font-bold rounded px-1 py-0.5 border border-amber-500/50 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePrice(p.id)}
                              className="p-1 rounded bg-emerald-500 text-neutral-950 text-xs"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded bg-white/10 text-neutral-300 text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-mono font-black text-amber-400">
                              {p.price} دج
                            </span>
                            <button
                              onClick={() => {
                                setEditingPriceId(p.id);
                                setTempPrice(p.price.toString());
                              }}
                              className="text-[10px] text-neutral-400 hover:text-white p-0.5"
                              title={isAr ? 'تعديل السعر' : 'Edit Price'}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Availability Switch */}
                    <button
                      onClick={() => onToggleProductAvailability(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex-shrink-0 ${
                        p.isAvailable
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {p.isAvailable
                        ? isAr
                          ? 'متوفر بالمخزون'
                          : 'In Stock'
                        : isAr
                        ? 'نفذ / غير متوفر'
                        : 'Out of Stock'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 3: STATS & ANALYTICS ======================= */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#111118] p-5 rounded-3xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{isAr ? 'إجمالي المبيعات' : 'Total Revenue'}</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black font-mono text-amber-400">
                  {totalRevenue.toLocaleString()} <span className="text-sm font-semibold">{isAr ? 'دج' : 'DA'}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {isAr ? `من إجمالي ${orders.length} طلبية مسجلة` : `From ${orders.length} total orders`}
                </p>
              </div>

              <div className="bg-[#111118] p-5 rounded-3xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{isAr ? 'توزيع الخدمة' : 'Service Breakdown'}</span>
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-neutral-400 block">{isAr ? 'محلي / طاولات' : 'Dine-in'}</span>
                    <span className="text-xl font-bold font-mono text-neutral-100">{dineInCount}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-neutral-400 block">{isAr ? 'سفري' : 'Takeaway'}</span>
                    <span className="text-xl font-bold font-mono text-neutral-100">{takeawayCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111118] p-5 rounded-3xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{isAr ? 'معدل وقت التحضير' : 'Avg Prep Time'}</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-black font-mono text-purple-400">
                  ~ 8 <span className="text-sm font-semibold">{isAr ? 'دقائق' : 'mins'}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {isAr ? 'سرعة قياسية وجودة عالية في التقديم' : 'Optimal kitchen cadence'}
                </p>
              </div>
            </div>

            {/* Popular Items Leaderboard */}
            <div className="bg-[#111118] p-5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-neutral-100 font-serif">
                    {isAr ? 'الأصناف الأكثر طلباً ومبيعاً' : 'Top Selling Creations'}
                  </h3>
                </div>
                <span className="text-xs text-neutral-400">
                  {isAr ? 'مرتب حسب عدد الطلبات' : 'Ranked by volume'}
                </span>
              </div>

              <div className="space-y-2.5">
                {popularItems.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">
                    {isAr ? 'لم تسجل طلبيات بعد لحساب الترتيب' : 'No sales recorded yet'}
                  </p>
                ) : (
                  popularItems.map(([name, data], idx) => (
                    <div
                      key={name}
                      className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <img
                          src={data.image}
                          alt={name}
                          className="w-10 h-10 object-contain rounded-lg bg-black/40 p-1"
                        />
                        <span className="text-xs font-bold text-neutral-100">{name}</span>
                      </div>

                      <div className="text-end">
                        <span className="text-xs font-mono font-bold text-amber-400 block">
                          {data.count} {isAr ? 'مرات طلب' : 'orders'}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {data.totalRev} دج
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: STORE SETTINGS ======================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-[#111118] p-6 rounded-3xl border border-white/10 space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-serif">
                {isAr ? 'إعدادات المتجر والطاولات' : 'Store & Dining Settings'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isAr ? 'تعديل بيانات المطعم ووقت الانتظار' : 'Manage restaurant status and options'}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Store open status */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <span className="font-bold text-neutral-200 block">
                    {isAr ? 'حالة استقبال الطلبات' : 'Accepting Orders'}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {storeInfo.isOpen
                      ? isAr
                        ? 'المقهى مفتوح ويستقبل الطلبات'
                        : 'Open and receiving orders'
                      : isAr
                      ? 'المقهى مغلق حالياً'
                      : 'Store closed'}
                  </span>
                </div>
                <button
                  onClick={() => onUpdateStoreInfo({ isOpen: !storeInfo.isOpen })}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    storeInfo.isOpen
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {storeInfo.isOpen ? (isAr ? 'مفتوح الآن' : 'Open') : isAr ? 'مغلق' : 'Closed'}
                </button>
              </div>

              {/* Default Prep Time Estimate */}
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold">
                  {isAr ? 'متوسط وقت التحضير التقديري' : 'Default Prep Time Estimate'}
                </label>
                <input
                  type="text"
                  value={storeInfo.prepTimeEstimate}
                  onChange={(e) => onUpdateStoreInfo({ prepTimeEstimate: e.target.value })}
                  className="w-full bg-black/40 text-neutral-200 rounded-xl p-2.5 border border-white/10 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              {/* Sound Test Button */}
              <div className="pt-2">
                <button
                  onClick={() => sounds.playKitchenBell()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-semibold border border-white/10"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'تجربة جرس المطبخ' : 'Test Kitchen Bell Chime'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Digital Receipt Modal View */}
      <AnimatePresence>
        {selectedReceiptOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceiptOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-neutral-900 text-neutral-100 p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4 font-mono text-xs"
            >
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-white/20">
                <h4 className="font-bold text-sm font-serif text-amber-400">
                  {isAr ? storeInfo.name : storeInfo.nameEn}
                </h4>
                <p className="text-[10px] text-neutral-400">{storeInfo.location}</p>
                <div className="font-bold text-xs pt-1">{selectedReceiptOrder.orderId}</div>
                <div className="text-[10px] text-neutral-400">
                  {new Date(selectedReceiptOrder.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Table / Customer */}
              <div className="text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>{isAr ? 'الخدمة:' : 'Mode:'}</span>
                  <span>
                    {selectedReceiptOrder.diningMode === 'dine-in'
                      ? isAr
                        ? `طاولة ${selectedReceiptOrder.tableNumber}`
                        : `Table ${selectedReceiptOrder.tableNumber}`
                      : isAr
                      ? 'سفري'
                      : 'Takeaway'}
                  </span>
                </div>
                {selectedReceiptOrder.customerName && (
                  <div className="flex justify-between">
                    <span>{isAr ? 'العميل:' : 'Customer:'}</span>
                    <span>{selectedReceiptOrder.customerName}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="py-2 border-y border-dashed border-white/20 space-y-1.5 text-[11px]">
                {selectedReceiptOrder.items.map((i) => (
                  <div key={i.cartItemId} className="flex justify-between">
                    <span>
                      {i.quantity}x {isAr ? i.product.name : i.product.nameEn}
                    </span>
                    <span>{i.totalPrice} DA</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 pt-1 font-bold text-xs">
                <div className="flex justify-between text-amber-400 text-sm">
                  <span>TOTAL:</span>
                  <span>{selectedReceiptOrder.total} DA</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-neutral-400 pt-2">
                *** {isAr ? 'شكراً لزيارتكم' : 'Thank you for your visit'} ***
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة' : 'Print'}</span>
                </button>
                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-bold"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
