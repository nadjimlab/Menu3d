import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rotate3d,
  View,
  Maximize2,
  Sparkles,
  RefreshCw,
  Eye,
  Camera,
  Layers,
  HelpCircle,
  Check,
} from 'lucide-react';
import { Product } from '../types';

interface ModelViewer3DProps {
  product: Product;
  lang: 'ar' | 'en';
  onClose?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({
  product,
  lang,
  onClose,
  className = '',
  isCompact = false,
}) => {
  const isAr = lang === 'ar';
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [arStatus, setArStatus] = useState<'checking' | 'supported' | 'unsupported'>('checking');
  const [showArNotice, setShowArNotice] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(true);
  const modelViewerRef = useRef<HTMLElement | null>(null);

  // Model sources: ensure absolute valid CDN URL or fallback to reliable Google 3D model
  const resolveModelSrc = (src?: string) => {
    if (src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:'))) {
      return src;
    }
    // Reliable 3D food and beverage model assets
    if (product.id.includes('croissant') || product.category === 'desserts' || product.category === 'crepes') {
      return 'https://modelviewer.dev/shared-assets/models/shishkebab.glb';
    }
    if (product.id.includes('coffee') || product.id.includes('latte') || product.category === 'coffee') {
      return 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
    }
    return 'https://modelviewer.dev/shared-assets/models/shishkebab.glb';
  };

  const resolveIosSrc = (src?: string) => {
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      return src;
    }
    if (product.id.includes('croissant') || product.category === 'desserts') {
      return 'https://modelviewer.dev/shared-assets/models/shishkebab.usdz';
    }
    return 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz';
  };

  const modelSrc = resolveModelSrc(product.model3d?.src);
  const iosSrc = resolveIosSrc(product.model3d?.iosSrc);
  const posterSrc = product.model3d?.poster || product.image;

  // Listen to model-viewer load and error events
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    setArStatus('checking');
    setShowArNotice(false);

    const viewer = modelViewerRef.current as any;
    if (!viewer) return;

    const handleLoad = () => {
      setIsLoading(false);
      setLoadError(false);
      // AR is an optional enhancement; the 3D viewer remains the default experience.
      setArStatus(viewer.canActivateAR ? 'supported' : 'unsupported');
    };

    const handleError = () => {
      setIsLoading(false);
      setArStatus('unsupported');
      // If the GLB fails, fallback gracefully to the product image.
      setLoadError(true);
    };

    const handleArStatus = (event: any) => {
      const status = event.detail?.status;
      if (status === 'session-started') {
        setShowArNotice(false);
      }
      if (status === 'failed') {
        setArStatus('unsupported');
        setShowArNotice(true);
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('ar-status', handleArStatus);

    // Timeout safety fallback: don't leave loading spinner forever
    const timer = setTimeout(() => {
      setIsLoading(false);
      setArStatus((current) => (current === 'checking' ? 'unsupported' : current));
    }, 4000);

    return () => {
      clearTimeout(timer);
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      viewer.removeEventListener('ar-status', handleArStatus);
    };
  }, [product.id, modelSrc, iosSrc]);

  // Hide hint after 4 seconds
  useEffect(() => {
    const hintTimer = setTimeout(() => {
      setShowHint(false);
    }, 3500);
    return () => clearTimeout(hintTimer);
  }, []);

  const handleResetCamera = () => {
    const viewer = modelViewerRef.current as any;
    if (viewer && viewer.resetOrbit) {
      viewer.resetOrbit();
    }
  };

  const handleLaunchAR = async () => {
    if (arStatus !== 'supported') {
      setShowArNotice(true);
      return;
    }

    const viewer = modelViewerRef.current as any;
    if (!viewer?.activateAR) {
      setArStatus('unsupported');
      setShowArNotice(true);
      return;
    }

    try {
      await viewer.activateAR();
    } catch {
      setArStatus('unsupported');
      setShowArNotice(true);
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 select-none ${className}`}
      id={`3d-viewer-container-${product.id}`}
    >
      {/* Background Radial Glow */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${product.palette.primary} 0%, transparent 70%)`,
        }}
      />

