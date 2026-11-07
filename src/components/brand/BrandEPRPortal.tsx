import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Modal } from '../common/Modal';
import { isOverTolerance } from '../../domain/rules';
import type { EvidencePackage, MaterialCategory } from '../../types';
import { ShieldCheck, Award, FileDown, Plus, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { verifyLotUrl } from '../../live/routes';
import brandImg from '../../assets/images/brand_campaign_circular_1791258420512.jpg';

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
  const period = `${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} (Monthly Audit)`;

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
        `Only ${unallocatedEligibleKg} kg of processed (E4) material is unallocated. Reduce the claim to avoid double-counting.`
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Award className="w-4 h-4 text-emerald-800" />
            <span className="font-semibold text-slate-800">EPR & Brand Partner Console</span>
            <span aria-hidden="true">·</span>
            <span>Bangladesh Solid Waste Management Rules 2021 Context</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            {t('Circular Campaigns & Defensible EPR Evidence', 'বৃত্তাকার ক্যাম্পেইন ও প্রমাণপত্র')}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            PRD § 11 & Journey E: Strict non-duplication safeguards ensure recovery claims are attributed exclusively once to authorized partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
              <img
                src={brandImg}
                alt="Circular take-back kiosk for post-consumer packaging"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-[11px] leading-tight pr-2">
              <span className="font-semibold text-slate-800 block">Circular Take-Back</span>
              <span className="text-slate-500">Post-Consumer Packaging</span>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 min-h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{t('New Evidence Package', 'নতুন প্রমাণ প্যাকেজ')}</span>
          </button>
        </div>
      </div>

      {sealedMessage && (
        <div role="status" className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            {sealedMessage}
          </span>
          <button type="button" onClick={() => setSealedMessage('')} className="px-3 min-h-11 font-semibold underline cursor-pointer">
            {t('Dismiss', 'বন্ধ করুন')}
          </button>
        </div>
      )}
      {isInconsistent && (
        <div role="alert" className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          Allocated claims ({alreadyClaimedKg.toLocaleString()} kg) exceed confirmed processed material ({totalProcessedKg.toLocaleString()} kg). Reconcile before sealing more packages.
        </div>
      )}

      {/* Safeguard & Mass Balance Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Confirmed Recycled (E4)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalProcessedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
          </div>
          <div className="text-[11px] text-slate-500">
            Across licensed polymer & paper mills
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Allocated to Brand Claims (E5)</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            {alreadyClaimedKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
          </div>
          <div className="text-[11px] text-emerald-700">
            Locked in sealed audit packages
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Available Unallocated Pool</span>
          <div className="text-2xl font-bold font-mono text-cyan-800 tabular-nums">
            {unallocatedEligibleKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span>E4 − E5 · double-counting prevention active</span>
          </div>
        </div>
      </div>

      {/* Active Brand Campaigns */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Active Brand Sponsor Campaigns</h2>
          <span className="text-xs font-mono text-slate-500">{campaigns.length} active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 tracking-wide">
                    {camp.sponsorName}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{camp.title}</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  {camp.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between font-mono">
                  <span>Target Recovery:</span>
                  <span className="font-bold text-slate-900">{camp.targetRecoveryKg} kg</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Verified Claimed:</span>
                  <span className="font-bold text-emerald-800">{camp.allocatedVerifiedKg} kg</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (camp.allocatedVerifiedKg / camp.targetRecoveryKg) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                <strong>Regulatory citation:</strong> {camp.regulatoryFramework}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sealed Evidence Packages (E5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Audited Evidence Packages (Evidence Level E5)
          </h2>
          <p className="text-xs text-slate-500">
            PRD § 9.3 & § 11.2: Independent auditor reviewed documentation supporting EPR claims.
          </p>
        </div>

        <div className="space-y-3">
          {evidencePackages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  <span className="font-bold text-slate-900 text-sm">{pkg.title}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-500">{pkg.id}</span>
                </div>
                <EvidenceBadge level="E5" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-slate-100 font-mono text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">EVIDENCED WEIGHT</span>
                  <span className="text-sm font-bold text-emerald-800">{pkg.evidencedWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">PERIOD</span>
                  <span>{pkg.period}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">TRANSACTIONS</span>
                  <span>{pkg.includedTransactionCount} transactions · {pkg.includedLotCount} lots</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">INDEPENDENT AUDITOR</span>
                  <span className="truncate block">{pkg.reviewerName.split('(')[0]}</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div>
                  <strong>Mandatory Exclusion Disclosure: </strong>
                  {pkg.exclusionsDisclosed}
                </div>
                <div>
                  <strong>Legal Grounding: </strong>
                  {pkg.regulatoryCitation}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[10px]">
                  Approved & Sealed on {pkg.approvedDate}
                </span>
                <a
                  href={verifyLotUrl(lots.find((l) => l.evidenceLevel === 'E4')?.id ?? 'LOT-2026-092-OCC')}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center min-h-11 px-2 font-medium text-emerald-800 underline underline-offset-2"
                >
                  {t('Consumer QR preview ↗', 'ভোক্তা QR প্রিভিউ ↗')}
                </a>
                <button
                  type="button"
                  onClick={() => handleDownloadDossier(pkg)}
                  className="flex items-center gap-1.5 px-3 min-h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('Download Audit Dossier (JSON)', 'অডিট ডসিয়ার ডাউনলোড (JSON)')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        size="md"
        title={t('Issue Audited Evidence Package', 'নিরীক্ষিত প্রমাণ প্যাকেজ ইস্যু')}
        description="Allocate verified recovery quantities to an official EPR partner claim."
      >
        <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-950 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">Unallocated processed (E4) pool</span>
            <span className="font-mono font-bold text-sm">{unallocatedEligibleKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
          </div>

          <div>
            <label htmlFor="epr-campaign" className="block font-medium text-slate-700 mb-1">Target Campaign</label>
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
              Evidence Weight to Allocate (kg) *
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
              Max {maxClaimKg} kg. Derived: {provenance.lotCount} lot(s), {provenance.transactionCount} transaction(s), {provenance.discrepancies} flagged discrepancy(ies) — best effort from E4 dispositions.
            </span>
          </div>

          <div>
            <label htmlFor="epr-claim" className="block font-medium text-slate-700 mb-1">Claim Type</label>
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
              Exclusions & Methodology Disclosure (PRD § 11.2) *
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
              Reviewer / Auditor Name & Accreditation *
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
              {t('Seal Evidence Package (E5)', 'প্রমাণ প্যাকেজ সিল করুন (E5)')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
