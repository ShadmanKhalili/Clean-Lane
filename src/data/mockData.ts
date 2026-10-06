import {
  Booking,
  BrandCampaign,
  CustomerRedemption,
  CustodyEvent,
  DropOffPoint,
  EvidencePackage,
  MaterialCategoryInfo,
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
  AuditEvent
} from '../types';

export const INITIAL_SERVICE_ZONES: ServiceZone[] = [
  {
    id: 'ZONE-GUL-02',
    name: 'Gulshan-2 North Clean Lane',
    city: 'Dhaka',
    status: 'active_clean_lane',
    coverageDescription: 'Roads 45 to 68, Lake Park perimeter residential & diplomatic corridor',
    leadTimeHours: 12,
    assignedEnterprise: 'Dhaka Clean Lane Enterprise #1'
  },
  {
    id: 'ZONE-BAN-11',
    name: 'Banani Block C & Road 11',
    city: 'Dhaka',
    status: 'active_clean_lane',
    coverageDescription: 'Mixed residential and commercial hospitality clean lane',
    leadTimeHours: 12,
    assignedEnterprise: 'Banani Recovery Collective'
  },
  {
    id: 'ZONE-DHA-9A',
    name: 'Dhanmondi 9A Institutional Lane',
    city: 'Dhaka',
    status: 'active_clean_lane',
    coverageDescription: 'Schools, colleges, and residential housing societies',
    leadTimeHours: 24,
    assignedEnterprise: 'Dhanmondi Circular Services'
  },
  {
    id: 'ZONE-BAR-EXP',
    name: 'Baridhara Diplomatic Enclave (Phase 2)',
    city: 'Dhaka',
    status: 'pilot_expansion',
    coverageDescription: 'Upcoming expansion lane - waitlist and assisted registration active',
    leadTimeHours: 48,
    assignedEnterprise: 'Pending Operations Review'
  }
];

