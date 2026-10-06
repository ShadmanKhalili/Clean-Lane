import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { ShieldCheck, Award, FileDown, Plus, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export const BrandEPRPortal: React.FC = () => {
  const {
    campaigns,
    evidencePackages,
    totalVerifiedEprKg,
    totalProcessedKg,
    createEvidencePackage,
    lang
  } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [claimType, setClaimType] = useState<
    'RECOVERED_POST_CONSUMER_PET' | 'RIGID_CIRCULAR_PACKAGING' | 'RESIDENTIAL_SEGREGATION_PILOT'
  >('RECOVERED_POST_CONSUMER_PET');
  const [evidenceWeightKg, setEvidenceWeightKg] = useState<number>(450);
  const [exclusionsDisclosed, setExclusionsDisclosed] = useState<string>(
    'Excludes 12.5 kg non-recyclable residue and multi-material caps. Audited against scale tickets.'
  );
  const [reviewerName, setReviewerName] = useState<string>(
    'Engr. Tanvir Ahmed (Registered Environmental Auditor, DOE Accredited)'
  );

  // Safeguard calculation: Total Processed (E4) vs already claimed
  const alreadyClaimedKg = evidencePackages.reduce((acc, p) => acc + p.evidencedWeightKg, 0);
  const unallocatedEligibleKg = Math.max(0, Number((totalProcessedKg - alreadyClaimedKg).toFixed(1)));

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign) return;

    if (evidenceWeightKg > unallocatedEligibleKg) {
      if (
        !confirm(
          `Warning (PRD § T-08): Claim allocation exceeds currently unallocated verified quantity (${unallocatedEligibleKg} kg). Do you want to proceed with this audit note?`
        )
      ) {
        return;
      }
    }

    createEvidencePackage({
      campaignId: campaign.id,
      sponsorName: campaign.sponsorName,
      title: `${campaign.sponsorName} Clean Lane Audited Package (Batch #${evidencePackages.length + 1})`,
      claimType,
      period: 'October 2026 Audit Cycle',
      evidencedWeightKg: evidenceWeightKg,
      includedLotCount: 14,
      includedTransactionCount: 22,
      evidenceLevelsCovered: ['E1', 'E2', 'E3', 'E4', 'E5'],
      exclusionsDisclosed,
      discrepanciesAudited: 1,
      reviewerName,
      regulatoryCitation: 'Department of Environment, Solid Waste Management Rules 2021 (EPR Clause 14)'
    });

    setCreateModalOpen(false);
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
            {lang === 'en' ? 'Circular Campaigns & Defensible EPR Evidence' : 'বৃত্তাকার ক্যাম্পেইন ও প্রমাণপত্র'}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            PRD § 11 & Journey E: Strict non-duplication safeguards ensure recovery claims are attributed exclusively once to authorized partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200">
              <img
                src="/src/assets/images/brand_campaign_circular_1791258420512.jpg"
                alt="Circular Return Kiosk"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-[11px] leading-tight pr-2">
              <span className="font-semibold text-slate-800 block">Circular Take-Back</span>
              <span className="text-slate-500">Post-Consumer Packaging</span>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Evidence Package</span>
          </button>
        </div>
      </div>

      {/* Safeguard & Mass Balance Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Confirmed Recycled (E4)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalProcessedKg.toLocaleString()} kg
          </div>
          <div className="text-[11px] text-slate-500">
            Across licensed polymer & paper mills
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Allocated to Brand Claims (E5)</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            {alreadyClaimedKg.toLocaleString()} kg
          </div>
          <div className="text-[11px] text-emerald-700">
            Locked in sealed audit packages
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-semibold text-slate-500">Available Unallocated Pool</span>
          <div className="text-2xl font-bold font-mono text-cyan-800 tabular-nums">
            {unallocatedEligibleKg.toLocaleString()} kg
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Double-counting prevention active</span>
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
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
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
                  <span>{pkg.includedTransactionCount} doorsteps</span>
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
                <button
                  onClick={() => alert(`Defensible EPR Dossier ${pkg.id} downloaded with full scale and custody hash manifests.`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Audit Dossier (PDF/JSON)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Evidence Package Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Issue Audited Evidence Package</h3>
            <p className="text-xs text-slate-500">
              Allocate verified recovery quantities to an official EPR partner claim.
            </p>

            <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-medium"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.sponsorName} · {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Evidence Weight to Allocate (kg) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={evidenceWeightKg}
                  onChange={(e) => setEvidenceWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-base font-bold text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current unallocated pool: {unallocatedEligibleKg} kg
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Claim Type</label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                >
                  <option value="RECOVERED_POST_CONSUMER_PET">Recovered Post-Consumer PET (Resin 1)</option>
                  <option value="RIGID_CIRCULAR_PACKAGING">Rigid Polyolefin Packaging (HDPE)</option>
                  <option value="RESIDENTIAL_SEGREGATION_PILOT">Residential Segregated OCC Cardboard</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Exclusions & Methodology Disclosure (PRD § 11.2) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={exclusionsDisclosed}
                  onChange={(e) => setExclusionsDisclosed(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Reviewer / Auditor Name & Accreditation *
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  Seal Evidence Package (E5)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
