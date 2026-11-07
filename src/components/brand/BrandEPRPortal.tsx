import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Modal } from '../common/Modal';
import { isOverTolerance } from '../../domain/rules';
import type { EvidencePackage, MaterialCategory } from '../../types';
import { ShieldCheck, FileDown, Plus, AlertCircle, CheckCircle2, Lock, ArrowDown } from 'lucide-react';
import { MaterialGlyph, MATERIALS, relatableCount } from '../../design/materials';
import { EmptyState } from '../../design/Celebrate';
import { Term } from '../../design/Glossary';
import { FollowOneBottle } from './FollowOneBottle';

type ClaimType = EvidencePackage['claimType'];

const CLAIM_FOR_MATERIAL: Partial<Record<MaterialCategory, ClaimType>> = {
  PET_BOTTLES: 'RECOVERED_POST_CONSUMER_PET',
  HDPE_RIGID: 'RIGID_CIRCULAR_PACKAGING',
  CARDBOARD_OCC: 'RESIDENTIAL_SEGREGATION_PILOT'
};
const PROCESS_FOR_CLAIM: Record<ClaimType, string> = {
  RECOVERED_POST_CONSUMER_PET: 'MECHANICAL_PET_FLAKING',
  RIGID_CIRCULAR_PACKAGING: 'HDPE_PELLETIZING',
  RESIDENTIAL_SEGREGATION_PILOT: 'PULPING_AND_CORRUGATING'
};

