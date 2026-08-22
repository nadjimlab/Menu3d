import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PRODUCTS, CATEGORIES, STORE_INFO, INITIAL_ORDERS } from './data/mockData';
import {
  Product,
  CartItem,
  SelectedOption,
  OrderDetails,
  StoreInfo,
  OrderStatus,
  PaymentMethod,
} from './types';
import { QRSimulatorBar } from './components/QRSimulatorBar';
import { StoreIntro } from './components/StoreIntro';
import { DiscoveryScreen } from './components/DiscoveryScreen';
import { ProductHero } from './components/ProductHero';
import { ProductDetailsSheet } from './components/ProductDetailsSheet';
import { CartDrawer } from './components/CartDrawer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { sounds } from './utils/soundEffects';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(STORE_INFO);
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [ordersList, setOrdersList] = useState<OrderDetails[]>(INITIAL_ORDERS);

  // Navigation Screens: 'intro' | 'discovery' | 'hero' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState<
    'intro' | 'discovery' | 'hero' | 'dashboard'
  >(() => {
    const autoSkip = localStorage.getItem('digimenu_auto_skip');
    return autoSkip === 'true' ? 'discovery' : 'intro';
  });

  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(0);
  const [activeDetailsProduct, setActiveDetailsProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // Sync RTL / LTR document direction with language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Handle popstate for back button navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen) {
        setCurrentScreen(e.state.screen);
      } else {
        setCurrentScreen('discovery');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Product Selection from Discovery with history push
  const handleSelectProduct = (product: Product) => {
    const index = productsList.findIndex((p) => p.id === product.id);
    setSelectedProductIndex(index >= 0 ? index : 0);
    try {
      window.history.pushState({ screen: 'hero' }, '', '#hero');
    } catch {
      // safe fallback
    }
    setCurrentScreen('hero');
  };

  const handleBackToDiscovery = () => {
    if (window.location.hash === '#hero') {
      window.history.back();
    } else {
      setCurrentScreen('discovery');
    }
  };

  // Add standard product directly to cart
  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedOptions.length === 0
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentItem = updated[existingIdx];
        const newQty = currentItem.quantity + quantity;
        updated[existingIdx] = {
          ...currentItem,
          quantity: newQty,
          totalPrice: currentItem.unitPrice * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId: `${product.id}-${Date.now()}`,
          product,
          quantity,
          selectedOptions: [],
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        };
        return [...prev, newItem];
      }
    });
  };

  // Add customized product with options to cart
  const handleAddToCartWithOptions = (
    product: Product,
    quantity: number,
    selectedOptions: SelectedOption[],
    specialNotes?: string
  ) => {
    const extraPrice = selectedOptions.reduce((sum, opt) => sum + opt.extraPrice, 0);
    const unitPrice = product.price + extraPrice;

    const newItem: CartItem = {
      cartItemId: `${product.id}-${Date.now()}`,
      product,
      quantity,
      selectedOptions,
      specialNotes,
      unitPrice,
      totalPrice: unitPrice * quantity,
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            }
          : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Customer Sends & Confirms Order
  const handleProceedToOrder = (
    tableNumber: string,
    diningMode: 'dine-in' | 'takeaway',
    notes: string,
    customerName?: string,
    customerPhone?: string,
    paymentMethod: PaymentMethod = 'cash'
  ) => {
    const subtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const newOrder: OrderDetails = {
      orderId: `#DM-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cartItems],
      subtotal,
      tax: 0,
      total: subtotal,
      tableNumber,
      diningMode,
      customerName,
      customerPhone,
      paymentMethod,
      notes,
      createdAt: new Date(),
      status: 'received',
      estimatedMinutes: 8,
    };

    // Prepend new order to live kitchen orders
    setOrdersList((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setIsCartOpen(false);
    setIsOrderModalOpen(true);
    setCartItems([]);
  };

  // Kitchen / Manager updates order status
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    adjustedMinutes?: number
  ) => {
    setOrdersList((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          const updated: OrderDetails = {
            ...o,
            status: newStatus,
            estimatedMinutes: adjustedMinutes
              ? o.estimatedMinutes + adjustedMinutes
              : o.estimatedMinutes,
            confirmedAt: newStatus === 'confirmed' ? new Date() : o.confirmedAt,
            readyAt: newStatus === 'ready' ? new Date() : o.readyAt,
            servedAt: newStatus === 'served' ? new Date() : o.servedAt,
          };
          return updated;
        }
        return o;
      })
    );

    // Sync live customer modal if active
    if (confirmedOrder && confirmedOrder.orderId === orderId) {
      setConfirmedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              estimatedMinutes: adjustedMinutes
                ? prev.estimatedMinutes + adjustedMinutes
                : prev.estimatedMinutes,
            }
          : null
      );
    }
  };

  // Product Inventory Control Handlers
  const handleToggleProductAvailability = (productId: string) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
  };

  const handleUpdateStoreInfo = (updated: Partial<StoreInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...updated }));
  };

  const activeOrdersCount = ordersList.filter((o) => o.status === 'received').length;

  return (
    <div className="min-h-screen bg-[#07070b] text-neutral-100 flex flex-col antialiased">
      {/* Top QR Simulator & Language Bar */}
      <QRSimulatorBar
        storeInfo={storeInfo}
        onUpdateTable={(tbl) => setStoreInfo((s) => ({ ...s, tableNumber: tbl }))}
        onUpdateDiningMode={(mode) => setStoreInfo((s) => ({ ...s, diningMode: mode }))}
        onResetToIntro={() => setCurrentScreen('intro')}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
        onOpenDashboard={() => setCurrentScreen('dashboard')}
        activeOrdersCount={activeOrdersCount}
        currentOrder={confirmedOrder}
        onOpenCurrentOrderModal={() => setIsOrderModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === 'intro' && (
            <motion.div
              key="screen-intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <StoreIntro
                storeInfo={storeInfo}
                onStartDiscovery={() => setCurrentScreen('discovery')}
                lang={lang}
              />
            </motion.div>
          )}

          {currentScreen === 'discovery' && (
            <motion.div
              key="screen-discovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <DiscoveryScreen
                products={productsList}
                categories={CATEGORIES}
                storeInfo={storeInfo}
                cartItems={cartItems}
                onSelectProduct={handleSelectProduct}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenDashboard={() => setCurrentScreen('dashboard')}
                activeOrdersCount={activeOrdersCount}
                lang={lang}
              />
            </motion.div>
          )}

          {currentScreen === 'hero' && (
            <motion.div
              key="screen-hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full"
            >
              <ProductHero
                products={productsList}
                currentProductIndex={selectedProductIndex}
                onNavigateProduct={(idx) => setSelectedProductIndex(idx)}
                onBackToDiscovery={handleBackToDiscovery}
                onOpenDetails={(prod) => {
                  setActiveDetailsProduct(prod);
                  setIsDetailsOpen(true);
                }}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
                cartItems={cartItems}
                storeInfo={storeInfo}
                lang={lang}
              />
            </motion.div>
          )}

          {currentScreen === 'dashboard' && (
            <motion.div
              key="screen-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="w-full min-h-full"
            >
              <AdminDashboard
                orders={ordersList}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                products={productsList}
                onToggleProductAvailability={handleToggleProductAvailability}
                onUpdateProductPrice={handleUpdateProductPrice}
                storeInfo={storeInfo}
                onUpdateStoreInfo={handleUpdateStoreInfo}
                onCloseDashboard={() => setCurrentScreen('discovery')}
                lang={lang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Glassmorphic Product Details Sheet */}
      <ProductDetailsSheet
        product={activeDetailsProduct}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAddToCartWithOptions={handleAddToCartWithOptions}
        lang={lang}
      />

      {/* Cart Drawer with Send & Confirm Flow */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToOrder={handleProceedToOrder}
        storeInfo={storeInfo}
        lang={lang}
      />

      {/* Order Confirmation Live Tracker Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onNewOrder={() => {
          setIsOrderModalOpen(false);
          setCurrentScreen('discovery');
        }}
        lang={lang}
      />
    </div>
  );
}
