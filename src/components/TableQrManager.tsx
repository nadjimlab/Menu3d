import { ExternalLink, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { RESTAURANT_TABLES } from '../data/mockData';

interface TableQrManagerProps {
  lang: 'ar' | 'en';
  storeName: string;
}

const buildTableUrl = (tableId: string) => {
  const url = new URL(window.location.href);
  const basePath = import.meta.env.BASE_URL;
  url.pathname = basePath;
  url.hash = '';
  url.searchParams.delete('admin');
  url.searchParams.set('table', tableId);
  url.searchParams.set('mode', 'dine-in');
  return url.toString();
};

export const TableQrManager: React.FC<TableQrManagerProps> = ({ lang, storeName }) => {
  const isAr = lang === 'ar';

  return (
    <section className="space-y-5 print:bg-white print:text-black">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-neutral-100 font-serif print:text-black">
              {isAr ? 'QR الطاولات' : 'Table QR Codes'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-400 print:text-neutral-600">
            {isAr
              ? 'كل رمز يفتح القائمة ويربط الطلب بالطاولة المحددة تلقائياً.'
              : 'Each code opens the menu and assigns orders to its table automatically.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400 print:hidden"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>{isAr ? 'طباعة كل الرموز' : 'Print all codes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESTAURANT_TABLES.filter((table) => table.isActive).map((table) => {
          const tableUrl = buildTableUrl(table.id);
          return (
            <article
              key={table.id}
              className="qr-print-card rounded-3xl border border-white/10 bg-[#111118] p-4 text-center shadow-xl print:border-black print:bg-white print:shadow-none"
            >
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-100 print:text-black">
                  {isAr ? table.label : table.labelEn}
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-300 print:text-emerald-700">
                  {table.seats} {isAr ? 'مقاعد' : 'seats'}
                </span>
              </div>

              <div className="mx-auto w-fit rounded-2xl bg-white p-3">
                <QRCodeSVG value={tableUrl} size={164} level="M" includeMargin />
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-sm font-bold text-amber-400 print:text-black">
                  {isAr ? table.zone : table.zoneEn}
                </p>
                <p className="text-[10px] text-neutral-500 print:text-neutral-600">{storeName}</p>
                <a
                  href={tableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-neutral-300 hover:text-amber-300 print:hidden"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>{isAr ? 'فتح رابط الطاولة' : 'Open table link'}</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