export const MATERIAL_TAXONOMY: Record<string, MaterialCategoryInfo> = {
  PET_BOTTLES: {
    id: 'PET_BOTTLES',
    name: 'Clear & Light-Blue PET Bottles',
    nameBn: 'স্বচ্ছ ও হালকা নীল পিইটি বোতল',
    description: 'Post-consumer drinking water, soda, and juice bottles (Resin Code 1).',
    prepInstructions: 'Rinse thoroughly, flatten/crush to save space, remove liquid contents. Caps and labels can remain attached.',
    prepInstructionsBn: 'ভালোভাবে ধুয়ে শুকিয়ে নিন, চাপ দিয়ে সংকুচিত করুন। ক্যাপ এবং লেবেল সাথে রাখা যাবে।',
    cleanLaneAccepted: true,
    unitValueBdtPerKg: 32,
    rewardPointsPerKg: 50,
    excludedContaminants: ['Motor oil bottles', 'Unrinsed milk jars', 'Pesticide containers', 'Wet kitchen waste']
  },
  HDPE_RIGID: {
    id: 'HDPE_RIGID',
    name: 'Rigid HDPE Containers',
    nameBn: 'কঠিন এইচডিপিই কনটেইনার',
    description: 'Shampoo bottles, detergent jugs, cosmetic bottles, milk containers (Resin Code 2).',
    prepInstructions: 'Empty completely, brief water rinse, pump dispensers should be separated if contain metal springs.',
    prepInstructionsBn: 'সম্পূর্ণ খালি করুন, ধুয়ে নিন। মেটাল স্প্রিংযুক্ত পাম্প ডিসপেন্সার আলাদা রাখুন।',
    cleanLaneAccepted: true,
    unitValueBdtPerKg: 28,
    rewardPointsPerKg: 40,
    excludedContaminants: ['Paint buckets with dried paint', 'Chemical agro containers', 'Silicone tubes']
  },
  CARDBOARD_OCC: {
    id: 'CARDBOARD_OCC',
    name: 'Corrugated Cardboard (OCC)',
    nameBn: 'কার্টুন ও শক্ত পেপার বোর্ড',
    description: 'Clean shipping boxes, appliance packaging, corrugated sheets.',
    prepInstructions: 'Flatten completely, remove heavy packing tape, must be dry and free of food or oil stains.',
    prepInstructionsBn: 'সম্পূর্ণ চ্যাপ্টা করুন, অতিরিক্ত টেপ সরিয়ে নিন। তেল বা খাবারের দাগমুক্ত ও শুকনো হতে হবে।',
    cleanLaneAccepted: true,
    unitValueBdtPerKg: 18,
    rewardPointsPerKg: 25,
    excludedContaminants: ['Greasy pizza boxes', 'Wax-coated produce boxes', 'Water-logged soggy cardboard']
  },
  ALUMINUM_CANS: {
    id: 'ALUMINUM_CANS',
    name: 'Aluminum Beverage Cans',
    nameBn: 'অ্যালুমিনিয়াম ক্যান',
    description: 'Soft drink and beverage aluminum cans.',
    prepInstructions: 'Empty residue, rinse lightly, crush flat if possible.',
    prepInstructionsBn: 'খালি করে ধুয়ে নিন, সম্ভব হলে চাপ দিয়ে ছোট করুন।',
    cleanLaneAccepted: true,
    unitValueBdtPerKg: 110,
    rewardPointsPerKg: 100,
    excludedContaminants: ['Aerosol spray cans (pressurized)', 'Steel food cans with food residue', 'Foil wrappers']
  },
  LDPE_FILM: {
    id: 'LDPE_FILM',
    name: 'Clean LDPE Poly Film & Pouches',
    nameBn: 'পরিষ্কার এলডিপিই পলি ও প্যাকেজিং ফিল্ম',
    description: 'Clean grocery bags, bubble wrap, stretch film (Resin Code 4).',
    prepInstructions: 'Must be completely clean and dry. Shake out all dust or crumbs.',
    prepInstructionsBn: 'সম্পূর্ণ পরিষ্কার ও শুকনো হতে হবে। ধুলাবালি বা খাদ্যকণা মুক্ত রাখুন।',
    cleanLaneAccepted: true,
    unitValueBdtPerKg: 15,
    rewardPointsPerKg: 20,
    excludedContaminants: ['Multilayer foil sachets', 'Degraded fragile microplastics', 'Wet kitchen garbage bags']
  },
  TETRAPAK_BEVERAGE: {
    id: 'TETRAPAK_BEVERAGE',
    name: 'Aseptic Beverage Cartons (Tetra Pak)',
    nameBn: 'টেট্রা প্যাক পানীয় কার্টুন',
    description: 'Multi-layer juice and dairy cartons.',
    prepInstructions: 'Open corners, rinse inside, flatten completely.',
    prepInstructionsBn: 'কোণা খুলে ভেতরের তরল ধুয়ে পরিষ্কার করে চ্যাপ্টা করুন।',
    cleanLaneAccepted: true,
    unitValueBdtPerKg: 12,
    rewardPointsPerKg: 25,
    excludedContaminants: ['Straws inside containers', 'Mildewed milk cartons']
  }
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'CL-BK-2026-101',
    customerId: 'CUST-H-801',
    customerName: 'Nasreen Akhter',
    customerType: 'household',
    phone: '+880 1712 345678',
    address: 'House 14, Road 52, Gulshan-2, Dhaka',
    zoneId: 'ZONE-GUL-02',
    accessInstructions: 'Building security will buzz 3rd floor. Leave blue clean-lane sack near elevator.',
    scheduledDate: '2026-10-06',
    scheduledTimeWindow: '09:00 AM - 11:30 AM',
    isRecurring: false,
    serviceType: 'DOORSTEP_RECOVERY',
    materials: [
      { category: 'PET_BOTTLES', approximateBandKg: '2-5 kg' },
      { category: 'CARDBOARD_OCC', approximateBandKg: '5-15 kg' }
    ],
    status: 'COLLECTOR_ASSIGNED',
    evidenceLevel: 'E0',
    collectorId: 'COL-TARIQ-01',
    collectorName: 'Tariq Hossain (Vehicle #DH-14)',
    notes: 'Cleaned bottles from home consumption + flat delivery boxes.',
    createdAt: '2026-10-05T14:30:00Z',
    updatedAt: '2026-10-05T18:00:00Z',
    serviceFeeBdt: 0,
    earnedPoints: 175,
    pointsStatus: 'potential'
  },
  {
    id: 'CL-BK-2026-098',
    customerId: 'CUST-H-801',
    customerName: 'Nasreen Akhter',
    customerType: 'household',
    phone: '+880 1712 345678',
    address: 'House 14, Road 52, Gulshan-2, Dhaka',
    zoneId: 'ZONE-GUL-02',
    scheduledDate: '2026-09-28',
    scheduledTimeWindow: '10:00 AM - 12:00 PM',
    isRecurring: false,
    serviceType: 'DOORSTEP_RECOVERY',
    materials: [
      { category: 'PET_BOTTLES', approximateBandKg: '2-5 kg' },
      { category: 'HDPE_RIGID', approximateBandKg: '2-5 kg' }
    ],
    status: 'ENTERED_RECOVERY_CHAIN',
    evidenceLevel: 'E3',
    collectorId: 'COL-TARIQ-01',
    collectorName: 'Tariq Hossain',
    fieldWeightKg: 8.4,
    confirmedWeightKg: 8.2,
    serviceFeeBdt: 0,
    materialPayoutBdt: 245,
    earnedPoints: 370,
    pointsStatus: 'available',
    createdAt: '2026-09-27T10:00:00Z',
    updatedAt: '2026-09-29T16:20:00Z'
  },
  {
    id: 'CL-BK-2026-092',
    customerId: 'CUST-APT-402',
    customerName: 'Green View Heights Committee',
    customerType: 'apartment',
    phone: '+880 1819 987654',
    address: 'Plot 32, Road 11, Banani Block C, Dhaka',
    zoneId: 'ZONE-BAN-11',
    accessInstructions: 'Basement segregation bay #2. Building supervisor Mr. Kabir present.',
    scheduledDate: '2026-09-22',
    scheduledTimeWindow: '08:30 AM - 10:30 AM',
    isRecurring: true,
    recurringFrequency: 'weekly',
    serviceType: 'DOORSTEP_RECOVERY',
    materials: [
      { category: 'CARDBOARD_OCC', approximateBandKg: '20-50 kg' },
      { category: 'PET_BOTTLES', approximateBandKg: '10-20 kg' }
    ],
    status: 'PROCESSED',
    evidenceLevel: 'E4',
    collectorId: 'COL-TARIQ-01',
    collectorName: 'Tariq Hossain',
    fieldWeightKg: 46.5,
    confirmedWeightKg: 45.8,
    serviceFeeBdt: 200,
    materialPayoutBdt: 1120,
    earnedPoints: 1250,
    pointsStatus: 'available',
    createdAt: '2026-09-20T09:00:00Z',
    updatedAt: '2026-09-25T11:45:00Z'
  },
  {
    id: 'CL-BK-2026-104',
    customerId: 'CUST-BIZ-511',
    customerName: 'Artisan Roastery & Café',
    customerType: 'business',
    phone: '+880 1911 223344',
    address: 'Road 60, Gulshan-2, Dhaka',
    zoneId: 'ZONE-GUL-02',
    accessInstructions: 'Rear alley loading dock, ask for Store Lead Farhan.',
    scheduledDate: '2026-10-06',
    scheduledTimeWindow: '02:00 PM - 04:00 PM',
    isRecurring: true,
    recurringFrequency: 'weekly',
    serviceType: 'COMMERCIAL_BATCH',
    materials: [
      { category: 'CARDBOARD_OCC', approximateBandKg: '20-50 kg' },
      { category: 'HDPE_RIGID', approximateBandKg: '5-15 kg' },
      { category: 'ALUMINUM_CANS', approximateBandKg: '2-5 kg' }
    ],
    status: 'REQUESTED',
    evidenceLevel: 'E0',
    serviceFeeBdt: 150,
    earnedPoints: 850,
    pointsStatus: 'potential',
    createdAt: '2026-10-05T19:00:00Z',
    updatedAt: '2026-10-05T19:00:00Z'
  },
  {
    id: 'CL-BK-2026-095',
    customerId: 'CUST-H-709',
    customerName: 'Sultan Mahmud',
    customerType: 'household',
    phone: '+880 1678 112233',
    address: 'House 22, Road 48, Gulshan-2, Dhaka',
    zoneId: 'ZONE-GUL-02',
    scheduledDate: '2026-10-03',
    scheduledTimeWindow: '11:00 AM - 01:00 PM',
    isRecurring: false,
    serviceType: 'DOORSTEP_RECOVERY',
    materials: [{ category: 'PET_BOTTLES', approximateBandKg: '5-15 kg' }],
    status: 'QUANTITY_CONFIRMED',
    evidenceLevel: 'E2',
    collectorId: 'COL-TARIQ-01',
    collectorName: 'Tariq Hossain',
    fieldWeightKg: 14.8,
    confirmedWeightKg: 14.1,
    serviceFeeBdt: 0,
    materialPayoutBdt: 451,
    earnedPoints: 705,
    pointsStatus: 'available',
    discrepancyFlag: true,
    notes: 'Field weight 14.8 kg, hub scale measured 14.1 kg (-4.7% moisture loss / minor residual moisture). Accepted.',
    createdAt: '2026-10-02T11:00:00Z',
    updatedAt: '2026-10-04T10:15:00Z'
  }
];

