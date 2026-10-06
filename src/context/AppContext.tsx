import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuditEvent,
  Booking,
  BrandCampaign,
  CustomerRedemption,
  CustodyEvent,
  EvidenceLevel,
  EvidencePackage,
  MaterialLot,
  PickupJob,
  PointsLedgerEntry,
  ProcessingDisposition,
  RewardItem,
  ServiceComplaint,
  ServiceZone,
  SortingTransformation,
  UserRole
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_BRAND_CAMPAIGNS,
  INITIAL_COMPLAINTS,
  INITIAL_CUSTODY_EVENTS,
  INITIAL_EVIDENCE_PACKAGES,
  INITIAL_JOBS,
  INITIAL_MATERIAL_LOTS,
  INITIAL_POINTS_LEDGER,
  INITIAL_PROCESSING_DISPOSITIONS,
  INITIAL_REDEMPTIONS,
  INITIAL_REWARDS,
  INITIAL_SERVICE_ZONES,
  INITIAL_SORTING_TRANSFORMATIONS
} from '../data/mockData';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;

  // Data
  bookings: Booking[];
  jobs: PickupJob[];
  lots: MaterialLot[];
  custodyEvents: CustodyEvent[];
  sortingTransformations: SortingTransformation[];
  processingDispositions: ProcessingDisposition[];
  pointsLedger: PointsLedgerEntry[];
  rewards: RewardItem[];
  redemptions: CustomerRedemption[];
  complaints: ServiceComplaint[];
  campaigns: BrandCampaign[];
  evidencePackages: EvidencePackage[];
  serviceZones: ServiceZone[];
  auditLogs: AuditEvent[];

  // Toast / System Notification
  activeToast: string | null;
  showToast: (msg: string) => void;

  // Actions
  createBooking: (newBooking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'evidenceLevel' | 'status' | 'pointsStatus'>) => Booking;
  cancelBooking: (bookingId: string, reason: string) => void;
  acceptJob: (jobId: string) => void;
  completeJob: (
    jobId: string,
    report: {
      materialWeights: { category: any; weightKg: number; bagCount: number }[];
      totalWeightKg: number;
      weightMethod: 'field_hanging_scale' | 'customer_estimate' | 'receiving_scale_delegated';
      photoEvidenceRecorded: boolean;
    }
  ) => void;
  recordJobException: (jobId: string, reason: 'customer_unavailable' | 'inaccessible' | 'contaminated_stream' | 'cancelled_at_door') => void;
  verifyHubScaleWeight: (lotId: string, hubWeightKg: number, notes?: string) => void;
  resolveDiscrepancy: (lotId: string, resolutionReason: string) => void;
  commitSorting: (
    inputLotId: string,
    outputs: { materialGrade: string; outputWeightKg: number; childLotId: string; destinationProcessor: string }[],
    residueKg: number,
    residueDisposition: string
  ) => void;
  recordProcessingOutcome: (
    lotId: string,
    processorName: string,
    processType: 'MECHANICAL_PET_FLAKING' | 'HDPE_PELLETIZING' | 'PULPING_AND_CORRUGATING' | 'ALUMINUM_SMELTING',
    outputYieldKg: number,
    processLossKg: number,
    certId: string
  ) => void;
  redeemReward: (rewardId: string) => { success: boolean; message: string; couponCode?: string };
  fileComplaint: (type: any, description: string, bookingId?: string) => void;
  createEvidencePackage: (pkg: Omit<EvidencePackage, 'id' | 'approvedDate'>) => void;

  // Computed Summaries
  customerAvailablePoints: number;
  customerPendingPoints: number;
  totalCollectedKg: number;
  totalAcceptedKg: number;
  totalProcessedKg: number;
  totalVerifiedEprKg: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer_household');
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [jobs, setJobs] = useState<PickupJob[]>(INITIAL_JOBS);
  const [lots, setLots] = useState<MaterialLot[]>(INITIAL_MATERIAL_LOTS);
  const [custodyEvents, setCustodyEvents] = useState<CustodyEvent[]>(INITIAL_CUSTODY_EVENTS);
  const [sortingTransformations, setSortingTransformations] = useState<SortingTransformation[]>(INITIAL_SORTING_TRANSFORMATIONS);
  const [processingDispositions, setProcessingDispositions] = useState<ProcessingDisposition[]>(INITIAL_PROCESSING_DISPOSITIONS);
  const [pointsLedger, setPointsLedger] = useState<PointsLedgerEntry[]>(INITIAL_POINTS_LEDGER);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [redemptions, setRedemptions] = useState<CustomerRedemption[]>(INITIAL_REDEMPTIONS);
  const [complaints, setComplaints] = useState<ServiceComplaint[]>(INITIAL_COMPLAINTS);
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>(INITIAL_BRAND_CAMPAIGNS);
  const [evidencePackages, setEvidencePackages] = useState<EvidencePackage[]>(INITIAL_EVIDENCE_PACKAGES);
  const [serviceZones] = useState<ServiceZone[]>(INITIAL_SERVICE_ZONES);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast((current) => (current === msg ? null : current));
    }, 4000);
  };

  const addAuditLog = (
    action: string,
    targetObject: string,
    targetId: string,
    reason: string,
    priorValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actor: role.toUpperCase(),
      actorRole: role,
      action,
      targetObject,
      targetId,
      priorValue,
      newValue,
      reason
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Create Booking
  const createBooking = (
    data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'evidenceLevel' | 'status' | 'pointsStatus'>
  ): Booking => {
    const newId = `CL-BK-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    // Calculate approximate points hold
    const estPoints = 150; // base reward calculation
    const newBooking: Booking = {
      ...data,
      id: newId,
      status: 'CONFIRMED',
      evidenceLevel: 'E0', // Starts at E0: Collection requested
      createdAt: nowIso,
      updatedAt: nowIso,
      pointsStatus: 'potential',
      earnedPoints: estPoints,
      collectorId: 'COL-TARIQ-01',
      collectorName: 'Tariq Hossain (Clean Lane Vehicle #DH-14)'
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Create job for collector
    const newJob: PickupJob = {
      id: `JOB-${newId.replace('CL-BK-', '')}`,
      bookingId: newId,
      collectorId: 'COL-TARIQ-01',
      collectorName: 'Tariq Hossain',
      customerAddress: data.address,
      customerPhone: data.phone,
      accessNotes: data.accessInstructions || 'Standard doorstep collection',
      scheduledWindow: `${data.scheduledTimeWindow} (${data.scheduledDate})`,
      expectedMaterials: data.materials.map((m) => m.category),
      status: 'PENDING'
    };
    setJobs((prev) => [newJob, ...prev]);

    // Add points ledger entry
    const ledgerEntry: PointsLedgerEntry = {
      id: `PTS-${Date.now().toString().slice(-5)}`,
      customerId: data.customerId,
      timestamp: nowIso,
      ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
      sourceEvent: 'BOOKING_SCHEDULED_AWAITING_VERIFICATION',
      description: `Booking ${newId}: Anticipated recovery points held pending physical handover & scale intake.`,
      type: 'PENDING_HOLD',
      amount: estPoints,
      status: 'PENDING',
      linkedBookingId: newId
    };
    setPointsLedger((prev) => [ledgerEntry, ...prev]);

    addAuditLog('BOOKING_CREATED', 'Booking', newId, 'Customer booked scheduled clean lane collection.');
    showToast(`Booking ${newId} confirmed! Collector notified.`);
    return newBooking;
  };

  const cancelBooking = (bookingId: string, reason: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED', notes: `Cancelled: ${reason}` } : b))
    );
    setJobs((prev) =>
      prev.map((j) => (j.bookingId === bookingId ? { ...j, status: 'EXCEPTION', exceptionReason: 'cancelled_at_door' } : j))
    );
    addAuditLog('BOOKING_CANCELLED', 'Booking', bookingId, reason);
    showToast(`Booking ${bookingId} has been cancelled.`);
  };

  const acceptJob = (jobId: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'ACCEPTED' } : j)));
    showToast(`Job ${jobId} accepted by collector.`);
  };

  const completeJob = (
    jobId: string,
    report: {
      materialWeights: { category: any; weightKg: number; bagCount: number }[];
      totalWeightKg: number;
      weightMethod: 'field_hanging_scale' | 'customer_estimate' | 'receiving_scale_delegated';
      photoEvidenceRecorded: boolean;
    }
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const nowIso = new Date().toISOString();
    const ackCode = `ACK-${Math.floor(1000 + Math.random() * 9000)}`;
    const batchLotId = `LOT-${jobId.replace('JOB-', '')}-${report.materialWeights[0]?.category || 'MIX'}`;

    if (isOfflineMode) {
      setOfflineQueueCount((c) => c + 1);
    }

    // Update Job
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'COMPLETED',
              fieldReport: {
                completedAt: nowIso,
                materialWeights: report.materialWeights,
                totalWeightKg: report.totalWeightKg,
                weightMethod: report.weightMethod,
                customerAckCode: ackCode,
                batchLotId,
                photoEvidenceRecorded: report.photoEvidenceRecorded,
                syncStatus: isOfflineMode ? 'pending_sync_offline' : 'synced'
              }
            }
          : j
      )
    );

    // Update Booking to E1: Collected
    setBookings((prev) =>
      prev.map((b) =>
        b.id === job.bookingId
          ? {
              ...b,
              status: 'COLLECTED',
              evidenceLevel: 'E1', // Collector confirmed physical pickup
              fieldWeightKg: report.totalWeightKg,
              pointsStatus: 'pending',
              notes: `Pickup verified by collector ${job.collectorName}. Measured ${report.totalWeightKg} kg.`
            }
          : b
      )
    );

    // Create MaterialLot
    const newLot: MaterialLot = {
      id: batchLotId,
      sourceBookingId: job.bookingId,
      sourceJobId: jobId,
      material: report.materialWeights[0]?.category || 'PET_BOTTLES',
      primaryCollector: job.collectorName,
      initialFieldWeightKg: report.totalWeightKg,
      currentCustodian: 'COLLECTOR',
      location: `In-transit (Vehicle of ${job.collectorName})`,
      evidenceLevel: 'E1',
      createdAt: nowIso,
      updatedAt: nowIso
    };
    setLots((prev) => [newLot, ...prev]);

    // Record Custody Event
    const custodyEv: CustodyEvent = {
      id: `CUST-EV-${Date.now().toString().slice(-5)}`,
      lotId: batchLotId,
      timestamp: nowIso,
      sender: job.customerAddress,
      receiver: job.collectorName,
      location: job.customerAddress,
      quantityKg: report.totalWeightKg,
      measurementMethod: report.weightMethod === 'field_hanging_scale' ? 'Certified Portable Hanging Scale' : 'Field Estimate',
      evidenceLevelResult: 'E1',
      verifiedBy: `${job.collectorName} (${ackCode})`,
      signatureOrHash: `sha256:${Math.random().toString(16).slice(2, 12)}`
    };
    setCustodyEvents((prev) => [custodyEv, ...prev]);

    addAuditLog(
      'COLLECTION_COMPLETED',
      'MaterialLot',
      batchLotId,
      `Field collection logged with weight ${report.totalWeightKg} kg. Advancing to Evidence Level E1.`
    );

    showToast(
      isOfflineMode
        ? `Field record saved offline (Queue +1). Batch Tag: ${batchLotId}`
        : `Job completed! E1 Collected: ${report.totalWeightKg} kg tagged under ${batchLotId}`
    );
  };

  const recordJobException = (
    jobId: string,
    reason: 'customer_unavailable' | 'inaccessible' | 'contaminated_stream' | 'cancelled_at_door'
  ) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'EXCEPTION', exceptionReason: reason } : j))
    );
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === job.bookingId
            ? { ...b, status: 'MISSED', notes: `Exception logged by collector: ${reason.replace('_', ' ')}` }
            : b
        )
      );
    }
    addAuditLog('COLLECTION_EXCEPTION', 'PickupJob', jobId, `Exception: ${reason}`);
    showToast(`Exception recorded: ${reason.replace('_', ' ')}`);
  };

  const syncOfflineQueue = () => {
    setJobs((prev) =>
      prev.map((j) =>
        j.fieldReport && j.fieldReport.syncStatus === 'pending_sync_offline'
          ? { ...j, fieldReport: { ...j.fieldReport, syncStatus: 'synced' } }
          : j
      )
    );
    const count = offlineQueueCount;
    setOfflineQueueCount(0);
    setIsOfflineMode(false);
    showToast(`Successfully synced ${count} field transaction(s) to central registry!`);
  };

  // Aggregator: verify weight on platform scale
  const verifyHubScaleWeight = (lotId: string, hubWeightKg: number, notes?: string) => {
    const lot = lots.find((l) => l.id === lotId);
    if (!lot) return;

    const delta = hubWeightKg - lot.initialFieldWeightKg;
    const deltaPercent = Number(((delta / lot.initialFieldWeightKg) * 100).toFixed(1));
    const nowIso = new Date().toISOString();

    const isDiscrepant = Math.abs(deltaPercent) > 5.0; // Over 5% threshold flagged

    // Update Lot to E2
    setLots((prev) =>
      prev.map((l) =>
        l.id === lotId
          ? {
              ...l,
              verifiedHubWeightKg: hubWeightKg,
              currentCustodian: 'AGGREGATION_HUB',
              location: 'Gulshan Aggregation Hub #3 (Scale #GW-01)',
              evidenceLevel: 'E2',
              discrepancyPercentage: deltaPercent,
              discrepancyResolved: !isDiscrepant,
              updatedAt: nowIso
            }
          : l
      )
    );

    // Update Booking if linked
    if (lot.sourceBookingId) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === lot.sourceBookingId
            ? {
                ...b,
                status: isDiscrepant ? 'QUANTITY_UNDER_REVIEW' : 'QUANTITY_CONFIRMED',
                evidenceLevel: 'E2',
                confirmedWeightKg: hubWeightKg,
                discrepancyFlag: isDiscrepant,
                materialPayoutBdt: Math.round(hubWeightKg * 30),
                earnedPoints: Math.round(hubWeightKg * 45),
                pointsStatus: isDiscrepant ? 'pending' : 'available',
                notes: notes || `Hub scale confirmed ${hubWeightKg} kg (Delta: ${deltaPercent}%).`
              }
            : b
        )
      );

      // Make points available in ledger if not heavily discrepant
      if (!isDiscrepant) {
        setPointsLedger((prev) => [
          {
            id: `PTS-${Date.now().toString().slice(-5)}`,
            customerId: 'CUST-H-801',
            timestamp: nowIso,
            ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
            sourceEvent: 'HUB_SCALE_QUANTITY_CONFIRMED',
            description: `Scale confirmation for lot ${lotId}: ${hubWeightKg} kg accepted.`,
            type: 'CREDIT',
            amount: Math.round(hubWeightKg * 45),
            status: 'AVAILABLE',
            linkedBookingId: lot.sourceBookingId
          },
          ...prev
        ]);
      }
    }

    // Custody Event
    setCustodyEvents((prev) => [
      {
        id: `CUST-EV-${Date.now().toString().slice(-5)}`,
        lotId,
        timestamp: nowIso,
        sender: lot.primaryCollector,
        receiver: 'Rahmat Ali (Gulshan Hub #3 Weighmaster)',
        location: 'Gulshan Aggregation Hub #3 (Scale #GW-01)',
        quantityKg: hubWeightKg,
        measurementMethod: 'Certified Platform Floor Scale (OIML R76 Class III)',
        evidenceLevelResult: 'E2',
        verifiedBy: 'Rahmat Ali (Weighmaster)',
        signatureOrHash: `sha256:${Math.random().toString(16).slice(2, 12)}`
      },
      ...prev
    ]);

    addAuditLog(
      'HUB_SCALE_MEASUREMENT',
      'MaterialLot',
      lotId,
      `Measured on certified scale: ${hubWeightKg} kg vs field ${lot.initialFieldWeightKg} kg (Delta: ${deltaPercent}%). Evidence Level: E2.`
    );

    showToast(
      isDiscrepant
        ? `Warning: Discrepancy ${deltaPercent}% exceeds 5% tolerance. Flagged for review.`
        : `Scale verified: ${hubWeightKg} kg accepted. Evidence Level E2 confirmed.`
    );
  };

  const resolveDiscrepancy = (lotId: string, resolutionReason: string) => {
    setLots((prev) =>
      prev.map((l) => (l.id === lotId ? { ...l, discrepancyResolved: true } : l))
    );
    setBookings((prev) =>
      prev.map((b) =>
        b.notes?.includes(lotId) || b.id.includes(lotId.slice(4, 7))
          ? { ...b, status: 'QUANTITY_CONFIRMED', discrepancyFlag: false, pointsStatus: 'available' }
          : b
      )
    );
    addAuditLog('DISCREPANCY_RESOLVED', 'MaterialLot', lotId, resolutionReason);
    showToast(`Discrepancy for ${lotId} marked resolved. Audit note logged.`);
  };

  const commitSorting = (
    inputLotId: string,
    outputs: { materialGrade: string; outputWeightKg: number; childLotId: string; destinationProcessor: string }[],
    residueKg: number,
    residueDisposition: string
  ) => {
    const parentLot = lots.find((l) => l.id === inputLotId);
    if (!parentLot) return;

    const nowIso = new Date().toISOString();
    const transformationId = `SORT-TR-${Date.now().toString().slice(-4)}`;

    const newTransformation: SortingTransformation = {
      id: transformationId,
      inputLotId,
      timestamp: nowIso,
      facility: 'Gulshan Hub #3 Manual & Air Sorting Line',
      operator: 'Rahmat Ali (Senior Sorter)',
      inputWeightKg: parentLot.verifiedHubWeightKg || parentLot.initialFieldWeightKg,
      outputs,
      residueContaminationKg: residueKg,
      residueDisposition
    };
    setSortingTransformations((prev) => [newTransformation, ...prev]);

    // Create Child Lots
    const childLots: MaterialLot[] = outputs.map((out) => ({
      id: out.childLotId,
      material: parentLot.material,
      primaryCollector: parentLot.primaryCollector,
      initialFieldWeightKg: out.outputWeightKg,
      verifiedHubWeightKg: out.outputWeightKg,
      currentCustodian: 'AGGREGATION_HUB',
      location: `Baled at Gulshan Hub #3 -> Ready for ${out.destinationProcessor}`,
      evidenceLevel: 'E2',
      parentLotId: inputLotId,
      createdAt: nowIso,
      updatedAt: nowIso
    }));

    setLots((prev) => [
      ...childLots,
      ...prev.map((l) =>
        l.id === inputLotId
          ? {
              ...l,
              childLotIds: outputs.map((o) => o.childLotId),
              sortingLossResidueKg: residueKg,
              updatedAt: nowIso
            }
          : l
      )
    ]);

    addAuditLog(
      'SORTING_TRANSFORMATION',
      'SortingTransformation',
      transformationId,
      `Split lot ${inputLotId} into ${outputs.length} fractions. Residue: ${residueKg} kg accounted.`
    );
    showToast(`Sorting committed! Split into ${outputs.length} child lots; residue accounted.`);
  };

  const recordProcessingOutcome = (
    lotId: string,
    processorName: string,
    processType: 'MECHANICAL_PET_FLAKING' | 'HDPE_PELLETIZING' | 'PULPING_AND_CORRUGATING' | 'ALUMINUM_SMELTING',
    outputYieldKg: number,
    processLossKg: number,
    certId: string
  ) => {
    const nowIso = new Date().toISOString();
    const dispRecord: ProcessingDisposition = {
      id: `PROC-DISP-${Date.now().toString().slice(-4)}`,
      lotId,
      processorName,
      facilityLocation: 'Bengal Polymers & Flake Mill, Savar',
      intakeTimestamp: nowIso,
      processType,
      outputYieldKg,
      processLossKg,
      dispositionCertificateId: certId,
      completedAt: nowIso,
      evidenceLevel: 'E4' // Processing outcome confirmed
    };
    setProcessingDispositions((prev) => [dispRecord, ...prev]);

    // Advance lot to E4
    setLots((prev) =>
      prev.map((l) =>
        l.id === lotId
          ? {
              ...l,
              currentCustodian: 'FINISHED_RECOVERED',
              location: `${processorName} (Batch Complete)`,
              evidenceLevel: 'E4',
              updatedAt: nowIso
            }
          : l
      )
    );

    // Advance booking if matching
    const lot = lots.find((l) => l.id === lotId);
    if (lot?.sourceBookingId) {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === lot.sourceBookingId
            ? { ...b, status: 'PROCESSED', evidenceLevel: 'E4' }
            : b
        )
      );
    }

    addAuditLog(
      'PROCESSING_OUTCOME_CONFIRMED',
      'ProcessingDisposition',
      dispRecord.id,
      `Conversion outcome documented for lot ${lotId}: yield ${outputYieldKg} kg, loss ${processLossKg} kg. E4 confirmed.`
    );
    showToast(`E4 Processing Outcome Confirmed by ${processorName}! Certificate: ${certId}`);
  };

  // Redeem Reward
  const redeemReward = (rewardId: string): { success: boolean; message: string; couponCode?: string } => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return { success: false, message: 'Reward not found.' };

    const availPoints = customerAvailablePoints;
    if (availPoints < reward.pointsCost) {
      return {
        success: false,
        message: `Insufficient available points (Balance: ${availPoints}, Required: ${reward.pointsCost}). Points in pending status cannot be redeemed.`
      };
    }

    if (reward.stockAvailable <= 0) {
      return { success: false, message: 'Reward item is currently out of stock.' };
    }

    const code = `CL-${reward.category.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    // Deduct stock
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, stockAvailable: r.stockAvailable - 1 } : r))
    );

    // Ledger debit
    const ledgerEntry: PointsLedgerEntry = {
      id: `PTS-${Date.now().toString().slice(-5)}`,
      customerId: 'CUST-H-801',
      timestamp: nowIso,
      ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
      sourceEvent: 'REWARD_REDEMPTION_FULFILLED',
      description: `Redeemed ${reward.title} (Partner: ${reward.partnerName})`,
      type: 'DEBIT',
      amount: -reward.pointsCost,
      status: 'REDEEMED'
    };
    setPointsLedger((prev) => [ledgerEntry, ...prev]);

    // Redemption record
    const redRecord: CustomerRedemption = {
      id: `RED-${Date.now().toString().slice(-4)}`,
      customerId: 'CUST-H-801',
      rewardId,
      rewardTitle: reward.title,
      pointsDeducted: reward.pointsCost,
      couponCode: code,
      status: 'COMPLETED',
      timestamp: nowIso
    };
    setRedemptions((prev) => [redRecord, ...prev]);

    addAuditLog('POINTS_REDEEMED', 'RewardItem', rewardId, `Redeemed ${reward.pointsCost} points for ${reward.title}`);
    showToast(`Redemption successful! Your code: ${code}`);
    return { success: true, message: 'Redemption successful!', couponCode: code };
  };

  const fileComplaint = (type: any, description: string, bookingId?: string) => {
    const nowIso = new Date().toISOString();
    const newComp: ServiceComplaint = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      customerId: 'CUST-H-801',
      customerName: 'Nasreen Akhter',
      type,
      bookingId,
      description,
      status: 'OPEN',
      createdAt: nowIso
    };
    setComplaints((prev) => [newComp, ...prev]);
    addAuditLog('COMPLAINT_FILED', 'ServiceComplaint', newComp.id, `Complaint: ${type}`);
    showToast(`Support ticket ${newComp.id} submitted. Our clean lane coordinator is reviewing.`);
  };

  const createEvidencePackage = (pkg: Omit<EvidencePackage, 'id' | 'approvedDate'>) => {
    const id = `EVP-${Date.now().toString().slice(-5)}`;
    const newPkg: EvidencePackage = {
      ...pkg,
      id,
      approvedDate: new Date().toISOString().split('T')[0]
    };
    setEvidencePackages((prev) => [newPkg, ...prev]);
    addAuditLog('EVIDENCE_PACKAGE_APPROVED', 'EvidencePackage', id, `E5 evidence package created for ${pkg.sponsorName}`);
    showToast(`Evidence Package ${id} sealed and approved for EPR reporting.`);
  };

  // Computed values
  const customerAvailablePoints = pointsLedger
    .filter((p) => p.customerId === 'CUST-H-801' && p.status === 'AVAILABLE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const customerPendingPoints = pointsLedger
    .filter((p) => p.customerId === 'CUST-H-801' && p.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Accurate Pilot KPIs (Reporting rule: Collected, Accepted, Processed, Verified counted separately)
  const totalCollectedKg = lots.reduce((acc, l) => acc + l.initialFieldWeightKg, 0);
  const totalAcceptedKg = lots.reduce((acc, l) => acc + (l.verifiedHubWeightKg || 0), 0);
  const totalProcessedKg = processingDispositions.reduce((acc, p) => acc + p.outputYieldKg, 0);
  const totalVerifiedEprKg = evidencePackages.reduce((acc, ep) => acc + ep.evidencedWeightKg, 0);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        lang,
        setLang,
        isOfflineMode,
        setIsOfflineMode,
        offlineQueueCount,
        syncOfflineQueue,
        bookings,
        jobs,
        lots,
        custodyEvents,
        sortingTransformations,
        processingDispositions,
        pointsLedger,
        rewards,
        redemptions,
        complaints,
        campaigns,
        evidencePackages,
        serviceZones,
        auditLogs,
        activeToast,
        showToast,
        createBooking,
        cancelBooking,
        acceptJob,
        completeJob,
        recordJobException,
        verifyHubScaleWeight,
        resolveDiscrepancy,
        commitSorting,
        recordProcessingOutcome,
        redeemReward,
        fileComplaint,
        createEvidencePackage,
        customerAvailablePoints,
        customerPendingPoints,
        totalCollectedKg,
        totalAcceptedKg,
        totalProcessedKg,
        totalVerifiedEprKg
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
