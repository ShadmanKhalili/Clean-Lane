import React from 'react';
import { AlertTriangle, ArrowUpRight, Check, CircleHelp, Factory, Link2, Recycle, Split, Unlink } from 'lucide-react';
import { shortHash } from '../domain/hashChain';
import { verifyLotUrl } from '../live/routes';
import { fmtKg, type Stop, type StopStatus } from './journey';
import { EvidenceTag } from './Hero';
import { formatWhen, useT } from './ui';

export interface ShownStop {
  stop: Stop;
  status: StopStatus;
  /** Original weight, set when the presenter's tampering demo edited this record. */
  wasKg?: number;
  kg?: number;
}

const Node: React.FC<{ stop: Stop; status: StopStatus }> = ({ stop, status }) => {
  const base = 'relative z-10 grid place-items-center w-9 h-9 rounded-full border-2 shrink-0';
  if (status === 'altered')
    return (
      <span className={`${base} bg-[#B42318] border-[#B42318] text-white`} aria-hidden="true">
        <AlertTriangle className="w-4 h-4" />
      </span>
    );
  if (status === 'unproven')
    return (
      <span className={`${base} bg-white border-[#B42318] border-dashed text-[#B42318]`} aria-hidden="true">
        <CircleHelp className="w-4 h-4" />
      </span>
    );
  if (stop.kind === 'sorting')
    return (
      <span className={`${base} bg-[#CBEA70] border-[#124B3A] text-[#124B3A]`} aria-hidden="true">
        <Split className="w-4 h-4" />
      </span>
    );
  if (stop.kind === 'processing')
    return (
      <span className={`${base} bg-[#124B3A] border-[#124B3A] text-[#CBEA70]`} aria-hidden="true">
        <Recycle className="w-4 h-4" />
      </span>
    );
  return (
    <span className={`${base} bg-[#124B3A] border-[#124B3A] text-white`} aria-hidden="true">
      <Check className="w-4 h-4" strokeWidth={3} />
    </span>
  );
};