export const INITIAL_JOBS: PickupJob[] = [
  {
    id: 'JOB-2026-101',
    bookingId: 'CL-BK-2026-101',
    collectorId: 'COL-TARIQ-01',
    collectorName: 'Tariq Hossain',
    customerAddress: 'House 14, Road 52, Gulshan-2, Dhaka',
    customerPhone: '+880 1712 345678',
    accessNotes: 'Building security buzz 3rd floor. Blue clean-lane sack near elevator.',
    scheduledWindow: '09:00 AM - 11:30 AM (Today)',
    expectedMaterials: ['PET_BOTTLES', 'CARDBOARD_OCC'],
    status: 'ACCEPTED'
  },
  {
    id: 'JOB-2026-104',
    bookingId: 'CL-BK-2026-104',
    collectorId: 'COL-TARIQ-01',
    collectorName: 'Tariq Hossain',
    customerAddress: 'Road 60, Gulshan-2, Dhaka (Artisan Roastery & Café)',
    customerPhone: '+880 1911 223344',
    accessNotes: 'Rear loading dock. Store lead Farhan.',
    scheduledWindow: '02:00 PM - 04:00 PM (Today)',
    expectedMaterials: ['CARDBOARD_OCC', 'HDPE_RIGID', 'ALUMINUM_CANS'],
    status: 'PENDING'
  },
  {
    id: 'JOB-2026-095',
    bookingId: 'CL-BK-2026-095',
    collectorId: 'COL-TARIQ-01',
    collectorName: 'Tariq Hossain',
    customerAddress: 'House 22, Road 48, Gulshan-2, Dhaka',
    customerPhone: '+880 1678 112233',
    accessNotes: 'Gate passcode provided in app.',
    scheduledWindow: '11:00 AM - 01:00 PM (Oct 03)',
    expectedMaterials: ['PET_BOTTLES'],
    status: 'COMPLETED',
    fieldReport: {
      completedAt: '2026-10-03T12:20:00Z',
      materialWeights: [{ category: 'PET_BOTTLES', weightKg: 14.8, bagCount: 2 }],
      totalWeightKg: 14.8,
      weightMethod: 'field_scale',
      customerAckCode: 'ACK-8942',
      batchLotId: 'LOT-2026-095-PET',
      photoEvidenceRecorded: true,
      syncStatus: 'synced'
    }
  }
];

