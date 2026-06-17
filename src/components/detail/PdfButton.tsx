'use client';

import { useTranslations } from 'next-intl';
import { FileDown } from 'lucide-react';

/**
 * Generates a clean one-page PDF via the browser's print dialog ("Save as PDF").
 * A dedicated print stylesheet (see globals.css `@media print`) hides the nav,
 * footer, gallery thumbnails and forms, leaving a tidy property sheet.
 * Can be swapped for a server-side react-pdf renderer later if needed.
 */
export default function PdfButton() {
  const t = useTranslations('detail');
  return (
    <button type="button" onClick={() => window.print()} className="btn-outline !text-navy !border-navy/30 hover:!bg-navy hover:!text-white print:hidden">
      <FileDown className="h-4 w-4" />
      {t('pdfDownload')}
    </button>
  );
}
