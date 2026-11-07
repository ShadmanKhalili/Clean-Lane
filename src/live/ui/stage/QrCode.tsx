import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** Crisp SVG QR on a light tile (high contrast for projectors and phone cameras). */
export const QrCode: React.FC<{ url: string; size: number | string; label: string }> = ({ url, size, label }) => {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let live = true;
    QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0B1A15', light: '#F4F7EF' } })
      .then((s) => live && setSvg(s.replace('<svg ', '<svg width="100%" height="100%" ')))
      .catch(() => live && setSvg(''));
    return () => {
      live = false;
    };
  }, [url]);
  return (
    <div
      role="img"
      aria-label={`${label}: ${url}`}
      className="aspect-square overflow-hidden rounded-[6%] bg-[#F4F7EF] p-[2.5%] shadow-[0_0_0_1px_rgba(203,234,112,.25),0_20px_60px_-20px_rgba(203,234,112,.35)]"
      style={{ width: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