export const INITIAL_MATERIAL_LOTS: MaterialLot[] = [
  {
    id: 'LOT-2026-095-PET',
    sourceBookingId: 'CL-BK-2026-095',
    sourceJobId: 'JOB-2026-095',
    material: 'PET_BOTTLES',
    primaryCollector: 'Tariq Hossain',
    initialFieldWeightKg: 14.8,
    verifiedHubWeightKg: 14.1,
    currentCustodian: 'AGGREGATION_HUB',
    location: 'Gulshan Recovery Aggregation Hub #3',
    evidenceLevel: 'E2',
    discrepancyPercentage: -4.7,
    discrepancyResolved: true,
    childLotIds: ['LOT-SORT-095-A', 'LOT-SORT-095-RES'],
    createdAt: '2026-10-03T12:20:00Z',
    updatedAt: '2026-10-04T10:15:00Z'
  },
  {
    id: 'LOT-2026-098-PET',
    sourceBookingId: 'CL-BK-2026-098',
    sourceJobId: 'JOB-2026-098',
    material: 'PET_BOTTLES',
    primaryCollector: 'Tariq Hossain',
    initialFieldWeightKg: 8.4,
    verifiedHubWeightKg: 8.2,
    currentCustodian: 'PROCESSOR_FACILITY',
    location: 'Bengal Polymers & Flake Mill, Savar',
    evidenceLevel: 'E3',
    discrepancyPercentage: -2.3,
    discrepancyResolved: true,
    createdAt: '2026-09-28T11:45:00Z',
    updatedAt: '2026-09-29T16:20:00Z'
  },
  {
    id: 'LOT-2026-092-OCC',
    sourceBookingId: 'CL-BK-2026-092',
    sourceJobId: 'JOB-2026-092',
    material: 'CARDBOARD_OCC',
    primaryCollector: 'Tariq Hossain',
    initialFieldWeightKg: 46.5,
    verifiedHubWeightKg: 45.8,
    currentCustodian: 'FINISHED_RECOVERED',
    location: 'Meghna Paper & Pulp Recycling Line 2',
    evidenceLevel: 'E4',
    discrepancyPercentage: -1.5,
    discrepancyResolved: true,
    sortingLossResidueKg: 1.2,
    createdAt: '2026-09-22T10:15:00Z',
    updatedAt: '2026-09-25T11:45:00Z'
  }
];

