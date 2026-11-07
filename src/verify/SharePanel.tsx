import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy } from 'lucide-react';
import { useT } from './ui';

export const SharePanel: React.FC<{ url: string }> = ({ url }) => {
  const { t } = useT();
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);

  useEffect(() => {
    let live = true;
    QRCode.toDataURL(url, { width: 360, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#172521', light: '#FFFFFF' } })
      .then((d) => live && setQr(d))
      .catch(() => live && setQr(null));
    return () => {
      live = false;
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.setTimeout(() => setCopied(null), 2200);
  };

  return (
    <section aria-labelledby="vf-share" className="rounded-2xl border border-[#172521]/12 bg-white p-4 flex items-center gap-4">
      <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl border border-[#172521]/10 bg-white grid place-items-center overflow-hidden">
        {qr ? <img src={qr} alt={t('QR code for this journey page', 'এই যাত্রা পেজের QR কোড')} width={128} height={128} className="w-full h-full" /> : <span className="vf-skeleton w-full h-full" aria-hidden="true" />}
      </div>
      <div className="min-w-0 space-y-2">
        <h2 id="vf-share" className="font-display text-lg font-bold leading-tight text-[#172521]">
          {t('This is what goes on the bottle', 'বোতলে এটাই থাকবে')}
        </h2>
        <p className="text-xs text-[#5B6B66] leading-snug">{t('Scan to open this page. No app, no login.', 'স্ক্যান করলেই এই পেজ খুলবে। অ্যাপ বা লগইন লাগে না।')}</p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 min-h-11 px-3.5 rounded-full border border-[#124B3A] text-[#124B3A] text-sm font-semibold hover:bg-[#124B3A]/5 cursor-pointer"
        >
          {copied === 'ok' ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
          {copied === 'ok' ? t('Link copied', 'লিংক কপি হয়েছে') : t('Copy link', 'লিংক কপি')}
        </button>
        <p role="status" className="text-xs text-[#B42318] min-h-4">
          {copied === 'fail' ? t('Could not copy — select the link manually.', 'কপি করা যায়নি — হাতে লিংক নির্বাচন করুন।') : ''}
        </p>
      </div>
    </section>
  );
};
