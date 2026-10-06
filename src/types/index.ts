// Domain Types for Clean Lane Platform
// Aligned with PRD specifications

export type EvidenceLevel = 'E0' | 'E1' | 'E2' | 'E3' | 'E4' | 'E5';

export interface EvidenceLevelInfo {
  level: EvidenceLevel;
  customerLabel: string;
  customerLabelBn: string;
  description: string;
  allowedWording: string;
}

export const EVIDENCE_LEVELS: Record<EvidenceLevel, EvidenceLevelInfo> = {
  E0: {
    level: 'E0',
    customerLabel: 'Collection requested',
    customerLabelBn: 'সংগ্রহের অনুরোধ গৃহীত',
    description: 'Booking exists and scheduled in the operational clean lane.',
    allowedWording: 'Collection requested'
  },
  E1: {
    level: 'E1',
    customerLabel: 'Collected',
    customerLabelBn: 'সংগ্রহ সম্পন্ন',
    description: 'Field collector confirmed physical pickup at customer premises.',
    allowedWording: 'Collected'
  },
  E2: {
    level: 'E2',
    customerLabel: 'Quantity confirmed',
    customerLabelBn: 'পরিমাণ নিশ্চিত করা হয়েছে',
    description: 'Receiving hub certified platform scale verified weight and material grade.',
    allowedWording: 'Quantity confirmed'
  },
  E3: {
    level: 'E3',
    customerLabel: 'Entered approved recovery chain',
    customerLabelBn: 'অনুমোদিত প্রক্রিয়াকরণ শৃঙ্খলে প্রবেশ করেছে',
    description: 'Material transferred to licensed aggregation or pre-processing partner.',
    allowedWording: 'Entered approved recovery chain'
  },
  E4: {
    level: 'E4',
    customerLabel: 'Processing outcome confirmed',
    customerLabelBn: 'প্রক্রিয়াকরণের ফলাফল নিশ্চিত',
    description: 'End recycler or processor documented conversion disposition with loss accounting.',
    allowedWording: 'Processing outcome confirmed'
  },
  E5: {
    level: 'E5',
    customerLabel: 'Evidence package approved',
    customerLabelBn: 'যাচাইকৃত নথি অনুমোদিত',
    description: 'Defensible record package approved for defined EPR or brand partner claims.',
    allowedWording: 'Specific evidence package approved for defined partner use'
  }
};

export type UserRole =
  | 'customer_household'
  | 'customer_apartment'
  | 'customer_business'
  | 'collector'
  | 'aggregator'
  | 'processor'
  | 'operator'
  | 'brand_partner';

export type CustomerType = 'household' | 'apartment' | 'business' | 'institution';

export interface ServiceZone {
  id: string;
  name: string;
  city: string;
  status: 'active_clean_lane' | 'pilot_expansion' | 'inactive';
  coverageDescription: string;
  leadTimeHours: number;
  assignedEnterprise: string;
}

export type MaterialCategory =
  | 'PET_BOTTLES'
  | 'HDPE_RIGID'
  | 'CARDBOARD_OCC'
  | 'ALUMINUM_CANS'
  | 'LDPE_FILM'
  | 'TETRAPAK_BEVERAGE';

export interface MaterialCategoryInfo {
  id: MaterialCategory;
  name: string;
  nameBn: string;
  description: string;
  prepInstructions: string;
  prepInstructionsBn: string;
  cleanLaneAccepted: boolean;
  unitValueBdtPerKg: number; // For cash payout if applicable
  rewardPointsPerKg: number; // Base reward points
  excludedContaminants: string[];
}

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'COLLECTOR_ASSIGNED'
  | 'EN_ROUTE'
  | 'COLLECTED'
  | 'QUANTITY_UNDER_REVIEW'
  | 'QUANTITY_CONFIRMED'
  | 'ENTERED_RECOVERY_CHAIN'
  | 'PROCESSED'
  | 'CANCELLED'
  | 'MISSED'
  | 'DISPUTED';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerType: CustomerType;
  phone: string;
  address: string;
  zoneId: string;
  accessInstructions?: string;
  scheduledDate: string;
  scheduledTimeWindow: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly';
  serviceType: 'DOORSTEP_RECOVERY' | 'BULKY_CLEAN_LANE' | 'COMMERCIAL_BATCH' | 'BRAND_TAKEBACK';
  materials: {
    category: MaterialCategory;
    approximateBandKg: string; // e.g., '2-5 kg', '5-15 kg'
  }[];
  status: BookingStatus;
  evidenceLevel: EvidenceLevel;
  collectorId?: string;
  collectorName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  fieldWeightKg?: number;
  confirmedWeightKg?: number;
  serviceFeeBdt: number;
  materialPayoutBdt?: number;
  earnedPoints?: number;
  pointsStatus: 'potential' | 'pending' | 'available' | 'reversed' | 'redeemed';
  discrepancyFlag?: boolean;
}