export const INITIAL_CUSTODY_EVENTS: CustodyEvent[] = [
  {
    id: 'CUST-EV-95-1',
    lotId: 'LOT-2026-095-PET',
    timestamp: '2026-10-03T12:20:00Z',
    sender: 'Nasreen Akhter (Household)',
    receiver: 'Tariq Hossain (Authorized Collector)',
    location: 'House 22, Road 48, Gulshan-2',
    quantityKg: 14.8,
    measurementMethod: 'Certified Portable Hanging Scale (Model HS-50)',
    evidenceLevelResult: 'E1',
    verifiedBy: 'Tariq Hossain (Verified ID #TH-882)',
    signatureOrHash: 'sha256:7f3a9d20c19e48'
  },
  {
    id: 'CUST-EV-95-2',
    lotId: 'LOT-2026-095-PET',
    timestamp: '2026-10-04T09:30:00Z',
    sender: 'Tariq Hossain (Collector)',
    receiver: 'Rahmat Ali (Gulshan Hub #3 Weighmaster)',
    location: 'Gulshan Aggregation Hub #3 (Scale #GW-01)',
    quantityKg: 14.1,
    measurementMethod: 'Certified Platform Floor Scale (Calibration Valid 2026-12)',
    evidenceLevelResult: 'E2',
    verifiedBy: 'Rahmat Ali (Weighmaster)',
    signatureOrHash: 'sha256:4b91ac051d92e1'
  },
  {
    id: 'CUST-EV-98-3',
    lotId: 'LOT-2026-098-PET',
    timestamp: '2026-09-29T16:20:00Z',
    sender: 'Gulshan Aggregation Hub #3',
    receiver: 'Bengal Polymers & Flake Mill',
    location: 'Processing Facility Bay 4, Savar',
    quantityKg: 8.2,
    measurementMethod: 'Industrial Mill Scale & Dispatch Manifest #DM-881',
    evidenceLevelResult: 'E3',
    verifiedBy: 'M. Farooq (Receiving Quality Inspector)',
    signatureOrHash: 'sha256:a914de22cb9840'
  }
];

export const INITIAL_SORTING_TRANSFORMATIONS: SortingTransformation[] = [
  {
    id: 'SORT-TR-2026-095',
    inputLotId: 'LOT-2026-095-PET',
    timestamp: '2026-10-04T11:00:00Z',
    facility: 'Gulshan Hub #3 Manual & Air Sorting Line',
    operator: 'Rahmat Ali (Senior Sorter)',
    inputWeightKg: 14.1,
    outputs: [
      {
        materialGrade: 'Grade A Clear PET Flake Precursor (Food Grade Potential)',
        outputWeightKg: 12.4,
        childLotId: 'LOT-SORT-095-A',
        destinationProcessor: 'Bengal Polymers & Flake Mill'
      },
      {
        materialGrade: 'Colored / Light Opaque PET bottles',
        outputWeightKg: 1.2,
        childLotId: 'LOT-SORT-095-B',
        destinationProcessor: 'National Textile Fiber Recycling'
      }
    ],
    residueContaminationKg: 0.5,
    residueDisposition: 'Non-recyclable unwashed film & adhesive labels sent to authorized RDF facility. Documented in waste registry.'
  }
];

export const INITIAL_PROCESSING_DISPOSITIONS: ProcessingDisposition[] = [
  {
    id: 'PROC-DISP-2026-092',
    lotId: 'LOT-2026-092-OCC',
    processorName: 'Meghna Paper & Pulp Recycling Line 2',
    facilityLocation: 'Meghna Industrial Park, Narayanganj',
    intakeTimestamp: '2026-09-23T14:00:00Z',
    processType: 'PULPING_AND_CORRUGATING',
    outputYieldKg: 43.1,
    processLossKg: 2.7,
    dispositionCertificateId: 'CERT-DISP-MEGHNA-2026-4491',
    completedAt: '2026-09-25T11:45:00Z',
    evidenceLevel: 'E4'
  }
];

