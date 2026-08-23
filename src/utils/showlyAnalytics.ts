export type ShowlyEvent = 'store_view' | 'product_view' | 'whatsapp_click' | 'share_click';

const keyFor = (storeSlug: string, event: ShowlyEvent) => `showly:analytics:${storeSlug}:${event}`;

export function trackShowlyEvent(storeSlug: string, event: ShowlyEvent) {
  if (typeof window === 'undefined') return;
  const key = keyFor(storeSlug, event);
  const nextValue = Number(window.localStorage.getItem(key) || 0) + 1;
  window.localStorage.setItem(key, String(nextValue));
}

export function readShowlyEvent(storeSlug: string, event: ShowlyEvent, fallback = 0) {
  if (typeof window === 'undefined') return fallback;
  const value = Number(window.localStorage.getItem(keyFor(storeSlug, event)) || 0);
  return value || fallback;
}

export function readShowlyStoreMetrics(storeSlug: string, defaults: { views: number; interactions: number }) {
  const views = readShowlyEvent(storeSlug, 'store_view', defaults.views);
  const productViews = readShowlyEvent(storeSlug, 'product_view');
  const whatsappClicks = readShowlyEvent(storeSlug, 'whatsapp_click');
  const shareClicks = readShowlyEvent(storeSlug, 'share_click');
  return { views, interactions: Math.max(defaults.interactions, productViews + whatsappClicks + shareClicks) };
}