export interface PickupJob {
  id: string;
  bookingId: string;
  collectorId: string;
  collectorName: string;
  customerAddress: string;
  customerPhone: string;
  accessNotes: string;
  scheduledWindow: string;
  expectedMaterials: MaterialCategory[];
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'COMPLETED' | 'EXCEPTION';
  exceptionReason?: 'customer_unavailable' | 'inaccessible' | 'contaminated_stream' | 'cancelled_at_door';
  fieldReport?: {
    completedAt: string;
    materialWeights: { category: MaterialCategory; weightKg: number; bagCount: number }[];
    totalWeightKg: number;
    weightMethod: 'field_hanging_scale' | 'customer_estimate' | 'receiving_scale_delegated';
    customerAckCode: string;
    batchLotId: string;
    photoEvidenceRecorded: boolean;
    syncStatus: 'synced' | 'pending_sync_offline';
  };
}

export interface MaterialLot {
  id: string;
  sourceBookingId?: string;
  sourceJobId?: string;
  material: MaterialCategory;
  primaryCollector: string;
  initialFieldWeightKg: number;
  verifiedHubWeightKg?: number;
  currentCustodian: 'COLLECTOR' | 'AGGREGATION_HUB' | 'PROCESSOR_FACILITY' | 'FINISHED_RECOVERED';
  location: string;
  evidenceLevel: EvidenceLevel;
  discrepancyPercentage?: number;
  discrepancyResolved?: boolean;
  parentLotId?: string;
  childLotIds?: string[];
  sortingLossResidueKg?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustodyEvent {
  id: string;
  lotId: string;
  timestamp: string;
  sender: string;
  receiver: string;
  location: string;
  quantityKg: number;
  measurementMethod: string;
  evidenceLevelResult: EvidenceLevel;
  verifiedBy: string;
  signatureOrHash: string;
}

export interface SortingTransformation {
  id: string;
  inputLotId: string;
  timestamp: string;
  facility: string;
  operator: string;
  inputWeightKg: number;
  outputs: {
    materialGrade: string;
    outputWeightKg: number;
    childLotId: string;
    destinationProcessor: string;
  }[];
  residueContaminationKg: number;
  residueDisposition: string;
}

export interface ProcessingDisposition {
  id: string;
  lotId: string;
  processorName: string;
  facilityLocation: string;
  intakeTimestamp: string;
  processType: 'MECHANICAL_PET_FLAKING' | 'HDPE_PELLETIZING' | 'PULPING_AND_CORRUGATING' | 'ALUMINUM_SMELTING';
  outputYieldKg: number;
  processLossKg: number;
  dispositionCertificateId: string;
  completedAt: string;
  evidenceLevel: EvidenceLevel;
}

export interface PointsLedgerEntry {
  id: string;
  customerId: string;
  timestamp: string;
  ruleVersion: string;
  sourceEvent: string;
  description: string;
  type: 'CREDIT' | 'DEBIT' | 'REVERSAL' | 'PENDING_HOLD';
  amount: number;
  status: 'PENDING' | 'AVAILABLE' | 'RESERVED' | 'REDEEMED' | 'REVERSED';
  linkedBookingId?: string;
}

export interface RewardItem {
  id: string;
  partnerName: string;
  title: string;
  titleBn: string;
  category: 'voucher' | 'groceries' | 'artisan' | 'utility' | 'donation';
  pointsCost: number;
  cashEquivalentBdt: number;
  description: string;
  validityDays: number;
  stockAvailable: number;
  funder: string;
}

export interface CustomerRedemption {
  id: string;
  customerId: string;
  rewardId: string;
  rewardTitle: string;
  pointsDeducted: number;
  couponCode: string;
  status: 'PENDING_FULFILLMENT' | 'COMPLETED' | 'FAILED_AND_REFUNDED';
  timestamp: string;
}

export interface ServiceComplaint {
  id: string;
  customerId: string;
  customerName: string;
  type: 'MISSED_COLLECTION' | 'WEIGHT_DISCREPANCY' | 'POINTS_CALCULATION' | 'BEHAVIOR' | 'OTHER';
  bookingId?: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface BrandCampaign {
  id: string;
  sponsorName: string;
  title: string;
  targetMaterial: MaterialCategory;
  eligibleZones: string[];
  startDate: string;
  endDate: string;
  targetRecoveryKg: number;
  allocatedVerifiedKg: number;
  bonusPointsPerKg: number;
  regulatoryFramework: string; // e.g., 'Bangladesh Solid Waste Management Rules 2021 (EPR Clause)'
  status: 'ACTIVE' | 'PLANNED' | 'AUDITED_CLOSED';
}

export interface EvidencePackage {
  id: string;
  campaignId: string;
  sponsorName: string;
  title: string;
  claimType: 'RECOVERED_POST_CONSUMER_PET' | 'RIGID_CIRCULAR_PACKAGING' | 'RESIDENTIAL_SEGREGATION_PILOT';
  period: string;
  evidencedWeightKg: number;
  includedLotCount: number;
  includedTransactionCount: number;
  evidenceLevelsCovered: EvidenceLevel[];
  exclusionsDisclosed: string;
  discrepanciesAudited: number;
  reviewerName: string;
  approvedDate: string;
  regulatoryCitation: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  targetObject: string;
  targetId: string;
  priorValue?: string;
  newValue?: string;
  reason: string;
}