export const INITIAL_POINTS_LEDGER: PointsLedgerEntry[] = [
  {
    id: 'PTS-2026-001',
    customerId: 'CUST-H-801',
    timestamp: '2026-09-20T10:00:00Z',
    ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
    sourceEvent: 'ONBOARDING_SEGREGATION_PLEDGE',
    description: 'Welcome verification & Clean Lane segregation guidelines acknowledged',
    type: 'CREDIT',
    amount: 100,
    status: 'AVAILABLE'
  },
  {
    id: 'PTS-2026-002',
    customerId: 'CUST-H-801',
    timestamp: '2026-09-29T16:20:00Z',
    ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
    sourceEvent: 'SERVICE_COMPLETED_SCALE_VERIFIED',
    description: 'Booking CL-BK-2026-098: 8.2 kg verified recovery (PET & HDPE)',
    type: 'CREDIT',
    amount: 370,
    status: 'AVAILABLE',
    linkedBookingId: 'CL-BK-2026-098'
  },
  {
    id: 'PTS-2026-003',
    customerId: 'CUST-H-801',
    timestamp: '2026-10-05T14:30:00Z',
    ruleVersion: 'RULES_V1.2_GULSHAN_CLEANLANE',
    sourceEvent: 'BOOKING_SCHEDULED_AWAITING_VERIFICATION',
    description: 'Booking CL-BK-2026-101 estimated points (Held until E2 receiving scale verification)',
    type: 'PENDING_HOLD',
    amount: 175,
    status: 'PENDING',
    linkedBookingId: 'CL-BK-2026-101'
  }
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'REW-CHALDAL-250',
    partnerName: 'Chaldal Groceries',
    title: '৳250 Eco-Household Grocery Voucher',
    titleBn: '৳২৫০ পরিবেশবান্ধব গ্রোসারি ভাউচার',
    category: 'groceries',
    pointsCost: 400,
    cashEquivalentBdt: 250,
    description: 'Valid for fresh produce and household staples on Chaldal online grocery delivery in Dhaka.',
    validityDays: 60,
    stockAvailable: 45,
    funder: 'Clean Lane Operator Circular Fund'
  },
  {
    id: 'REW-AARONG-500',
    partnerName: 'Aarong Earth',
    title: '৳500 Sustainable Artisan Goods Coupon',
    titleBn: '৳৫০০ টেকসই হস্তশিল্প কুপন',
    category: 'artisan',
    pointsCost: 750,
    cashEquivalentBdt: 500,
    description: 'Redeemable for handloom and natural botanical bodycare products across Aarong outlets.',
    validityDays: 90,
    stockAvailable: 22,
    funder: 'Aarong Community Partner Program'
  },
  {
    id: 'REW-GP-100',
    partnerName: 'Mobile Recharge (Any Telco)',
    title: '৳100 Direct Mobile Airtime / Data',
    titleBn: '৳১০০ মোবাইল রিচার্জ বা ইন্টারনেট',
    category: 'utility',
    pointsCost: 180,
    cashEquivalentBdt: 100,
    description: 'Instant mobile credit top-up to any Grameenphone, Robi, Banglalink or Teletalk number.',
    validityDays: 30,
    stockAvailable: 150,
    funder: 'Clean Lane Pilot Budget'
  },
  {
    id: 'REW-SOLAR-DONATE',
    partnerName: 'Charity: BRAC Climate Fund',
    title: 'Sponsor 1 Solar Study Lamp for Flood-Prone School',
    titleBn: 'একটি প্রত্যন্ত স্কুলের জন্য সোলার স্টাডি ল্যাম্প অনুদান',
    category: 'donation',
    pointsCost: 600,
    cashEquivalentBdt: 450,
    description: 'Directly fund a certified solar study lamp for a primary student in Sunamganj haor region.',
    validityDays: 365,
    stockAvailable: 100,
    funder: 'Unilever Bangladesh CSR Match'
  }
];

export const INITIAL_REDEMPTIONS: CustomerRedemption[] = [
  {
    id: 'RED-2026-01',
    customerId: 'CUST-H-801',
    rewardId: 'REW-GP-100',
    rewardTitle: '৳100 Direct Mobile Airtime',
    pointsDeducted: 180,
    couponCode: 'TOPUP-GP-9821-X4',
    status: 'COMPLETED',
    timestamp: '2026-09-30T14:10:00Z'
  }
];

export const INITIAL_COMPLAINTS: ServiceComplaint[] = [
  {
    id: 'CMP-2026-012',
    customerId: 'CUST-H-709',
    customerName: 'Sultan Mahmud',
    type: 'WEIGHT_DISCREPANCY',
    bookingId: 'CL-BK-2026-095',
    description: 'Customer noted hanging scale read 14.8 kg but scale hub showed 14.1 kg. Requesting clarification on moisture loss policy.',
    status: 'RESOLVED',
    resolutionNotes: 'Operator verified calibrated platform scale record and shared moisture dissipation receipt. Customer agreed to 14.1 kg accepted weight with 50 bonus retention points credited.',
    createdAt: '2026-10-04T12:00:00Z',
    resolvedAt: '2026-10-04T17:30:00Z'
  }
];