export const BrandEPRPortal: React.FC = () => {
  const {
    campaigns,
    evidencePackages,
    totalVerifiedEprKg,
    totalProcessedKg,
    unallocatedProcessedKg,
    processingDispositions,
    custodyEvents,
    auditLogs,
    lots,
    bookings,
    createEvidencePackage,
    lang
  } = useApp();
  const t = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [claimType, setClaimType] = useState<ClaimType>('RECOVERED_POST_CONSUMER_PET');
  const [evidenceWeightKg, setEvidenceWeightKg] = useState<number>(0);
  const [exclusionsDisclosed, setExclusionsDisclosed] = useState<string>(
    'Excludes non-recyclable residue and multi-material caps. Audited against scale tickets.'
  );
  const [reviewerName, setReviewerName] = useState<string>(
    'Engr. Tanvir Ahmed (Registered Environmental Auditor, DOE Accredited)'
  );
  const [formError, setFormError] = useState<string>('');
  const [sealedMessage, setSealedMessage] = useState<string>('');

  const alreadyClaimedKg = totalVerifiedEprKg;
  const unallocatedEligibleKg = unallocatedProcessedKg;
  const isInconsistent = alreadyClaimedKg > totalProcessedKg + 0.05;
  const maxClaimKg = Math.floor(unallocatedEligibleKg * 10) / 10;
  const period = `${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} (monthly audit)`;

  // Best-effort provenance for a new claim: E4 dispositions oldest-first, minus what earlier packages
  // already consumed, until the requested weight is covered.
  const provenance = useMemo(() => {
    const ordered = [...processingDispositions].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
    let consumed = alreadyClaimedKg;
    const pool: { id: string; lotId: string; remaining: number }[] = [];
    for (const d of ordered) {
      const used = Math.min(consumed, d.outputYieldKg);
      consumed -= used;
      if (d.outputYieldKg - used > 0.0001) pool.push({ id: d.id, lotId: d.lotId, remaining: d.outputYieldKg - used });
    }
    let need = Math.max(0, evidenceWeightKg);
    const included: typeof pool = [];
    for (const p of pool) {
      if (need <= 0) break;
      included.push(p);
      need -= p.remaining;
    }
    const rootOf = (id: string): string => {
      const lot = lots.find((l) => l.id === id);
      return lot?.parentLotId ?? id;
    };
    const bookingIds = new Set<string>();
    let flagged = 0;
    for (const inc of included) {
      const lot = lots.find((l) => l.id === inc.lotId);
      const root = lots.find((l) => l.id === rootOf(inc.lotId));
      const bookingId = lot?.sourceBookingId ?? root?.sourceBookingId;
      if (bookingId && bookings.some((b) => b.id === bookingId)) bookingIds.add(bookingId);
      if (isOverTolerance(root?.discrepancyPercentage ?? lot?.discrepancyPercentage)) flagged += 1;
    }
    return {
      lotCount: included.length,
      transactionCount: bookingIds.size || included.length,
      discrepancies: flagged
    };
  }, [processingDispositions, alreadyClaimedKg, evidenceWeightKg, lots, bookings]);

  const openCreateModal = () => {
    const camp = campaigns.find((c) => c.id === selectedCampaignId);
    const suggested = camp ? CLAIM_FOR_MATERIAL[camp.targetMaterial] : undefined;
    if (suggested) setClaimType(suggested);
    // Never pre-fill more than the unallocated pool.
    setEvidenceWeightKg(maxClaimKg);
    setFormError('');
    setCreateModalOpen(true);
  };

  const handleCampaignChange = (id: string) => {
    setSelectedCampaignId(id);
    const camp = campaigns.find((c) => c.id === id);
    const suggested = camp ? CLAIM_FOR_MATERIAL[camp.targetMaterial] : undefined;
    if (suggested) setClaimType(suggested);
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign) return;

    if (evidenceWeightKg > unallocatedEligibleKg + 1e-9) {
      setFormError(
        `Only ${unallocatedEligibleKg} kg is still free to claim. Reduce the amount so nothing is counted twice.`
      );
      return;
    }

    const result = createEvidencePackage({
      campaignId: campaign.id,
      sponsorName: campaign.sponsorName,
      title: `${campaign.sponsorName} Clean Lane Audited Package (Batch #${evidencePackages.length + 1})`,
      claimType,
      period,
      evidencedWeightKg: evidenceWeightKg,
      includedLotCount: provenance.lotCount,
      includedTransactionCount: provenance.transactionCount,
      evidenceLevelsCovered: ['E1', 'E2', 'E3', 'E4'],
      exclusionsDisclosed,
      discrepanciesAudited: provenance.discrepancies,
      reviewerName,
      regulatoryCitation: 'Department of Environment, Solid Waste Management Rules 2021 (EPR Clause 14)'
    });

    if (!result.success) {
      setFormError(result.message);
      return;
    }
    setFormError('');
    setSealedMessage(result.message);
    setCreateModalOpen(false);
  };

  const handleDownloadDossier = (pkg: EvidencePackage) => {
    const processType = PROCESS_FOR_CLAIM[pkg.claimType];
    const relatedDispositions = processingDispositions.filter(
      (d) => d.processType === processType && d.completedAt.slice(0, 10) <= pkg.approvedDate
    );
    const lotIds = new Set<string>();
    for (const d of relatedDispositions) {
      lotIds.add(d.lotId);
      const lot = lots.find((l) => l.id === d.lotId);
      if (lot?.parentLotId) lotIds.add(lot.parentLotId);
    }
    const relatedLots = lots.filter((l) => lotIds.has(l.id));
    const relatedCustody = custodyEvents.filter((c) => lotIds.has(c.lotId));
    const dispositionIds = new Set(relatedDispositions.map((d) => d.id));
    const relatedAudit = auditLogs.filter(
      (a) => a.targetId === pkg.id || lotIds.has(a.targetId) || dispositionIds.has(a.targetId)
    );
    const dossier = {
      generatedAt: new Date().toISOString(),
      note: 'Related records are selected best-effort by process type and approval date; packages do not store explicit lot references.',
      package: pkg,
      reconciliation: {
        totalProcessedE4Kg: totalProcessedKg,
        totalAllocatedE5Kg: totalVerifiedEprKg,
        unallocatedKg: unallocatedProcessedKg
      },
      processingDispositions: relatedDispositions,
      lots: relatedLots,
      custodyEvents: relatedCustody,
      auditLog: relatedAudit
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pkg.id}-audit-dossier.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // The story: one number for the sponsor, in plain words.
  const sponsor = evidencePackages[0]?.sponsorName ?? campaigns[0]?.sponsorName ?? '';
  const sponsorPackages = evidencePackages.filter((p) => p.sponsorName === sponsor);
  const verifiedKg = sponsorPackages.reduce((acc, p) => acc + p.evidencedWeightKg, 0) || totalVerifiedEprKg;
  const sponsorMaterial: MaterialCategory = campaigns.find((c) => c.sponsorName === sponsor)?.targetMaterial ?? 'PET_BOTTLES';
  const noun = sponsorMaterial === 'PET_BOTTLES' ? t('bottles', 'বোতল') : t(MATERIALS[sponsorMaterial].en.toLowerCase(), MATERIALS[sponsorMaterial].bn);
  const itemCount = relatableCount(sponsorMaterial, verifiedKg);

  return (
    <div className="space-y-8">
      {sealedMessage && (
        <div role="status" className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-sm text-emerald-950 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            {sealedMessage}
          </span>
          <button type="button" onClick={() => setSealedMessage('')} className="px-3 min-h-11 font-semibold underline cursor-pointer">{t('Dismiss', 'বন্ধ করুন')}</button>
        </div>
      )}
      {isInconsistent && (
        <div role="alert" className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-300 text-sm text-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          {t(`Claims (${alreadyClaimedKg.toLocaleString()} kg) are higher than what has been confirmed recycled (${totalProcessedKg.toLocaleString()} kg). Reconcile before sealing more.`, `দাবি (${alreadyClaimedKg.toLocaleString()} কেজি) নিশ্চিত রিসাইকেলের (${totalProcessedKg.toLocaleString()} কেজি) চেয়ে বেশি। আরও সিল করার আগে মিলিয়ে নিন।`)}
        </div>
      )}

      {/* 1. The one number */}
      <section aria-labelledby="brand-hero" className="rounded-3xl bg-gradient-to-br from-[#124B3A] to-[#0B2F24] text-white p-6 sm:p-10 overflow-hidden relative">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#CBEA70]">{sponsor || t('Your campaign', 'আপনার ক্যাম্পেইন')}</p>
            <h1 id="brand-hero" className="mt-2">
              <span className="block font-display text-6xl sm:text-8xl font-extrabold tabular-nums leading-none" data-testid="brand-hero-kg">
                {verifiedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })}<span className="text-3xl sm:text-4xl ml-2 text-white/70">kg</span>
              </span>
              <span className="block mt-3 font-display text-xl sm:text-3xl font-bold leading-tight">
                {t(`of your ${noun}, verified recycled.`, `আপনার ${noun}, যাচাই করা রিসাইকেল।`)}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/75">
              {t(`About ${itemCount.toLocaleString()} ${MATERIALS[sponsorMaterial].itemEn}. Weighed at every hand-over and checked by an independent auditor, so you can show it for `, `প্রায় ${itemCount.toLocaleString()}টি ${MATERIALS[sponsorMaterial].itemBn}। প্রতিটি হস্তান্তরে ওজন করা এবং স্বাধীন নিরীক্ষক দ্বারা যাচাই, তাই এটি দেখাতে পারবেন `)}
              <span className="[&_button]:text-[#CBEA70]"><Term id="epr" lang={lang} /></span>.
            </p>
          </div>
          <a href="#follow" className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full bg-[#CBEA70] text-[#0B1A15] font-bold">
            {t('See how it got there', 'কীভাবে হলো দেখুন')} <ArrowDown className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 opacity-20" aria-hidden="true">
          <MaterialGlyph material={sponsorMaterial} size={260} />
        </div>
      </section>

      {/* 2. Follow one bottle */}
      <div id="follow" className="scroll-mt-24"><FollowOneBottle preferMaterial={sponsorMaterial} /></div>

      {/* 3. Campaigns */}
      <section aria-labelledby="brand-camps" className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 id="brand-camps" className="font-display text-2xl font-bold text-slate-900">{t('Your campaigns', 'আপনার ক্যাম্পেইন')}</h2>
          <span className="text-sm text-slate-500">{t(`${campaigns.length} running`, `${campaigns.length}টি চলছে`)}</span>
        </div>
        {campaigns.length === 0 ? (
          <EmptyState title={t('No campaigns yet', 'এখনো কোনো ক্যাম্পেইন নেই')} body={t('A campaign sets a recovery goal for one material. Customers earn bonus points, and the kilograms count towards your total.', 'ক্যাম্পেইনে একটি উপাদানের লক্ষ্য ঠিক হয়। গ্রাহকরা বোনাস পয়েন্ট পান, আর কেজিগুলো আপনার মোটে যোগ হয়।')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => {
              const pct = Math.min(100, camp.targetRecoveryKg ? (camp.allocatedVerifiedKg / camp.targetRecoveryKg) * 100 : 0);
              return (
                <article key={camp.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: MATERIALS[camp.targetMaterial].tint }}>
                      <MaterialGlyph material={camp.targetMaterial} size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-800">{camp.sponsorName}</p>
                      <h3 className="font-bold text-slate-900 leading-snug">{camp.title}</h3>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{camp.status === 'ACTIVE' ? t('Running', 'চলছে') : camp.status === 'PLANNED' ? t('Planned', 'পরিকল্পিত') : t('Closed', 'সমাপ্ত')}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t('Verified so far', 'এ পর্যন্ত যাচাইকৃত')}</span>
                      <span className="font-bold tabular-nums text-slate-900">{camp.allocatedVerifiedKg.toLocaleString()} / {camp.targetRecoveryKg.toLocaleString()} kg</span>
                    </div>
                    <div className="mt-1.5 h-2.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={camp.title}>
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{camp.regulatoryFramework}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. For the compliance team */}
      <section aria-labelledby="brand-audit" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="brand-audit" className="font-display text-2xl font-bold text-slate-900">{t('For your compliance team', 'আপনার কমপ্লায়েন্স দলের জন্য')}</h2>
            <p className="text-sm text-slate-600 max-w-2xl">{t('Audited packages you can hand to a regulator, each with a full record download.', 'নিরীক্ষিত প্যাকেজ, যা নিয়ন্ত্রকের হাতে দেওয়া যায়; প্রতিটির সঙ্গে পূর্ণ রেকর্ড ডাউনলোড।')}</p>
          </div>
          <button onClick={openCreateModal} className="px-5 min-h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{t('New audited package', 'নতুন নিরীক্ষিত প্যাকেজ')}</span>
          </button>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <dt className="text-sm font-semibold text-slate-600">{t('Confirmed recycled', 'নিশ্চিত রিসাইকেল')} <span className="font-mono text-[11px] text-slate-400">E4</span></dt>
            <dd className="text-2xl font-bold tabular-nums text-slate-900">{totalProcessedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</dd>
            <p className="text-xs text-slate-500">{t('Across licensed polymer and paper mills', 'লাইসেন্সপ্রাপ্ত পলিমার ও কাগজ মিলে')}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <dt className="text-sm font-semibold text-slate-600">{t('Already claimed by brands', 'ব্র্যান্ডের দাবিতে ব্যবহৃত')} <span className="font-mono text-[11px] text-slate-400">E5</span></dt>
            <dd className="text-2xl font-bold tabular-nums text-emerald-800">{alreadyClaimedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</dd>
            <p className="text-xs text-slate-500">{t('Locked into sealed packages', 'সিল করা প্যাকেজে আটকানো')}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <dt className="text-sm font-semibold text-slate-600">{t('Still free to claim', 'এখনো দাবি করা যায়')}</dt>
            <dd className="text-2xl font-bold tabular-nums text-cyan-800">{unallocatedEligibleKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</dd>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Lock className="w-3 h-3" aria-hidden="true" />{t('A kilogram can only be claimed once', 'একটি কেজি একবারই দাবি করা যায়')}</p>
          </div>
        </dl>

        <p className="text-xs text-slate-500">
          {t('Each package is the last rung of the', 'প্রতিটি প্যাকেজ')} <Term id="evidenceLevel" lang={lang} /> {t('ladder (E5). The download includes every', 'ধাপের শেষ (E5)। ডাউনলোডে আছে প্রতিটি')} <Term id="lot" lang={lang} /> {t('record behind it.', 'রেকর্ড।')}
        </p>

        {evidencePackages.length === 0 ? (
          <EmptyState
            title={t('No audited packages yet', 'এখনো কোনো নিরীক্ষিত প্যাকেজ নেই')}
            body={t('When material has been confirmed recycled, create a package to claim it. An independent auditor signs it and it can never be claimed twice.', 'উপাদান রিসাইকেল নিশ্চিত হলে প্যাকেজ বানিয়ে দাবি করুন। স্বাধীন নিরীক্ষক সই করেন এবং দুবার দাবি করা যায় না।')}
            action={<button type="button" onClick={openCreateModal} className="px-5 min-h-11 bg-slate-900 text-white rounded-xl text-sm font-semibold cursor-pointer">{t('New audited package', 'নতুন নিরীক্ষিত প্যাকেজ')}</button>}
          />
        ) : (
          <div className="space-y-3">
            {evidencePackages.map((pkg) => (
              <article key={pkg.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                    <h3 className="font-bold text-slate-900">{pkg.title}</h3>
                    <span className="font-mono text-xs text-slate-500">{pkg.id}</span>
                  </div>
                  <EvidenceBadge level="E5" />
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100">
                  <div><dt className="text-xs text-slate-500">{t('Verified weight', 'যাচাইকৃত ওজন')}</dt><dd className="font-bold text-emerald-800">{pkg.evidencedWeightKg.toLocaleString()} kg</dd></div>
                  <div><dt className="text-xs text-slate-500">{t('Period', 'সময়কাল')}</dt><dd>{pkg.period}</dd></div>
                  <div><dt className="text-xs text-slate-500">{t('Covers', 'অন্তর্ভুক্ত')}</dt><dd>{pkg.includedTransactionCount} {t('pickups', 'পিকআপ')} · {pkg.includedLotCount} <Term id="lot" lang={lang}>{t('lots', 'লট')}</Term></dd></div>
                  <div><dt className="text-xs text-slate-500">{t('Independent auditor', 'স্বাধীন নিরীক্ষক')}</dt><dd className="truncate">{pkg.reviewerName.split('(')[0]}</dd></div>
                </dl>
                <div className="space-y-1 text-slate-600 text-xs">
                  <p><strong>{t('What is left out: ', 'যা বাদ: ')}</strong>{pkg.exclusionsDisclosed}</p>
                  <p><strong>{t('Rule it follows: ', 'যে বিধি অনুসারে: ')}</strong>{pkg.regulatoryCitation}</p>
                </div>
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-400 text-xs">{t('Sealed on', 'সিল করা হয়েছে')} {pkg.approvedDate}</span>
                  <button type="button" onClick={() => handleDownloadDossier(pkg)} className="flex items-center gap-1.5 px-4 min-h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium cursor-pointer">
                    <FileDown className="w-4 h-4" aria-hidden="true" />
                    <span>{t('Download full record (JSON)', 'পূর্ণ রেকর্ড ডাউনলোড (JSON)')}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        size="md"
        title={t('Create an audited package', 'নিরীক্ষিত প্যাকেজ তৈরি')}
        description={t('Claim recycled kilograms for a campaign. They can only be claimed once.', 'একটি ক্যাম্পেইনের জন্য রিসাইকেল করা কেজি দাবি করুন। একবারই দাবি করা যায়।')}
      >
        <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">Recycled and still free to claim</span>
            <span className="font-mono font-bold text-sm">{unallocatedEligibleKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
          </div>

          <div>
            <label htmlFor="epr-campaign" className="block font-medium text-slate-700 mb-1">Campaign</label>
            <select
              id="epr-campaign"
              value={selectedCampaignId}
              onChange={(e) => handleCampaignChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 min-h-11 text-slate-900 font-medium"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.sponsorName} · {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="epr-weight" className="block font-medium text-slate-700 mb-1">
              Kilograms to claim *
            </label>
            <input
              id="epr-weight"
              type="number"
              step="0.1"
              min="0.1"
              max={maxClaimKg}
              required
              value={evidenceWeightKg}
              onChange={(e) => {
                setEvidenceWeightKg(parseFloat(e.target.value) || 0);
                setFormError('');
              }}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 min-h-11 font-mono text-base font-bold text-slate-900"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Max {maxClaimKg} kg. Covers about {provenance.lotCount} lot(s) and {provenance.transactionCount} pickup(s); {provenance.discrepancies} weight mismatch(es) were reviewed.
            </span>
          </div>

          <div>
            <label htmlFor="epr-claim" className="block font-medium text-slate-700 mb-1">What is being claimed</label>
            <select
              id="epr-claim"
              value={claimType}
              onChange={(e) => setClaimType(e.target.value as ClaimType)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 min-h-11 text-slate-800"
            >
              <option value="RECOVERED_POST_CONSUMER_PET">Recovered Post-Consumer PET (Resin 1)</option>
              <option value="RIGID_CIRCULAR_PACKAGING">Rigid Polyolefin Packaging (HDPE)</option>
              <option value="RESIDENTIAL_SEGREGATION_PILOT">Residential Segregated OCC Cardboard</option>
            </select>
          </div>

          <div>
            <label htmlFor="epr-exclusions" className="block font-medium text-slate-700 mb-1">
              What is left out, and how it was measured *
            </label>
            <textarea
              id="epr-exclusions"
              rows={2}
              required
              value={exclusionsDisclosed}
              onChange={(e) => setExclusionsDisclosed(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="epr-reviewer" className="block font-medium text-slate-700 mb-1">
              Auditor name and accreditation *
            </label>
            <input
              id="epr-reviewer"
              type="text"
              required
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 min-h-11 text-slate-800"
            />
          </div>

          <p className="text-[11px] text-slate-500">Period: {period}</p>

          {formError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 min-h-11 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer">
              {t('Cancel', 'বাতিল')}
            </button>
            <button
              type="submit"
              disabled={maxClaimKg <= 0 || !(evidenceWeightKg > 0)}
              className="px-4 min-h-11 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold cursor-pointer"
            >
              {t('Seal the package', 'প্যাকেজ সিল করুন')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
