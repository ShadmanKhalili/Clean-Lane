import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MATERIAL_LIST, MaterialGlyph } from '../../design/materials';
import type { MaterialCategory } from '../../types';
import { AREAS, AREA_IDS, type AreaId } from '../model';
import { verifyLiveUrl } from '../routes';
import { useLiveRoom } from '../useLiveRoom';
import { Journey } from './phone/Journey';
import { StatusCard } from './phone/StatusCard';
import { ConnectionBanner, LangToggle, Logo, PhoneStyles, fmtNum, pick, readStore, writeStore, PAPER } from './phone/shared';

const FOCUS = 'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#CBEA70]';

export const JoinScreen: React.FC<{ room: string }> = ({ room }) => {
  const { lang, setLang } = useApp();
  const live = useLiveRoom(room);
  const storeKey = `cleanlane:live:mine:${room}`;
  const [mineId, setMineId] = useState<string | null>(() => readStore(storeKey));
  const [name, setName] = useState('');
  const [area, setArea] = useState<AreaId | null>(null);
  const [mats, setMats] = useState<MaterialCategory[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [waited, setWaited] = useState(false);

  const mine = useMemo(() => live.bookings.find((b) => b.id === mineId) ?? null, [live.bookings, mineId]);

  useEffect(() => {
    if (!mineId || mine) return;
    const id = window.setTimeout(() => setWaited(true), 4000);
    return () => window.clearTimeout(id);
  }, [mineId, mine]);

  const toggleMat = (m: MaterialCategory) => setMats((xs) => (xs.includes(m) ? xs.filter((x) => x !== m) : [...xs, m]));
  const ready = area !== null && mats.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const b = await live.book({ name, area, materials: mats });
      writeStore(storeKey, b.id);
      setWaited(false);
      setMineId(b.id);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    writeStore(storeKey, null);
    setMineId(null);
    setMats([]);
    setArea(null);
    setWaited(false);
  };

  const header = (
    <header className="flex items-center justify-between px-4 pb-2 pt-4">
      <Logo />
      <LangToggle lang={lang} setLang={setLang} />
    </header>
  );

  return (
    <div lang={lang} className="mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col overflow-x-hidden text-[#124B3A]" style={{ background: PAPER }}>
      <PhoneStyles />
      {header}
      <ConnectionBanner connected={live.connected} error={live.error} lang={lang} />

      {mineId ? (
        <main className="flex flex-1 flex-col gap-5 px-4 pb-8 pt-2">
          {mine ? (
            <>
              <div className="px-1">
                <h1 className="font-display text-[26px] font-extrabold leading-tight">
                  {pick(lang, `Hi ${mine.name}, here’s your pickup`, `${mine.name}, এই যে আপনার পিকআপ`)}
                </h1>
                <p className="text-sm font-semibold text-[#124B3A]/60">
                  {pick(lang, AREAS[mine.area].en, AREAS[mine.area].bn)} · {mine.id}
                </p>
              </div>
              <StatusCard booking={mine} lang={lang} verifyUrl={verifyLiveUrl(room, mine.id)} />
              <section className="rounded-[28px] bg-white p-5 ring-1 ring-[#124B3A]/10">
                <Journey booking={mine} lang={lang} />
              </section>
              {mine.stage === 'recycled' && (
                <button type="button" onClick={startOver} className={`h-14 rounded-2xl border-2 border-[#124B3A] text-base font-extrabold ${FOCUS}`}>
                  {pick(lang, 'Book another pickup', 'আরেকটি পিকআপ বুক করুন')}
                </button>
              )}
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-center" role="status">
              <div>
                <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-[#124B3A]/15 border-t-[#124B3A]" aria-hidden="true" />
                <p className="mt-4 font-display text-xl font-extrabold">{pick(lang, 'Finding your booking…', 'আপনার বুকিং খোঁজা হচ্ছে…')}</p>
                {waited && (
                  <button type="button" onClick={startOver} className={`mt-4 h-12 rounded-full px-5 text-sm font-bold underline ${FOCUS}`}>
                    {pick(lang, 'Start over', 'নতুন করে শুরু করুন')}
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      ) : (
        <form onSubmit={submit} className="flex flex-1 flex-col gap-3 px-4 pb-5 pt-1">
          <div className="px-1">
            <h1 className="font-display text-[30px] font-extrabold leading-[1.05]">
              {pick(lang, 'You’re a household in Dhaka 👋', 'আপনি এখন ঢাকার একটি পরিবার 👋')}
            </h1>
            <p className="mt-1 text-[15px] font-medium text-[#124B3A]/70">{pick(lang, 'Book a pickup and watch your bag’s journey live.', 'পিকআপ বুক করে আপনার ব্যাগের যাত্রা সরাসরি দেখুন।')}</p>
          </div>

          <div>
            <label htmlFor="cl-name" className="mb-1 block px-1 text-sm font-bold">
              {pick(lang, 'Your first name', 'আপনার নামের প্রথম অংশ')} <span className="font-medium text-[#124B3A]/50">{pick(lang, '(optional)', '(ঐচ্ছিক)')}</span>
            </label>
            <input
              id="cl-name"
              value={name}
              maxLength={24}
              autoComplete="given-name"
              onChange={(e) => setName(e.target.value)}
              placeholder={pick(lang, 'Your first name', 'আপনার নাম')}
              className="h-14 w-full rounded-2xl border-2 border-[#124B3A]/15 bg-white px-4 text-lg font-semibold placeholder:font-medium placeholder:text-[#124B3A]/35 focus:border-[#124B3A] focus:outline-none"
            />
          </div>

          <fieldset>
            <legend className="mb-1 px-1 text-sm font-bold">{pick(lang, 'Your area', 'আপনার এলাকা')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {AREA_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={area === id}
                  onClick={() => setArea(id)}
                  className={`h-12 truncate rounded-full px-2 text-[14px] font-bold transition-colors ${FOCUS} ${
                    area === id ? 'bg-[#124B3A] text-white' : 'bg-white text-[#124B3A] ring-1 ring-[#124B3A]/15'
                  }`}
                >
                  {pick(lang, AREAS[id].en, AREAS[id].bn)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 px-1 text-sm font-bold">{pick(lang, 'What do you have?', 'আপনার কাছে কী আছে?')}</legend>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_LIST.map((m) => {
                const on = mats.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleMat(m.id)}
                    className={`flex h-12 items-center gap-2 rounded-2xl px-3 text-left text-[14px] font-bold transition-all ${FOCUS} ${on ? 'scale-[1.02] ring-2' : 'ring-1 ring-[#124B3A]/12'}`}
                    style={{ background: on ? m.tint : '#fff', ['--tw-ring-color' as string]: on ? m.color : undefined }}
                  >
                    <MaterialGlyph material={m.id} size={22} />
                    <span className="min-w-0 flex-1 truncate">{pick(lang, m.en, m.bn)}</span>
                    {on && (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={m.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-auto pt-1">
            {failed && (
              <p role="alert" className="mb-2 text-center text-sm font-semibold text-[#9B1C1C]">
                {pick(lang, 'Could not book. Please try again.', 'বুক করা যায়নি। আবার চেষ্টা করুন।')}
              </p>
            )}
            <button
              type="submit"
              disabled={!ready || busy}
              className={`flex h-16 w-full items-center justify-center rounded-2xl bg-[#124B3A] text-lg font-extrabold text-[#CBEA70] shadow-[0_14px_28px_-14px_rgba(18,75,58,.8)] transition-opacity disabled:opacity-40 ${FOCUS}`}
            >
              {busy ? '…' : pick(lang, 'Book pickup', 'পিকআপ বুক করুন')}
            </button>
            <p className="mt-2 text-center text-xs font-medium text-[#124B3A]/55">
              {ready
                ? pick(lang, `${fmtNum(mats.length, lang)} kind${mats.length > 1 ? 's' : ''} selected`, `${fmtNum(mats.length, lang)}টি ধরন বাছাই করা হয়েছে`)
                : pick(lang, 'Choose your area and at least one material', 'এলাকা ও অন্তত একটি জিনিস বাছাই করুন')}
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default JoinScreen;