export const INITIAL_BRAND_CAMPAIGNS: BrandCampaign[] = [
  {
    id: 'CAMP-UNILEVER-01',
    sponsorName: 'Unilever Bangladesh',
    title: 'Gulshan & Banani Circular Bottle Take-Back Pilot',
    targetMaterial: 'PET_BOTTLES',
    eligibleZones: ['ZONE-GUL-02', 'ZONE-BAN-11'],
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    targetRecoveryKg: 5000,
    allocatedVerifiedKg: 1840,
    bonusPointsPerKg: 30,
    regulatoryFramework: 'Bangladesh Solid Waste Management Rules 2021 (Schedule 4 EPR Principles)',
    status: 'ACTIVE'
  },
  {
    id: 'CAMP-APEX-02',
    sponsorName: 'Apex Footwear & Packaging',
    title: 'Clean Cardboard OCC Closed-Loop Reclamation',
    targetMaterial: 'CARDBOARD_OCC',
    eligibleZones: ['ZONE-GUL-02', 'ZONE-BAN-11', 'ZONE-DHA-9A'],
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    targetRecoveryKg: 8000,
    allocatedVerifiedKg: 3110,
    bonusPointsPerKg: 15,
    regulatoryFramework: 'Industrial Packaging Recycling Standard & DOE Circular Roadmap',
    status: 'ACTIVE'
  }
];

export const INITIAL_EVIDENCE_PACKAGES: EvidencePackage[] = [
  {
    id: 'EVP-2026-UB-001',
    campaignId: 'CAMP-UNILEVER-01',
    sponsorName: 'Unilever Bangladesh',
    title: 'Q3 Verified Post-Consumer PET Clean Lane Package #1',
    claimType: 'RECOVERED_POST_CONSUMER_PET',
    period: 'September 2026 (Monthly Audit)',
    evidencedWeightKg: 1250,
    includedLotCount: 78,
    includedTransactionCount: 94,
    evidenceLevelsCovered: ['E1', 'E2', 'E3', 'E4'],
    exclusionsDisclosed: 'Excludes 42.5 kg rejected multilayer pouches and non-PET beverage caps; sorting loss disclosed in report section 4.',
    discrepanciesAudited: 3,
    reviewerName: 'Dr. Shahriar Rahman (Independent Circular Auditor, BUET Envir. Lab)',
    approvedDate: '2026-10-02',
    regulatoryCitation: 'Department of Environment, Solid Waste Management Rules 2021 (EPR Clause 14)'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'AUD-2026-001',
    timestamp: '2026-10-04T10:15:00Z',
    actor: 'Rahmat Ali',
    actorRole: 'aggregator',
    action: 'DISCREPANCY_RESOLVED',
    targetObject: 'MaterialLot',
    targetId: 'LOT-2026-095-PET',
    priorValue: 'discrepancyResolved: false (Delta: -4.7%)',
    newValue: 'discrepancyResolved: true',
    reason: 'Verified calibration log GW-01; delta within allowable 5% moisture loss tolerance for uncrushed bottles.'
  },
  {
    id: 'AUD-2026-002',
    timestamp: '2026-10-04T11:00:00Z',
    actor: 'Rahmat Ali',
    actorRole: 'aggregator',
    action: 'SORTING_TRANSFORMATION_COMMITTED',
    targetObject: 'SortingTransformation',
    targetId: 'SORT-TR-2026-095',
    priorValue: 'inputWeight: 14.1 kg',
    newValue: 'gradeA: 12.4 kg, colored: 1.2 kg, residue: 0.5 kg',
    reason: 'Sorted and baled for dispatch to licensed recycling partners.'
  },
  {
    id: 'AUD-2026-003',
    timestamp: '2026-10-02T16:00:00Z',
    actor: 'Clean Lane Operator Admin',
    actorRole: 'operator',
    action: 'EVIDENCE_PACKAGE_SEALED',
    targetObject: 'EvidencePackage',
    targetId: 'EVP-2026-UB-001',
    priorValue: 'DRAFT',
    newValue: 'APPROVED_AND_LOCKED',
    reason: 'Signed off by verified independent environmental auditor for Unilever EPR report.'
  }
];

