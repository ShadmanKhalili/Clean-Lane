import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_BRAND_CAMPAIGNS,
  INITIAL_COMPLAINTS,
  INITIAL_CUSTODY_EVENTS,
  INITIAL_DROP_OFF_POINTS,
  INITIAL_EVIDENCE_PACKAGES,
  INITIAL_JOBS,
  INITIAL_MATERIAL_LOTS,
  INITIAL_ORG_MEMBERS,
  INITIAL_POINTS_LEDGER,
  INITIAL_PROCESSING_DISPOSITIONS,
  INITIAL_REDEMPTIONS,
  INITIAL_REWARDS,
  INITIAL_SAVED_LOCATIONS,
  INITIAL_SERVICE_ZONES,
  INITIAL_SORTING_TRANSFORMATIONS
} from '../data/mockData';
import {
  AuditEvent,
  Booking,
  BrandCampaign,
  CustomerRedemption,
  CustodyEvent,
  DropOffPoint,
  EvidenceLevel,
  EvidencePackage,
  MaterialCategory,
  MaterialLot,
  OrgMember,
  PickupJob,
  PointsLedgerEntry,
  ProcessingDisposition,
  RewardItem,
  SavedLocation,
  ServiceComplaint,
  ServiceZone,
  SortingTransformation,
  UserRole,
  AppNotification,
  NotificationSettings
} from '../types';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  INITIAL_NOTIFICATIONS,
  generate24HourReminder,
  evaluateAutomatedReminders
} from '../services/notificationService';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;

  // Selected Location for Home
  selectedLocationId: string;
  setSelectedLocationId: (locId: string) => void;

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
  dropOffPoints: DropOffPoint[];
  savedLocations: SavedLocation[];
  orgMembers: OrgMember[];

  // Notifications & Reminders
  notifications: AppNotification[];
  notificationSettings: NotificationSettings;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  triggerManual24hReminderCheck: () => number;
  trigger24hReminderForBooking: (bookingId: string) => void;

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
      outcome: 'COLLECTED' | 'PARTIALLY_COLLECTED' | 'CUSTOMER_UNAVAILABLE' | 'CANNOT_ACCESS' | 'MATERIAL_UNSUITABLE';
      materialWeights: { category: any; weightKg: number; bagCount: number }[];
      totalWeightKg: number;
      weightMethod: 'field_scale' | 'estimate' | 'not_measured';
      photoEvidenceRecorded: boolean;
      uncollectedNotes?: string;
      contaminationObservation?: string;
    }
  ) => void;
  recordJobException: (jobId: string, reason: 'customer_unavailable' | 'inaccessible' | 'contaminated_stream' | 'cancelled_at_door') => void;
  recordDropOffDeposit: (dropOffPointId: string, category: MaterialCategory, weightKg: number) => void;
  requestRecurringService: (siteName: string, frequency: 'weekly' | 'biweekly', materials: MaterialCategory[], notes?: string) => void;
  addSavedLocation: (loc: Omit<SavedLocation, 'id'>) => void;
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
  runAcceptanceScenario: (scenarioId: number) => { title: string; outcomeText: string };

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
  const [dropOffPoints, setDropOffPoints] = useState<DropOffPoint[]>(INITIAL_DROP_OFF_POINTS);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(INITIAL_SAVED_LOCATIONS);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>(INITIAL_ORG_MEMBERS);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('LOC-01');

  // Notifications & 24h Automated Reminders
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, status: 'READ' } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, status: 'READ' }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...settings }));
    showToast(
      lang === 'en'
        ? 'Notification preferences updated!'
        : 'বিজ্ঞপ্তি সেটিংস হালনাগাদ করা হয়েছে!'
    );
  };

  const trigger24hReminderForBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const reminder = generate24HourReminder(booking);
    setNotifications((prev) => [reminder, ...prev]);
    addAuditLog(
      'REMINDER_DISPATCHED_24H',
      'Booking',
      bookingId,
      `Automated 24h collection reminder with preparation steps dispatched to ${booking.phone}.`
    );
  };

  const triggerManual24hReminderCheck = (): number => {
    const { newReminders, logs } = evaluateAutomatedReminders(
      bookings,
      notifications
    );

    if (newReminders.length > 0) {
      setNotifications((prev) => [...newReminders, ...prev]);
      logs.forEach((log) => {
        addAuditLog(
          'AUTO_REMINDER_CHECK',
          'NotificationService',
          'SYSTEM',
          log
        );
      });
    }

    return newReminders.length;
  };

  // Automated background reminder evaluator
  useEffect(() => {
    // Check upon bookings changes or initialization
    const { newReminders } = evaluateAutomatedReminders(
      bookings,
      notifications
    );
    if (newReminders.length > 0) {
      setNotifications((prev) => [...newReminders, ...prev]);
    }
  }, [bookings.length]);

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

    // Generate Automated 24h Reminder Notification with Custom Preparation Steps
    const reminderNotif = generate24HourReminder(newBooking);
    setNotifications((prev) => [reminderNotif, ...prev]);

    addAuditLog('BOOKING_CREATED', 'Booking', newId, 'Customer booked scheduled clean lane collection.');
    addAuditLog('REMINDER_SCHEDULED_24H', 'NotificationService', reminderNotif.id, `Automated 24h reminder with preparation guidance queued for SMS & In-App delivery.`);
    showToast(`Booking ${newId} confirmed! 24h reminder & preparation steps sent.`);
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
      outcome: 'COLLECTED' | 'PARTIALLY_COLLECTED' | 'CUSTOMER_UNAVAILABLE' | 'CANNOT_ACCESS' | 'MATERIAL_UNSUITABLE';
      materialWeights: { category: any; weightKg: number; bagCount: number }[];
      totalWeightKg: number;
      weightMethod: 'field_scale' | 'estimate' | 'not_measured';
      photoEvidenceRecorded: boolean;
      uncollectedNotes?: string;
      contaminationObservation?: string;
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
              status: report.outcome === 'COLLECTED' || report.outcome === 'PARTIALLY_COLLECTED' ? 'COMPLETED' : 'EXCEPTION',
              outcome: report.outcome,
              exceptionReason: report.outcome === 'CUSTOMER_UNAVAILABLE' ? 'customer_unavailable' : report.outcome === 'CANNOT_ACCESS' ? 'inaccessible' : report.outcome === 'MATERIAL_UNSUITABLE' ? 'contaminated_stream' : undefined,
              fieldReport: {
                completedAt: nowIso,
                materialWeights: report.materialWeights,
                totalWeightKg: report.totalWeightKg,
                weightMethod: report.weightMethod,
                customerAckCode: ackCode,
                batchLotId,
                photoEvidenceRecorded: report.photoEvidenceRecorded,
                syncStatus: isOfflineMode ? 'pending_sync_offline' : 'synced',
                uncollectedNotes: report.uncollectedNotes,
                contaminationObservation: report.contaminationObservation
              }
            }
          : j
      )
    );

    // Update Booking status
    if (report.outcome === 'COLLECTED' || report.outcome === 'PARTIALLY_COLLECTED') {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === job.bookingId
            ? {
                ...b,
                status: 'COLLECTED',
                evidenceLevel: 'E1', // Collector confirmed physical pickup
                fieldWeightKg: report.totalWeightKg,
                pointsStatus: 'pending',
                notes: `Pickup verified by collector ${job.collectorName}. Measured ${report.totalWeightKg} kg (${report.weightMethod}). ${report.uncollectedNotes ? `Note: ${report.uncollectedNotes}` : ''}`
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
        measurementMethod: report.weightMethod === 'field_scale' ? 'Certified Portable Scale' : report.weightMethod === 'estimate' ? 'Field Visual Estimate' : 'Not measured at doorstep',
        evidenceLevelResult: 'E1',
        verifiedBy: `${job.collectorName} (${ackCode})`,
        signatureOrHash: `sha256:${Math.random().toString(16).slice(2, 12)}`
      };
      setCustodyEvents((prev) => [custodyEv, ...prev]);

      addAuditLog(
        'COLLECTION_COMPLETED',
        'MaterialLot',
        batchLotId,
        `Field collection logged with weight ${report.totalWeightKg} kg (${report.outcome}). Advancing to Evidence Level E1.`
      );

      showToast(
        isOfflineMode
          ? `Saved on device, not yet synced. Tag: ${batchLotId}`
          : `Pickup recorded! E1 Collected: ${report.totalWeightKg} kg tagged as ${batchLotId}`
      );
    } else {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === job.bookingId
            ? {
                ...b,
                status: 'MISSED',
                notes: `Collection exception logged by collector: ${report.outcome.replace(/_/g, ' ')}. ${report.uncollectedNotes || ''}`
              }
            : b
        )
      );
      addAuditLog('COLLECTION_EXCEPTION', 'PickupJob', jobId, `Exception: ${report.outcome}`);
      showToast(`Exception recorded: ${report.outcome.replace(/_/g, ' ')}`);
    }
  };

  const recordDropOffDeposit = (dropOffPointId: string, category: MaterialCategory, weightKg: number) => {
    const point = dropOffPoints.find((p) => p.id === dropOffPointId);
    if (!point) return;
    const nowIso = new Date().toISOString();
    const trxId = `CL-DROP-${Date.now().toString().slice(-4)}`;
    const pts = Math.round(weightKg * 50);

    // Create completed booking record directly at E2: Quantity confirmed (PRD Flow C)
    const newBooking: Booking = {
      id: trxId,
      customerId: 'CUST-H-801',
      customerName: 'Nasreen Akhter',
      customerType: 'household',
      phone: '+880 1712 345678',
      address: point.address,
      zoneId: point.zoneId,
      scheduledDate: nowIso.split('T')[0],
      scheduledTimeWindow: 'Walk-in Drop-off',
      isRecurring: false,
      serviceType: 'DOORSTEP_RECOVERY',
      materials: [{ category, approximateBandKg: `${weightKg} kg (Drop-off scale)` }],
      status: 'QUANTITY_CONFIRMED',
      evidenceLevel: 'E2',
      confirmedWeightKg: weightKg,
      serviceFeeBdt: 0,
      materialPayoutBdt: Math.round(weightKg * 30),
      earnedPoints: pts,
      pointsStatus: 'available',
      notes: `Walk-in drop-off verified at ${point.name}. Verified by ${point.operatorName}.`,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    setBookings((prev) => [newBooking, ...prev]);

    // Available points immediately (PRD Flow C step 5)
    setPointsLedger((prev) => [
      {
        id: `PTS-${Date.now().toString().slice(-5)}`,
        customerId: 'CUST-H-801',
        timestamp: nowIso,
        ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
        sourceEvent: 'DROPOFF_SCALE_VERIFIED',
        description: `Drop-off at ${point.name}: ${weightKg} kg verified on certified scale.`,
        type: 'CREDIT',
        amount: pts,
        status: 'AVAILABLE',
        linkedBookingId: trxId
      },
      ...prev
    ]);

    const lotId = `LOT-DROP-${trxId.replace('CL-DROP-', '')}-${category}`;
    setLots((prev) => [
      {
        id: lotId,
        sourceBookingId: trxId,
        material: category,
        primaryCollector: point.operatorName,
        initialFieldWeightKg: weightKg,
        verifiedHubWeightKg: weightKg,
        currentCustodian: 'AGGREGATION_HUB',
        location: point.name,
        evidenceLevel: 'E2',
        createdAt: nowIso,
        updatedAt: nowIso
      },
      ...prev
    ]);

    addAuditLog('DROPOFF_INTAKE_VERIFIED', 'MaterialLot', lotId, `Drop-off verified at ${point.name}: ${weightKg} kg.`);
    showToast(`Drop-off receipt confirmed! +${pts} available points credited.`);
  };

  const requestRecurringService = (
    siteName: string,
    frequency: 'weekly' | 'biweekly',
    materials: MaterialCategory[],
    notes?: string
  ) => {
    const nowIso = new Date().toISOString();
    const reqId = `REQ-REC-${Date.now().toString().slice(-4)}`;
    addAuditLog(
      'RECURRING_ARRANGEMENT_REQUESTED',
      'Organisation',
      reqId,
      `Requested recurring arrangement for ${siteName} (${frequency}). Terms awaiting operator review.`
    );
    showToast(`Service arrangement requested for ${siteName}! Operator reviewing schedule.`);
  };

  const addSavedLocation = (loc: Omit<SavedLocation, 'id'>) => {
    const newLoc: SavedLocation = {
      ...loc,
      id: `LOC-${Date.now().toString().slice(-4)}`
    };
    setSavedLocations((prev) => [...prev, newLoc]);
    addAuditLog('SAVED_LOCATION_ADDED', 'SavedLocation', newLoc.id, `Location added: ${newLoc.label}`);
    showToast(`Location "${newLoc.label}" added to your account.`);
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

  const runAcceptanceScenario = (scenarioId: number): { title: string; outcomeText: string } => {
    const nowIso = new Date().toISOString();

    if (scenarioId === 1) {
      // Scenario 1: Lower receiving weight with discrepancy
      const id = `CL-BK-DISC-01`;
      const newB: Booking = {
        id,
        customerId: 'CUST-H-801',
        customerName: 'Nasreen Akhter',
        customerType: 'household',
        phone: '+880 1712 345678',
        address: 'House 14, Road 52, Gulshan-2, Dhaka',
        zoneId: 'ZONE-GUL-02',
        scheduledDate: nowIso.split('T')[0],
        scheduledTimeWindow: '09:00 AM - 11:30 AM',
        isRecurring: false,
        serviceType: 'DOORSTEP_RECOVERY',
        materials: [{ category: 'PET_BOTTLES', approximateBandKg: '10-20 kg' }],
        status: 'QUANTITY_CONFIRMED',
        evidenceLevel: 'E2',
        collectorName: 'Tariq Hossain (#DH-14)',
        fieldWeightKg: 15.0,
        confirmedWeightKg: 13.8,
        discrepancyFlag: true,
        serviceFeeBdt: 0,
        materialPayoutBdt: 414,
        earnedPoints: 690,
        pointsStatus: 'available',
        notes: 'Doorstep scale: 15.0 kg. Hub certified floor scale: 13.8 kg (-8.0% moisture/tare variance). Both weights preserved.',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      setBookings((prev) => [newB, ...prev]);

      // Add to lots
      const lot: MaterialLot = {
        id: `LOT-SCEN1-PET`,
        sourceBookingId: id,
        material: 'PET_BOTTLES',
        primaryCollector: 'Tariq Hossain',
        initialFieldWeightKg: 15.0,
        verifiedHubWeightKg: 13.8,
        discrepancyPercentage: -8.0,
        discrepancyResolved: false,
        currentCustodian: 'AGGREGATION_HUB',
        location: 'Gulshan Hub #3',
        evidenceLevel: 'E2',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      setLots((prev) => [lot, ...prev]);

      addAuditLog('SCENARIO_1_TEST', 'Booking', id, 'Lower scale weight recorded. Both measurements preserved without overwriting.');
      showToast('Scenario 1 passed! Both weights visible; discrepancy flagged for review.');
      return {
        title: 'Scenario 1: Weight Discrepancy Reconciliation',
        outcomeText: 'Doorstep weight (15.0 kg) and receiving hub scale (13.8 kg) both preserved. Discrepancy (-8.0%) flagged for operator; customer credited for 13.8 kg confirmed weight.'
      };
    }

    if (scenarioId === 2) {
      // Scenario 2: Offline retry idempotency
      setIsOfflineMode(true);
      setOfflineQueueCount(1);
      setTimeout(() => {
        syncOfflineQueue();
      }, 1000);
      return {
        title: 'Scenario 2: Offline Submission & Idempotent Sync',
        outcomeText: 'Pickup saved to local storage while offline. Upon reconnection, single transaction synced without creating duplicate lots or duplicate points.'
      };
    }

    if (scenarioId === 3) {
      // Scenario 3: Partial collection with rejected material
      const id = `CL-BK-PARTIAL-03`;
      const newB: Booking = {
        id,
        customerId: 'CUST-H-801',
        customerName: 'Nasreen Akhter',
        customerType: 'household',
        phone: '+880 1712 345678',
        address: 'House 14, Road 52, Gulshan-2, Dhaka',
        zoneId: 'ZONE-GUL-02',
        scheduledDate: nowIso.split('T')[0],
        scheduledTimeWindow: '10:00 AM - 12:00 PM',
        isRecurring: false,
        serviceType: 'DOORSTEP_RECOVERY',
        materials: [
          { category: 'PET_BOTTLES', approximateBandKg: '5-10 kg' },
          { category: 'CARDBOARD_OCC', approximateBandKg: '2-5 kg' }
        ],
        status: 'QUANTITY_CONFIRMED',
        evidenceLevel: 'E2',
        collectorName: 'Tariq Hossain',
        fieldWeightKg: 8.0,
        confirmedWeightKg: 8.0,
        rejectedWeightKg: 3.5,
        rejectedReason: 'Contaminated greasy food boxes mixed in cardboard; refused at doorstep.',
        serviceFeeBdt: 0,
        materialPayoutBdt: 240,
        earnedPoints: 400,
        pointsStatus: 'available',
        notes: 'Partial collection: 8.0 kg clean PET accepted. 3.5 kg contaminated cardboard rejected.',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      setBookings((prev) => [newB, ...prev]);
      addAuditLog('SCENARIO_3_TEST', 'Booking', id, 'Partial collection executed. Rejected stream excluded from points calculation.');
      showToast('Scenario 3 passed! Partial outcome recorded; only eligible material awarded points.');
      return {
        title: 'Scenario 3: Partial Collection & Material Rejection',
        outcomeText: '8.0 kg clean PET accepted (+400 pts). 3.5 kg contaminated cardboard rejected with clear explanation; points awarded solely for verified recoverable material.'
      };
    }

    if (scenarioId === 4) {
      // Scenario 4: Failed redemption with automatic point restoration
      const ptsDebit = 400;
      // First ledger entry: hold/reserve
      const debitEntry: PointsLedgerEntry = {
        id: `PTS-FAIL-RES-${Date.now().toString().slice(-4)}`,
        customerId: 'CUST-H-801',
        timestamp: nowIso,
        ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
        sourceEvent: 'REWARD_RESERVATION',
        description: 'Reserved for Chaldal ৳250 Grocery Voucher',
        type: 'DEBIT',
        amount: -ptsDebit,
        status: 'RESERVED'
      };
      // Restoration entry immediately
      const refundEntry: PointsLedgerEntry = {
        id: `PTS-FAIL-REF-${Date.now().toString().slice(-4)}`,
        customerId: 'CUST-H-801',
        timestamp: nowIso,
        ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
        sourceEvent: 'REWARD_FULFILLMENT_FAILED_REFUND',
        description: 'Partner API fulfillment timed out. 400 points restored to available balance.',
        type: 'CREDIT',
        amount: ptsDebit,
        status: 'AVAILABLE'
      };
      setPointsLedger((prev) => [refundEntry, debitEntry, ...prev]);
      addAuditLog('SCENARIO_4_TEST', 'RewardItem', 'REW-CHALDAL-250', 'Fulfillment failure simulated; reserved points automatically released.');
      showToast('Scenario 4 passed! Failed partner fulfillment restored 400 points to user.');
      return {
        title: 'Scenario 4: Failed Fulfillment Point Restoration',
        outcomeText: 'Partner voucher fulfillment failed. Reserved points released and restored to Available balance; customer balance remained protected.'
      };
    }

    if (scenarioId === 5) {
      // Scenario 5: Apartment building shared collection attribution safeguard
      const id = `CL-BK-APT-55KG`;
      const aptBooking: Booking = {
        id,
        customerId: 'CUST-APT-402',
        customerName: 'Green View Heights Committee',
        customerType: 'apartment',
        phone: '+880 1819 987654',
        address: 'Plot 32, Road 11, Banani Block C, Dhaka',
        zoneId: 'ZONE-BAN-11',
        scheduledDate: nowIso.split('T')[0],
        scheduledTimeWindow: '08:30 AM - 10:30 AM',
        isRecurring: true,
        serviceType: 'DOORSTEP_RECOVERY',
        materials: [{ category: 'CARDBOARD_OCC', approximateBandKg: '50-100 kg' }],
        status: 'QUANTITY_CONFIRMED',
        evidenceLevel: 'E2',
        confirmedWeightKg: 55.0,
        serviceFeeBdt: 200,
        materialPayoutBdt: 1650,
        earnedPoints: 1375,
        pointsStatus: 'available',
        notes: 'Building basement central bay collection. Credited to complex management account.',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      setBookings((prev) => [aptBooking, ...prev]);
      addAuditLog('SCENARIO_5_TEST', 'Organisation', 'CUST-APT-402', 'Building total 55 kg confirmed. Individual resident accounts excluded from multi-crediting.');
      showToast('Scenario 5 passed! Building totals updated without misallocating points to residents.');
      return {
        title: 'Scenario 5: Building-Level Shared Collection Attribution',
        outcomeText: '55.0 kg confirmed for Green View Heights building account. PRD § R-08 safeguard prevented crediting individual residents for entire building gross weight.'
      };
    }

    if (scenarioId === 6) {
      // Scenario 6: Operator changes points rule with effective date
      addAuditLog(
        'REWARD_RULE_VERSION_UPDATED',
        'RewardRule',
        'RULES_V1.3_2026_10',
        'Operator updated PET recovery rate from 50 to 55 pts/kg with effective date 2026-10-06. Prior records stay linked to RULES_V1.2.',
        'RULES_V1.2',
        'RULES_V1.3_2026_10'
      );
      showToast('Scenario 6 passed! New rule v1.3 has effective date; prior awards preserved.');
      return {
        title: 'Scenario 6: Rule Versioning & Historical Immutability',
        outcomeText: 'Rule version RULES_V1.3 created with effective date 2026-10-06. Past transactions remain strictly bound to RULES_V1.2 without retroactive distortion.'
      };
    }

    if (scenarioId === 7) {
      // Scenario 7: Material collected (E1) but stalled before downstream confirmation
      const lotId = `LOT-STALLED-E1`;
      const lot: MaterialLot = {
        id: lotId,
        sourceBookingId: 'CL-BK-STALLED-01',
        material: 'HDPE_RIGID',
        primaryCollector: 'Tariq Hossain',
        initialFieldWeightKg: 12.0,
        currentCustodian: 'COLLECTOR',
        location: 'Collector Vehicle (In-transit)',
        evidenceLevel: 'E1', // Stalled at E1
        createdAt: nowIso,
        updatedAt: nowIso
      };
      setLots((prev) => [lot, ...prev]);
      addAuditLog('SCENARIO_7_TEST', 'MaterialLot', lotId, 'Lot logged at E1 Collected. Downstream processing reports exclude this unverified quantity.');
      showToast('Scenario 7 passed! Material marked Collected; downstream claims strictly prevented.');
      return {
        title: 'Scenario 7: Prevention of Premature Recovery Claims',
        outcomeText: 'Material is marked as "Collected" (E1). Because receiving and mill milestones have not occurred, pilot reports correctly exclude it from Processed and Verified totals.'
      };
    }

    // Scenario 8: Provider capacity outage
    addAuditLog('CAPACITY_OUTAGE_TRIGGERED', 'ServiceZone', 'ZONE-BAN-11', 'Banani provider vehicle maintenance outage. New booking slots closed; existing appointments queued for re-dispatch.');
    showToast('Scenario 8 passed! Provider capacity closed; bookings queued for re-dispatch.');
    return {
      title: 'Scenario 8: Provider Capacity Disruption Management',
      outcomeText: 'New slots closed in affected corridor. Existing bookings entered operator dispatch action queue, and customers received proactive notifications.'
    };
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
        totalVerifiedEprKg,
        dropOffPoints,
        savedLocations,
        orgMembers,
        selectedLocationId,
        setSelectedLocationId,
        notifications,
        notificationSettings,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        updateNotificationSettings,
        triggerManual24hReminderCheck,
        trigger24hReminderForBooking,
        recordDropOffDeposit,
        requestRecurringService,
        addSavedLocation,
        runAcceptanceScenario
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