const HashRow: React.FC<{ stop: Stop; status: StopStatus; prevStop?: Stop }> = ({ stop, status, prevStop }) => {
  const { t } = useT();
  if (!stop.hash) return null;
  const bad = status === 'altered' || status === 'unproven';
  const linkText =
    stop.linkTo === 'start'
      ? t('start of chain', 'চেইনের শুরু')
      : stop.linkTo === 'parent'
        ? t('parent lot’s last record', 'মূল লটের শেষ রেকর্ড')
        : prevStop?.recordIndex !== undefined
          ? t(`record ${prevStop.recordIndex + 1}`, `রেকর্ড ${prevStop.recordIndex + 1}`)
          : t('previous record', 'আগের রেকর্ড');
  return (
    <div className={`mt-3 rounded-lg px-2.5 py-2 text-[11px] leading-5 ${bad ? 'bg-[#B42318]/8' : 'bg-[#172521]/[0.04]'}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="inline-flex items-center gap-1 text-[#5B6B66]">
          {bad ? <Unlink className="w-3 h-3" aria-hidden="true" /> : <Link2 className="w-3 h-3" aria-hidden="true" />}
          {t('Fingerprint', 'ফিঙ্গারপ্রিন্ট')}
        </span>
        <code className={`font-mono font-semibold ${bad ? 'text-[#B42318]' : 'text-[#172521]'}`}>{shortHash(stop.hash)}</code>
        {bad && <span className="font-semibold text-[#B42318]">{t('does not match', 'মিলছে না')}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 text-[#5B6B66]">
        <span aria-hidden="true">←</span>
        <span>{t('links to', 'যুক্ত')}</span>
        {stop.prevHash && stop.linkTo !== 'start' && <code className="font-mono">{shortHash(stop.prevHash)}</code>}
        <span>({linkText})</span>
      </div>
    </div>
  );
};

const StopBody: React.FC<{ s: ShownStop; prevStop?: Stop }> = ({ s, prevStop }) => {
  const { t, bi, lang } = useT();
  const { stop, status } = s;
  const bad = status === 'altered' || status === 'unproven';
  return (
    <div
      className={`rounded-2xl border p-4 ${
        status === 'altered'
          ? 'border-[#B42318] bg-[#FFF5F3] shadow-[0_0_0_3px_rgba(180,35,24,0.12)]'
          : status === 'unproven'
            ? 'border-[#B42318]/40 bg-[#FFF9F8] vf-hatch'
            : stop.kind === 'record'
              ? 'border-[#172521]/12 bg-white'
              : 'border-[#124B3A]/25 bg-[#F4F8E8]'
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#5B6B66]">
        {stop.recordIndex !== undefined && (
          <span className="font-semibold tracking-wider uppercase text-[#172521]">{t(`Record ${stop.recordIndex + 1}`, `রেকর্ড ${stop.recordIndex + 1}`)}</span>
        )}
        <time dateTime={stop.at}>{formatWhen(stop.at, lang)}</time>
        {stop.evidence && <EvidenceTag level={stop.evidence} />}
        {status === 'altered' && (
          <span className="inline-flex items-center gap-1 px-1.5 py-px rounded bg-[#B42318] text-white font-bold tracking-wider uppercase text-[10px]">
            <AlertTriangle className="w-3 h-3" aria-hidden="true" />
            {t('Altered', 'পরিবর্তিত')}
          </span>
        )}
        {status === 'unproven' && (
          <span className="inline-flex items-center gap-1 px-1.5 py-px rounded border border-[#B42318] text-[#B42318] font-bold tracking-wider uppercase text-[10px]">
            <CircleHelp className="w-3 h-3" aria-hidden="true" />
            {t('Unproven', 'অপ্রমাণিত')}
          </span>
        )}
      </div>

      <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-[#172521] mt-1">{bi(stop.title)}</h3>

      {stop.kind === 'record' && (
        <div className="mt-1 space-y-0.5 text-sm text-[#172521]/80">
          {stop.who && <p className="break-words">{stop.who}</p>}
          {stop.where && <p className="text-[#5B6B66] break-words">{stop.where}</p>}
          {s.kg !== undefined && (
            <p className="pt-1">
              <span className={`font-display text-xl font-bold ${bad ? 'text-[#B42318]' : 'text-[#172521]'}`}>{fmtKg(s.kg)}</span>
              {s.wasKg !== undefined && (
                <span className="ml-2 text-xs text-[#5B6B66]">
                  {t('was', 'আগে ছিল')} <s>{fmtKg(s.wasKg)}</s>
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {stop.kind === 'sorting' && (
        <div className="mt-1 text-sm text-[#172521]/80 space-y-3">
          <p className="text-[#5B6B66]">
            {stop.where} · {t('input', 'ইনপুট')} {stop.inputKg !== undefined && fmtKg(stop.inputKg)}
          </p>
          <ul className="space-y-2">
            {stop.split?.map((o) => (
              <li key={o.lotId} className={`rounded-xl border px-3 py-2 ${o.isThis ? 'border-[#124B3A] bg-white' : 'border-[#172521]/12 bg-white/60'}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{o.label}</span>
                  <span className="font-display font-bold whitespace-nowrap">{fmtKg(o.kg)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#5B6B66]">
                  <span>→ {o.destination}</span>
                  {o.isThis ? (
                    <span className="font-semibold text-[#124B3A]">{t('This bag', 'এই ব্যাগ')}</span>
                  ) : (
                    <a href={verifyLotUrl(o.lotId)} className="inline-flex items-center gap-0.5 underline underline-offset-2 text-[#124B3A] min-h-6">
                      {t('Sibling lot', 'সহোদর লট')} <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {stop.residueKg !== undefined && stop.residueKg > 0 && (
            <p className="text-xs text-[#5B6B66]">
              {t('Not recyclable', 'পুনর্ব্যবহারযোগ্য নয়')}: {fmtKg(stop.residueKg)} — {t('every gram accounted for, sent to an authorised facility.', 'প্রতিটি গ্রামের হিসাব আছে, অনুমোদিত কেন্দ্রে পাঠানো হয়েছে।')}
            </p>
          )}
        </div>
      )}

      {stop.kind === 'processing' && (
        <div className="mt-1 text-sm text-[#172521]/80 space-y-2">
          <p className="text-[#5B6B66]">{stop.where}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white border border-[#172521]/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[#5B6B66] font-semibold">{t('Recycled output', 'রিসাইকেলকৃত আউটপুট')}</p>
              <p className="font-display text-lg font-bold text-[#124B3A]">{stop.yieldKg !== undefined && fmtKg(stop.yieldKg)}</p>
            </div>
            <div className="rounded-xl bg-white border border-[#172521]/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[#5B6B66] font-semibold">{t('Process loss', 'প্রক্রিয়ায় ক্ষতি')}</p>
              <p className="font-display text-lg font-bold">{stop.lossKg !== undefined && fmtKg(stop.lossKg)}</p>
            </div>
          </div>
          <p className="text-xs text-[#5B6B66]">
            {t('Disposition certificate', 'নিষ্পত্তি সনদ')} <code className="font-mono">{stop.certificate}</code>
          </p>
        </div>
      )}

      {stop.kind === 'record' && <HashRow stop={stop} status={status} prevStop={prevStop} />}
    </div>
  );
};

export const Timeline: React.FC<{ shown: ShownStop[]; parentLotId?: string }> = ({ shown, parentLotId }) => {
  const { t } = useT();
  const records = shown.filter((s) => s.stop.kind === 'record');
  return (
    <section aria-labelledby="vf-journey" className="space-y-4">
      <h2 id="vf-journey" className="font-display text-2xl font-bold text-[#172521] flex items-center gap-2">
        <Factory className="w-5 h-5 text-[#124B3A]" aria-hidden="true" />
        {t('From doorstep to recycler', 'দরজা থেকে রিসাইক্লার পর্যন্ত')}
      </h2>

      {parentLotId && (
        <a
          href={verifyLotUrl(parentLotId)}
          className="flex items-center justify-between gap-3 rounded-xl border border-[#124B3A]/25 bg-[#F4F8E8] px-4 min-h-12 py-2 text-sm text-[#124B3A] font-medium"
        >
          <span>
            {t('Continued from parent lot', 'মূল লট থেকে চলমান')} <code className="font-mono">{parentLotId}</code>
          </span>
          <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </a>
      )}

      <ol className="relative">
        {shown.map((s, i) => {
          const prev = records.filter((r) => r.stop.recordIndex !== undefined && s.stop.recordIndex !== undefined && r.stop.recordIndex === s.stop.recordIndex - 1)[0]?.stop;
          const last = i === shown.length - 1;
          const lineBad = s.status === 'altered' || s.status === 'unproven';
          return (
            <li key={s.stop.key} className="vf-rise relative flex gap-3 pb-5 last:pb-0" style={{ '--i': i } as React.CSSProperties}>
              <div className="flex flex-col items-center w-9 shrink-0">
                <Node stop={s.stop} status={s.status} />
                {!last && (
                  <span
                    aria-hidden="true"
                    className={`vf-draw -mb-5 mt-0 w-0.5 flex-1 ${lineBad ? 'bg-[#B42318]/60' : 'bg-[#124B3A]'}`}
                    style={{ '--i': i } as React.CSSProperties}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <StopBody s={s} prevStop={prev} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