export const INITIAL_DROP_OFF_POINTS: DropOffPoint[] = [
  {
    id: 'DP-GUL-01',
    name: 'Gulshan Hub #3 Circular Drop-Off Station',
    nameBn: 'গুলশান হাব ৩ সার্কুলার ড্রপ-অফ পয়েন্ট',
    address: 'Plot 18, Road 54, Gulshan-2, Dhaka (Near Lake Park)',
    zoneId: 'ZONE-GUL-02',
    operatingHours: 'Sun–Thu: 08:00 AM – 06:00 PM, Fri: 08:00 AM – 12:00 PM',
    acceptedMaterials: ['PET_BOTTLES', 'HDPE_RIGID', 'CARDBOARD_OCC', 'ALUMINUM_CANS'],
    operatorName: 'Rahmat Ali (Gulshan Enterprise)',
    receiptConfirmationMethod: 'Digital platform scale ticket with QR transaction slip',
    accessibilityNotes: 'Ground floor drive-through lane with helper assistance for bulky cartons',
    isCleanLaneApproved: true
  },
  {
    id: 'DP-BAN-02',
    name: 'Banani Road 11 Community Recovery Kiosk',
    nameBn: 'বনানী ১১ কমিউনিটি রিকভারি কিয়স্ক',
    address: 'House 55, Road 11, Block D, Banani, Dhaka',
    zoneId: 'ZONE-BAN-11',
    operatingHours: 'Daily: 09:00 AM – 08:00 PM',
    acceptedMaterials: ['PET_BOTTLES', 'ALUMINUM_CANS', 'TETRAPAK_BEVERAGE'],
    operatorName: 'Shamsul Alam (Banani Collective)',
    receiptConfirmationMethod: 'Smart deposit receptacle with instant customer phone confirmation',
    accessibilityNotes: 'Pedestrian sidewalk access, wheelchair ramp available',
    isCleanLaneApproved: true
  },
  {
    id: 'DP-DHA-03',
    name: 'Dhanmondi 9A Institutional Drop Station',
    nameBn: 'ধানমন্ডি ৯এ প্রাতিষ্ঠানিক ড্রপ স্টেশন',
    address: 'Dhanmondi 9A Society Complex, Dhaka',
    zoneId: 'ZONE-DHA-9A',
    operatingHours: 'Sat–Thu: 09:00 AM – 05:00 PM',
    acceptedMaterials: ['CARDBOARD_OCC', 'PET_BOTTLES', 'HDPE_RIGID'],
    operatorName: 'Dhanmondi Circular Services',
    receiptConfirmationMethod: 'Certified hanging scale with physical receipt slip',
    accessibilityNotes: 'Adjacent to main community gate',
    isCleanLaneApproved: true
  }
];

export const INITIAL_SAVED_LOCATIONS: SavedLocation[] = [
  {
    id: 'LOC-01',
    label: 'Home (Gulshan Apartment)',
    address: 'House 14, Road 52, Gulshan-2, Dhaka',
    zoneId: 'ZONE-GUL-02',
    isDefault: true,
    accessInstructions: 'Building security will buzz 3rd floor. Leave blue clean-lane sack near elevator.',
    status: 'available'
  },
  {
    id: 'LOC-02',
    label: 'Family Home (Dhanmondi)',
    address: 'House 34, Road 9A, Dhanmondi, Dhaka',
    zoneId: 'ZONE-DHA-9A',
    isDefault: false,
    accessInstructions: 'Gate 2 security booth.',
    status: 'available'
  },
  {
    id: 'LOC-03',
    label: 'Studio / Office (Uttara)',
    address: 'Sector 4, Road 12, Uttara, Dhaka',
    zoneId: 'ZONE-EXP-UTT',
    isDefault: false,
    accessInstructions: 'Expansion zone - pre-registered.',
    status: 'unavailable'
  }
];

export const INITIAL_ORG_MEMBERS: OrgMember[] = [
  {
    id: 'MEM-01',
    name: 'Mr. Kabir Hossain',
    emailOrPhone: '+880 1819 987654',
    role: 'building_supervisor' as const,
    assignedSite: 'Green View Heights (Banani Plot 32)'
  },
  {
    id: 'MEM-02',
    name: 'Nasreen Akhter',
    emailOrPhone: '+880 1712 345678',
    role: 'owner' as const,
    assignedSite: 'Green View Heights Committee'
  },
  {
    id: 'MEM-03',
    name: 'Farhan Zahedi',
    emailOrPhone: '+880 1911 223344',
    role: 'site_manager' as const,
    assignedSite: 'Artisan Roastery & Café (Gulshan Road 60)'
  }
];
