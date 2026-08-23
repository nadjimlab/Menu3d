import { SHOWLY_STORES } from './data/mockData';
import { ShowlyAdminDashboard } from './components/ShowlyAdminDashboard';
import { ShowlyLanding } from './components/ShowlyLanding';
import { ShowlyStorefront } from './components/ShowlyStorefront';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const isAdmin = path === `${basePath}/admin` || params.get('admin') === '1';
  const requestedSlug = params.get('store') || (path.startsWith(`${basePath}/s/`) ? path.slice(`${basePath}/s/`.length) : '');
  const selectedStore = SHOWLY_STORES.find((store) => store.slug === requestedSlug);

  if (isAdmin) return <ShowlyAdminDashboard />;
  if (selectedStore) return <ShowlyStorefront store={selectedStore} />;
  return <ShowlyLanding />;
}