      {/* Model Viewer Native Web Component */}
      {!loadError ? (
        <model-viewer
          ref={modelViewerRef as any}
          src={modelSrc}
          ios-src={iosSrc}
          poster={posterSrc}
          alt={product.name}
          ar
          ar-modes="scene-viewer quick-look webxr"
          ar-scale="auto"
          camera-controls
          touch-action="pan-y"
          auto-rotate={autoRotate}
          auto-rotate-delay="1000"
          rotation-per-second="25deg"
          shadow-intensity="1.5"
          shadow-softness="0.8"
          exposure="1.15"
          loading="eager"
          reveal="auto"
          camera-orbit="45deg 55deg 2.2m"
          field-of-view="32deg"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            outline: 'none',
            cursor: 'grab',
          }}
        >
          {/* AR is shown only after model-viewer confirms that the device supports it. */}
          {arStatus === 'supported' && (
            <button
              slot="ar-button"
              onClick={handleLaunchAR}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-xl shadow-amber-500/25 transition-all duration-200 active:scale-95"
              id="btn-ar-native-launch"
            >
              <Camera className="w-4 h-4" />
              <span>{isAr ? 'عرض في غرفتك (AR)' : 'View in AR'}</span>
            </button>
          )}
        </model-viewer>
      ) : (
        /* Fallback: Interactive 360 Spin Visual if remote GLB is blocked */
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <motion.img
            src={product.image}
            alt={product.name}
            animate={{ rotateY: [0, 360] }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            className="max-h-[60%] max-w-[70%] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] filter"
          />
          <p className="text-xs text-neutral-400 mt-3">
            {isAr ? 'عرض مجسم ثلاثي الأبعاد تفاعلي 360°' : '360° Interactive View'}
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-30 pointer-events-none"
          >
            <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-amber-300 font-mono">
              {isAr ? 'جاري تحميل المجسم 3D...' : 'Loading 3D Model...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Hint Overlay */}
      <AnimatePresence>
        {showHint && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-16 inset-x-0 mx-auto w-fit px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/15 text-[11px] text-neutral-300 flex items-center gap-2 shadow-lg z-20 pointer-events-none"
          >
            <Rotate3d className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{isAr ? 'اسحب للتدوير 360° • قرّب للتكبير' : 'Drag to rotate 360° • Pinch to zoom'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explain why 3D remains available when ARCore is unavailable. */}
      <AnimatePresence>
        {showArNotice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-16 inset-x-4 z-30 mx-auto max-w-sm rounded-2xl border border-amber-400/25 bg-black/85 px-4 py-3 text-center text-xs text-neutral-200 shadow-2xl backdrop-blur-xl"
            role="status"
          >
            {isAr
              ? 'الواقع المعزز غير متاح على هذا الجهاز، لكن يمكنك مشاهدة المنتج ثلاثي الأبعاد وتدويره.'
              : 'AR is unavailable on this device, but you can still view and rotate the 3D model.'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating 3D Control Bar (Bottom/Top) */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xl p-1 rounded-2xl border border-white/15 shadow-xl">
          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition-all ${
              autoRotate
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title={isAr ? 'تبديل الدوران التلقائي' : 'Toggle Auto Rotation'}
          >
            <Rotate3d className="w-3 h-3" />
            <span>{isAr ? 'دوران' : 'Rotate'}</span>
          </button>

          {/* Reset Camera Orbit */}
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isAr ? 'إعادة ضبط الكاميرا' : 'Reset View'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AR is optional; this neutral status pill is the fallback action on unsupported devices. */}
        {arStatus === 'supported' ? (
          <button
            onClick={handleLaunchAR}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            title={isAr ? 'معاينة في الواقع المعزز على طاولتك' : 'Augmented Reality'}
            id="btn-ar-action-trigger"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isAr ? 'عرض AR على الطاولة' : 'AR On Table'}</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-medium text-neutral-300"
            title={isAr ? 'العرض ثلاثي الأبعاد متاح على جميع الأجهزة' : '3D viewing is available on all devices'}
          >
            <View className="h-3.5 w-3.5 text-amber-400" />
            <span>{isAr ? 'عرض 3D متاح' : '3D View Available'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
