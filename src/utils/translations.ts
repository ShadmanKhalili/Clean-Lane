/**
 * Comprehensive Bilingual Translation Dictionary (English & authentic Bengali)
 * Clean Lane Platform
 */

export interface TranslationDictionary {
  // Navigation & Common
  appTitle: string;
  appSubtitle: string;
  home: string;
  rewards: string;
  myActivity: string;
  services: string;
  account: string;
  help: string;
  bookPickup: string;
  bookAnotherPickup: string;
  trackLiveStatus: string;
  viewDetails: string;
  seeDetails: string;
  sortingGuide: string;
  close: string;
  cancel: string;
  confirm: string;
  back: string;
  next: string;
  submit: string;
  save: string;
  available: string;
  pending: string;
  points: string;
  kilograms: string;
  kg: string;
  bdt: string;
  taka: string;
  helpAndSupport: string;
  activeLane: string;
  waitlist: string;

  // Simple Customer Experience Core Tasks
  arrangeACollection: string;
  checkACollection: string;
  useRewards: string;
  yourNextPickup: string;
  viewPickup: string;
  findADropOffPoint: string;
  seeRewards: string;
  arrangeRegularCollection: string;
  regularCollectionSub: string;
  seeExamples: string;
  notSure: string;
  addDetails: string;
  addANote: string;
  reviewPickup: string;
  stillBeingChecked: string;
  howPointsWork: string;
  eligibleRewards: string;
  campaigns: string;
  reportsAndInvoices: string;
  serviceFee: string;
  freeDoorstepCollection: string;
  provisionalPaymentBasis: string;
  rewardCondition: string;
  conditionSummary: string;
  nextAction: string;
  weAreCheckingQuantity: string;
  materialsPickedUp: string;
  pickupMissedIssue: string;
  pickupMissedDesc: string;
  disputesAndReports: string;
  organisationManagement: string;
  yourLocation: string;

  // New Menu & Navigation items
  moreMenu: string;
  investorBrief: string;
  fiveStepTour: string;
  evidenceModel: string;
  chainOfCustody: string;
  myServices: string;
  fieldJobs: string;
  hubIntake: string;
  millProcessing: string;
  commandCenter: string;
  eprCampaigns: string;
  desktopView: string;
  phonePreview: string;
  listenAudio: string;
  audioSpeaking: string;
  notifications: string;

  // Home Hero & Banners
  nextScheduledPickup: string;
  assignedTimeWindow: string;
  whatWouldYouLikeCollected: string;
  whatWouldYouLikeCollectedSub: string;
  prepReminderActive: string;
  prepReminderDesc: string;
  viewChecklist: string;
  rewardsBalance: string;
  availableToRedeem: string;
  pendingHubCheck: string;
  totalDiverted: string;
  redeemVouchers: string;
  serviceAddress: string;
  changeAddress: string;
  automatedAlerts: string;
  viewAll: string;
  approvedStreams: string;
  solidWasteRules: string;
  acceptedCleanStreams: string;
  segregatedRecyclables: string;
  fullSortingGuide: string;
  showFull6Streams: string;
  hideFull6Streams: string;

  // Booking Flow
  step1Title: string;
  step1Heading: string;
  step2Title: string;
  step2Heading: string;
  step3Title: string;
  step3Heading: string;
  step4Title: string;
  step4Heading: string;
  selectMaterialsPrompt: string;
  pickupTimePrompt: string;
  chooseDay: string;
  today: string;
  tomorrow: string;
  dayAfterTomorrow: string;
  morningSlot: string;
  afternoonSlot: string;
  addressLabel: string;
  accessInstructionsOptional: string;
  accessPlaceholder: string;
  appointmentTicket: string;
  ticketInstruction: string;
  noUpfrontPayment: string;
  verifiedPointsEarned: string;

  // Materials
  plasticBottlesTitle: string;
  plasticBottlesSub: string;
  cardboardTitle: string;
  cardboardSub: string;
  cansTitle: string;
  cansSub: string;
  hdpeTitle: string;
  hdpeSub: string;
  polyFilmTitle: string;
  polyFilmSub: string;
  tetrapakTitle: string;
  tetrapakSub: string;

  // 24h Notification & Preparation
  notifCenterTitle: string;
  prepGuidanceTitle: string;
  prepStep1Title: string;
  prepStep1Desc: string;
  prepStep2Title: string;
  prepStep2Desc: string;
  prepStep3Title: string;
  prepStep3Desc: string;
  prepStep4Title: string;
  prepStep4Desc: string;
  qualityGuidelines: string;
  acceptedItems: string;
  rejectedItems: string;
  doorstepProtocol: string;
  doorstepProtocolDesc: string;

  // Rewards & Redemptions
  rewardCatalogTitle: string;
  rewardCatalogSub: string;
  pointsLedgerTitle: string;
  pointsLedgerSub: string;
  redeemButton: string;
  morePointsNeeded: string;
  funderLabel: string;

  // Activity & History
  collectionHistoryTitle: string;
  collectionHistorySub: string;
  filterAll: string;
  filterUpcoming: string;
  filterCompleted: string;
  filterAttention: string;
  seeReceipt: string;
  scaleWeight: string;
  evidencePackage: string;

  // Dispute & Assistance
  disputeCenterTitle: string;
  disputeCenterSub: string;
  selectIssueType: string;
  issueMissed: string;
  issueWeight: string;
  issuePoints: string;
  issueCollector: string;
  describeIssue: string;
  submitDispute: string;
  disputeReceived: string;

  // Environmental Impact & ESG
  verifiedCircularityImpact: string;
  divertedFromLandfill: string;
  co2Avoided: string;
  viewImpactLedger: string;
  hideImpactLedger: string;
  householdScope: string;
  pilotZoneScope: string;
  treesEquivalent: string;
  plasticBottlesDiverted: string;
  landfillSpaceSaved: string;

  // Collector & QR Scanning
  scanQrCode: string;
  scanQrInstruction: string;
  switchCamera: string;
  toggleFlash: string;
  recordWeight: string;
  verifiedScaleWeight: string;
  manualLotEntry: string;
  lotIdentified: string;

  // Quick Actions & Receipts
  viewPreparationChecklist: string;
  trackLiveCollection: string;
  viewScaleCertificate: string;
  recentCollection: string;
  doorstepSupport: string;
  pickupQuestions: string;
  getHelp: string;
  selectAddress: string;
  addNewAddress: string;
}

export const TRANSLATIONS: Record<'en' | 'bn', TranslationDictionary> = {
  en: {
    appTitle: 'Clean Lane',
    appSubtitle: 'Everyday Household Circularity & Doorstep Recovery',
    home: 'Home',
    rewards: 'Rewards',
    myActivity: 'My activity',
    services: 'Drop-Off & Services',
    account: 'Account',
    help: 'Help',
    bookPickup: 'BOOK A PICKUP',
    bookAnotherPickup: 'Book another pickup',
    trackLiveStatus: 'Track Live Status',
    viewDetails: 'View Details',
    seeDetails: 'See details',
    sortingGuide: 'Sorting Guide →',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm Pickup',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    save: 'Save Changes',
    available: 'Available',
    pending: 'Pending Hub Check',
    points: 'Points',
    kilograms: 'Kilograms',
    kg: 'kg',
    bdt: 'BDT',
    taka: '৳',
    helpAndSupport: 'Help & Support',
    activeLane: 'Active Lane',
    waitlist: 'Waitlist',

    // Simple Customer Tasks
    arrangeACollection: 'Arrange a collection',
    checkACollection: 'Check a collection',
    useRewards: 'Use rewards',
    yourNextPickup: 'Your next pickup',
    viewPickup: 'VIEW PICKUP',
    findADropOffPoint: 'Find a drop-off point',
    seeRewards: 'See rewards',
    arrangeRegularCollection: 'Arrange regular collection',
    regularCollectionSub: 'Scheduled recurring pickups for residential buildings or businesses',
    seeExamples: 'See examples',
    notSure: 'Not sure',
    addDetails: 'Add details',
    addANote: 'Add a note',
    reviewPickup: 'Review pickup',
    stillBeingChecked: 'Still being checked',
    howPointsWork: 'How points work',
    eligibleRewards: 'Eligible rewards',
    campaigns: 'Campaigns',
    reportsAndInvoices: 'Reports & Invoices',
    serviceFee: 'Applicable service fee',
    freeDoorstepCollection: 'Free doorstep collection (৳0)',
    provisionalPaymentBasis: 'Provisional reward rate',
    rewardCondition: 'Reward condition',
    conditionSummary: 'Points are credited based on certified digital scale weight of clean, dry materials.',
    nextAction: 'Next',
    weAreCheckingQuantity: 'We are checking the quantity at the receiving hub.',
    materialsPickedUp: 'Your materials were picked up.',
    pickupMissedIssue: 'Your pickup was missed.',
    pickupMissedDesc: 'Collector was unable to complete the pickup during the scheduled window.',
    disputesAndReports: 'Disputes & Reports',
    organisationManagement: 'Organisation & Sites',
    yourLocation: 'Your location',

    moreMenu: 'More Options',
    investorBrief: 'Investor Brief',
    fiveStepTour: '5-Step Tour',
    evidenceModel: 'Evidence Standard (E0–E5)',
    chainOfCustody: 'Chain of Custody',
    myServices: 'My Services',
    fieldJobs: 'Field Jobs',
    hubIntake: 'Hub Intake',
    millProcessing: 'Mill Processing',
    commandCenter: 'Command Center',
    eprCampaigns: 'EPR & Campaigns',
    desktopView: 'Desktop View',
    phonePreview: 'Phone Preview',
    listenAudio: 'Listen to Spoken Summary',
    audioSpeaking: 'Speaking (Tap to stop)',
    notifications: 'Notifications & Reminders',

    nextScheduledPickup: 'Next Scheduled Pickup',
    assignedTimeWindow: 'Assigned Time Window',
    whatWouldYouLikeCollected: 'What would you like collected?',
    whatWouldYouLikeCollectedSub: 'Select clean recyclables, choose a convenient window, and earn verified circular points right at your doorstep.',
    prepReminderActive: '24h Preparation Guide Active',
    prepReminderDesc: 'Rinse bottles clean, flatten cardboard boxes, and place bags near your door 15 minutes before the window.',
    viewChecklist: 'View Checklist',
    rewardsBalance: 'Available points',
    availableToRedeem: 'Available to spend',
    pendingHubCheck: 'Pending hub scale check',
    totalDiverted: 'Total Material Diverted',
    redeemVouchers: 'Redeem Points for Vouchers',
    serviceAddress: 'Service Address',
    changeAddress: 'Change',
    automatedAlerts: 'Automated 24h Reminders',
    viewAll: 'View All',
    approvedStreams: 'Accepted Clean Streams',
    solidWasteRules: 'Segregated in compliance with Bangladesh Solid Waste Rules 2021',
    acceptedCleanStreams: 'Accepted Clean Streams',
    segregatedRecyclables: 'Segregated household recyclables eligible for verified points',
    fullSortingGuide: 'Full Sorting Guide →',
    showFull6Streams: 'Show full 6-category specifications ▾',
    hideFull6Streams: 'Hide full 6-category specifications ▴',

    step1Title: 'Step 1 of 3: What do you have?',
    step1Heading: 'What do you have?',
    step2Title: 'Step 2 of 3: When should we come?',
    step2Heading: 'When should we come?',
    step3Title: 'Step 3 of 3: Check and confirm',
    step3Heading: 'Check and confirm',
    step4Title: 'Booking Confirmed',
    step4Heading: 'Your Pickup is Confirmed ✓',
    selectMaterialsPrompt: 'Select all clean, dry materials you have prepared.',
    pickupTimePrompt: 'Choose your preferred collection day and arrival window.',
    chooseDay: 'Choose Day',
    today: 'Today',
    tomorrow: 'Tomorrow',
    dayAfterTomorrow: 'Day After Tomorrow',
    morningSlot: 'Morning (09:00 AM – 11:30 AM)',
    afternoonSlot: 'Afternoon (02:00 PM – 04:30 PM)',
    addressLabel: 'Pickup Address',
    accessInstructionsOptional: 'Gate or Building Instructions (Optional)',
    accessPlaceholder: 'e.g. Ring flat 4B bell. Blue recycling bag placed next to doorway.',
    appointmentTicket: 'Digital Appointment Ticket',
    ticketInstruction: 'Present this booking ticket to your collector during certified scale weigh-in.',
    noUpfrontPayment: 'Zero fee required. Verified reward points are credited upon scale confirmation.',
    verifiedPointsEarned: 'Estimated Circular Points',

    plasticBottlesTitle: 'Plastic bottles',
    plasticBottlesSub: 'Clean water, juice and soft drink bottles',
    cardboardTitle: 'Paper & cardboard',
    cardboardSub: 'Delivery boxes, packaging cartons and paper boards',
    cansTitle: 'Cans & metal',
    cansSub: 'Beverage cans, tin food containers, metal items',
    hdpeTitle: 'Rigid plastic containers',
    hdpeSub: 'Shampoo, laundry detergent bottles and milk jugs',
    polyFilmTitle: 'Clean plastic film & bags',
    polyFilmSub: 'Clean grocery bags, bubble wrap and clear packaging',
    tetrapakTitle: 'Beverage cartons',
    tetrapakSub: 'Aseptic juice and milk multilayer cartons',

    notifCenterTitle: 'Notifications & Settings',
    prepGuidanceTitle: 'Material Preparation Checklist',
    prepStep1Title: '1. Rinse and Air Dry',
    prepStep1Desc: 'Empty residual liquids, rinse with water, and let dry thoroughly to prevent mold or odor.',
    prepStep2Title: '2. Flatten & Compact',
    prepStep2Desc: 'Flatten cardboard delivery boxes and crush plastic bottles to optimize collector volume.',
    prepStep3Title: '3. Keep Streams Segregated',
    prepStep3Desc: 'Keep plastics, cardboard, and metals in separate bags for rapid certified scale check.',
    prepStep4Title: '4. Stage at Doorstep',
    prepStep4Desc: 'Place your bagged materials by your door 15 minutes before the arrival window.',
    qualityGuidelines: 'Clean Lane Quality Standards',
    acceptedItems: 'Accepted for Points',
    rejectedItems: 'Excluded Items',
    doorstepProtocol: 'Collector Handover Protocol',
    doorstepProtocolDesc: 'Certified collectors weigh materials on digital hanging scales in your presence and log cryptographic receipts.',

    rewardCatalogTitle: 'Eligible Rewards',
    rewardCatalogSub: 'Spend your verified points on grocery vouchers, mobile recharges, and bill credits.',
    pointsLedgerTitle: 'Points Ledger & Audit History',
    pointsLedgerSub: 'Immutable transaction logs verified against certified digital scale weights.',
    redeemButton: 'Redeem Voucher',
    morePointsNeeded: 'more points needed',
    funderLabel: 'EPR Funder',

    collectionHistoryTitle: 'Collection History',
    collectionHistorySub: 'Certified scale weights, custody chain and evidence for every collection.',
    filterAll: 'All',
    filterUpcoming: 'Upcoming',
    filterCompleted: 'Completed',
    filterAttention: 'Attention',
    seeReceipt: 'See details →',
    scaleWeight: 'Certified Scale Weight',
    evidencePackage: 'Evidence Level',

    disputeCenterTitle: 'Help & Dispute Center',
    disputeCenterSub: 'Submit an inquiry or report an issue with a collection.',
    selectIssueType: 'Select Issue Category',
    issueMissed: 'Collector did not arrive in window',
    issueWeight: 'Scale weight discrepancy',
    issuePoints: 'Reward points delayed or incorrect',
    issueCollector: 'Collector interaction or behavior',
    describeIssue: 'Describe what happened',
    submitDispute: 'Submit Ticket to Dispatch',
    disputeReceived: 'Your request has been logged. Dispatch operator will contact you shortly.',

    verifiedCircularityImpact: 'Verified Circularity Impact',
    divertedFromLandfill: 'diverted from Matuail landfill',
    co2Avoided: 'CO₂e avoided',
    viewImpactLedger: 'View ESG Impact Details',
    hideImpactLedger: 'Hide Impact Details',
    householdScope: 'My Household',
    pilotZoneScope: 'Dhanmondi Ward (Zone 5)',
    treesEquivalent: 'Trees planted equivalent',
    plasticBottlesDiverted: 'Plastic bottles diverted',
    landfillSpaceSaved: 'Landfill space saved',

    scanQrCode: 'Scan Lot QR Code',
    scanQrInstruction: 'Align the camera over the bag or lot QR code to identify instantly',
    switchCamera: 'Switch Camera',
    toggleFlash: 'Flashlight',
    recordWeight: 'Record Weight',
    verifiedScaleWeight: 'Certified Scale Weight',
    manualLotEntry: 'Or enter lot code manually',
    lotIdentified: 'Lot Identified Successfully',

    viewPreparationChecklist: 'Preparation Checklist',
    trackLiveCollection: 'Track Live Status',
    viewScaleCertificate: 'View Scale Certificate',
    recentCollection: 'Recent Collection',
    doorstepSupport: 'Doorstep Support',
    pickupQuestions: 'Questions about your collection?',
    getHelp: 'Get help',
    selectAddress: 'Select Service Address',
    addNewAddress: 'Add New Address'
  },
  bn: {
    appTitle: 'ক্লিন লেন',
    appSubtitle: 'দৈনন্দিন গৃহস্থালি বর্জ্য ব্যবস্থাপনা ও ডোরস্টেপ রিসাইক্লিং',
    home: 'হোম',
    rewards: 'রিওয়ার্ডস',
    myActivity: 'আমার কার্যক্রম',
    services: 'ড্রপ-অফ ও সেবা',
    account: 'অ্যাকাউন্ট',
    help: 'সহায়তা',
    bookPickup: 'পিকআপ বুক করুন',
    bookAnotherPickup: 'নতুন পিকআপ বুক করুন',
    trackLiveStatus: 'লাইভ অগ্রগতি দেখুন',
    viewDetails: 'বিস্তারিত দেখুন',
    seeDetails: 'বিস্তারিত দেখুন',
    sortingGuide: 'বাছাই নির্দেশিকা →',
    close: 'বন্ধ করুন',
    cancel: 'বাতিল',
    confirm: 'পিকআপ নিশ্চিত করুন',
    back: 'পেছনে',
    next: 'পরবর্তী',
    submit: 'জমা দিন',
    save: 'সংরক্ষণ করুন',
    available: 'উপলব্ধ',
    pending: 'হাবে যাচাইাধীন',
    points: 'পয়েন্ট',
    kilograms: 'কেজি',
    kg: 'কেজি',
    bdt: 'টাকা',
    taka: '৳',
    helpAndSupport: 'সহায়তা ও অভিযোগ',
    activeLane: 'ক্লিন লেন সক্রিয়',
    waitlist: 'অপেক্ষমাণ লেন',

    // Simple Customer Tasks
    arrangeACollection: 'বর্জ্য সংগ্রহ বুক করুন',
    checkACollection: 'সংগ্রহের স্থিতি দেখুন',
    useRewards: 'রিওয়ার্ড ব্যবহার করুন',
    yourNextPickup: 'আপনার পরবর্তী সংগ্রহ',
    viewPickup: 'সংগ্রহ দেখুন',
    findADropOffPoint: 'ড্রপ-অফ কেন্দ্র খুঁজুন',
    seeRewards: 'রিওয়ার্ডস দেখুন',
    arrangeRegularCollection: 'নিয়মিত সংগ্রহের ব্যবস্থা করুন',
    regularCollectionSub: 'আবাসিক ভবন বা ব্যবসার জন্য সাপ্তাহিক বা পাক্ষিক নির্ধারিত সংগ্রহ',
    seeExamples: 'উদাহরণ দেখুন',
    notSure: 'নিশ্চিত নই',
    addDetails: 'বিস্তারিত তথ্য যোগ করুন',
    addANote: 'নোট বা নির্দেশনা যোগ করুন',
    reviewPickup: 'পিকআপ পর্যালোচনা করুন',
    stillBeingChecked: 'হাবে ওজন যাচাইাধীন',
    howPointsWork: 'পয়েন্ট যেভাবে কাজ করে',
    eligibleRewards: 'আপনার উপযুক্ত রিওয়ার্ড',
    campaigns: 'ক্যাম্পেইন',
    reportsAndInvoices: 'রিপোর্ট ও ইনভয়েস',
    serviceFee: 'প্রযোজ্য সার্ভিস চার্জ',
    freeDoorstepCollection: 'বিনামূল্যে ডোরস্টেপ সংগ্রহ (৳০)',
    provisionalPaymentBasis: 'সম্ভাব্য পয়েন্ট হার',
    rewardCondition: 'রিওয়ার্ড শর্তাবলী',
    conditionSummary: 'শুকনো, পরিষ্কার ও পৃথক করা বর্জ্যের জন্য ডিজিটাল স্কেলে ওজন যাচাই শেষে পয়েন্ট যুক্ত হবে।',
    nextAction: 'পরবর্তী পদক্ষেপ',
    weAreCheckingQuantity: 'একত্রীকরণ কেন্দ্রে ডিজিটাল স্কেলে ওজন যাচাই করা হচ্ছে।',
    materialsPickedUp: 'আপনার বর্জ্য সংগ্রহ করা হয়েছে।',
    pickupMissedIssue: 'আপনার বর্জ্য সংগ্রহ সম্পন্ন করা যায়নি।',
    pickupMissedDesc: 'নির্ধারিত সময়ে কালেক্টর সংগ্রহ সম্পন্ন করতে পারেননি। সহায়তা পেতে ক্লিক করুন।',
    disputesAndReports: 'অভিযোগ ও অডিট রিপোর্ট',
    organisationManagement: 'প্রতিষ্ঠান ও সাইট ব্যবস্থাপনা',
    yourLocation: 'আপনার ঠিকানা',

    moreMenu: 'আরও বিকল্প ▾',
    investorBrief: 'ইনভেস্টর বিবরণ ও অর্থনীতি',
    fiveStepTour: '৫-ধাপের সার্কুলার সফর',
    evidenceModel: 'ডিজিটাল প্রমাণ মানদণ্ড (E0–E5)',
    chainOfCustody: 'কাস্টডি রেকর্ড ও চেইন',
    myServices: 'আমার সেবা',
    fieldJobs: 'মাঠের কাজ',
    hubIntake: 'কেন্দ্র ইনটেক',
    millProcessing: 'মিল প্রসেসিং',
    commandCenter: 'কমান্ড সেন্টার',
    eprCampaigns: 'ইপিআর ও পার্টনার',
    desktopView: 'ডেস্কটপ ভিউ',
    phonePreview: 'মোবাইল ফ্রেম প্রিভিউ',
    listenAudio: 'অডিও সারাংশ শুনুন',
    audioSpeaking: 'অডিও চলছে (থামাতে চাপুন)',
    notifications: 'বিজ্ঞপ্তি ও সেটিংস',

    nextScheduledPickup: 'পরবর্তী নির্ধারিত সংগ্রহ',
    assignedTimeWindow: 'নির্ধারিত সংগ্রহের সময়সূচি',
    whatWouldYouLikeCollected: 'কী ধরনের বর্জ্য দিতে চান?',
    whatWouldYouLikeCollectedSub: 'পরিচ্ছন্ন পুনর্ব্যবহারযোগ্য বর্জ্য নির্বাচন করুন, আপনার পছন্দের সময় বেছে নিন এবং ডোরস্টেপেই নিশ্চিত সার্কুলার রিওয়ার্ড পয়েন্ট অর্জন করুন।',
    prepReminderActive: '২৪ ঘণ্টার প্রস্তুতি নির্দেশিকা সক্রিয়',
    prepReminderDesc: 'বোতল ধুয়ে শুকিয়ে নিন, কার্টুন চ্যাপ্টা করুন এবং কালেক্টর পৌঁছানোর ১৫ মিনিট আগে প্রস্তুত রাখুন।',
    viewChecklist: 'চেকলিস্ট দেখুন',
    rewardsBalance: 'উপলব্ধ পয়েন্ট',
    availableToRedeem: 'রিডিমযোগ্য পয়েন্ট',
    pendingHubCheck: 'হাবে ডিজিটাল স্কেলে যাচাইাধীন',
    totalDiverted: 'মোট উদ্ধারকৃত বর্জ্য পুনর্ব্যবহার',
    redeemVouchers: 'ভাউচারে পয়েন্ট রিডিম করুন',
    serviceAddress: 'সেবার ঠিকানা',
    changeAddress: 'পরিবর্তন',
    automatedAlerts: 'স্বয়ংক্রিয় ২৪ ঘণ্টার সতর্কতা',
    viewAll: 'সবগুলো দেখুন',
    approvedStreams: 'অনুমোদিত ক্লিন লেন উপাদান',
    solidWasteRules: 'বাংলাদেশ কঠিন বর্জ্য ব্যবস্থাপনা বিধিমালা ২০২১ অনুযায়ী পৃথককৃত উপাদান',
    acceptedCleanStreams: 'অনুমোদিত পরিচ্ছন্ন বর্জ্য উপাদান',
    segregatedRecyclables: 'যাচাইকৃত রিওয়ার্ড পয়েন্টের জন্য যোগ্য পৃথকীকৃত উপাদান',
    fullSortingGuide: 'সম্পূর্ণ বাছাই নির্দেশিকা →',
    showFull6Streams: 'সকল ৬টি ক্যাটাগরির বিস্তারিত বিবরণ দেখুন ▾',
    hideFull6Streams: '৬টি ক্যাটাগরির বিস্তারিত বিবরণ লুকান ▴',

    step1Title: 'ধাপ ১/৩: কী কী বর্জ্য জমা দেবেন?',
    step1Heading: 'কী কী বর্জ্য জমা দেবেন?',
    step2Title: 'ধাপ ২/৩: কালেক্টর কখন আসবেন?',
    step2Heading: 'কালেক্টর কখন আসবেন?',
    step3Title: 'ধাপ ৩/৩: পর্যালোচনা ও নিশ্চিতকরণ',
    step3Heading: 'পর্যালোচনা ও নিশ্চিতকরণ',
    step4Title: 'বুকিং সম্পন্ন',
    step4Heading: 'আপনার বুকিং সফল হয়েছে ✓',
    selectMaterialsPrompt: 'আপনার কাছে প্রস্তুত থাকা সমস্ত শুকনো ও পরিষ্কার উপাদান নির্বাচন করুন।',
    pickupTimePrompt: 'আপনার সুবিধাজনক তারিখ ও সংগ্রহের সময় নির্বাচন করুন।',
    chooseDay: 'তারিখ নির্বাচন করুন',
    today: 'আজ',
    tomorrow: 'আগামীকাল',
    dayAfterTomorrow: 'পরশু',
    morningSlot: 'সকাল (সকাল ৯:০০ – বেলা ১১:৩০)',
    afternoonSlot: 'দুপুর/বিকাল (দুপুর ২:০০ – বিকাল ৪:৩০)',
    addressLabel: 'পিকআপের ঠিকানা',
    accessInstructionsOptional: 'প্রবেশ বা নিরাপত্তার নির্দেশনা (ঐচ্ছিক)',
    accessPlaceholder: 'যেমন: দারোয়ানকে ৩য় তলায় বেল দিতে বলুন। দরজার পাশে নীল ব্যাগে বর্জ্য রাখা থাকবে।',
    appointmentTicket: 'ডিজিটাল বুকিং টিকেট',
    ticketInstruction: 'কালেক্টর আসার পর ডিজিটাল স্কেলে ওজন যাচাইয়ের সময় এই কোডটি দেখান।',
    noUpfrontPayment: 'কোনো ফি দিতে হবে না। ওজন নিশ্চিত হওয়ার সাথে সাথে পয়েন্ট যুক্ত হবে।',
    verifiedPointsEarned: 'সম্ভাব্য অর্জিত রিওয়ার্ড পয়েন্ট',

    plasticBottlesTitle: 'প্লাস্টিকের বোতল',
    plasticBottlesSub: 'পানি, জুস ও কোমল পানীয়ের পরিষ্কার বোতল',
    cardboardTitle: 'কাগজ ও কার্টন',
    cardboardSub: 'ডেলিভারি বক্স, প্যাকেজিং কার্টন ও পত্রিকা',
    cansTitle: 'ক্যান ও ধাতব পাত্র',
    cansSub: 'কোমল পানীয়ের ক্যান ও ধাতব খাবারের পাত্র',
    hdpeTitle: 'কঠিন প্লাস্টিক কনটেইনার',
    hdpeSub: 'শ্যাম্পু, ডিটারজেন্ট বোতল ও দুধের জার',
    polyFilmTitle: 'পরিষ্কার পলি ফিল্ম ও ব্যাগ',
    polyFilmSub: 'পরিষ্কার গ্রোসারি ব্যাগ ও বাবল র‍্যাপ',
    tetrapakTitle: 'বেভারেজ কার্টন',
    tetrapakSub: 'জুস ও দুধের মাল্টি-লেয়ার জুস বক্স',

    notifCenterTitle: 'বিজ্ঞপ্তি ও সেটিংস',
    prepGuidanceTitle: 'বর্জ্য প্রস্তুতি ও গুণমান চেকলিস্ট',
    prepStep1Title: '১. ধুয়ে পরিষ্কার ও শুকানো',
    prepStep1Desc: 'ভেতরের তরল ফেলে পানি দিয়ে ধুয়ে শুকিয়ে নিন যাতে কোনো দুর্গন্ধ না হয়।',
    prepStep2Title: '২. চ্যাপ্টা ও সংকুচিত করা',
    prepStep2Desc: 'কার্টন বক্স চ্যাপ্টা করুন এবং প্লাস্টিকের বোতল চাপ দিয়ে ছোট করুন।',
    prepStep3Title: '৩. আলাদা ব্যাগে রাখা',
    prepStep3Desc: 'প্লাস্টিক, কাগজ ও ধাতব ক্যান আলাদা ব্যাগে রাখুন যাতে স্কেলে দ্রুত ওজন করা যায়।',
    prepStep4Title: '৪. দরজার সামনে রাখা',
    prepStep4Desc: 'কালেক্টর পৌঁছানোর ১৫ মিনিট আগে নির্ধারিত স্থানে ব্যাগ প্রস্তুত রাখুন।',
    qualityGuidelines: 'ক্লিন লেন মান নিয়ন্ত্রণ নির্দেশিকা',
    acceptedItems: 'পয়েন্টের জন্য অনুমোদিত',
    rejectedItems: 'বর্জনীয় উপাদান',
    doorstepProtocol: 'কালেক্টর হ্যান্ডওভার প্রটোকল',
    doorstepProtocolDesc: 'আমাদের সার্টিফাইড কালেক্টর ডিজিটাল ঝুলন্ত স্কেলের মাধ্যমে আপনার সামনে ওজন নিশ্চিত করবেন।',

    rewardCatalogTitle: 'উপলব্ধ রিওয়ার্ড ভাউচার',
    rewardCatalogSub: 'আপনার অর্জিত পয়েন্ট দিয়ে মুদি সদাই ভাউচার, মোবাইল রিচার্জ এবং ইউটিলিটি বিল ডিসকাউন্ট নিন।',
    pointsLedgerTitle: 'পয়েন্ট লেজার ও অডিট হিসাব',
    pointsLedgerSub: 'ডিজিটাল স্কেলের পরিমাপ অনুযায়ী সংরক্ষিত অপরিবর্তনীয় অডিট ট্রেইল।',
    redeemButton: 'ভাউচার রিডিম করুন',
    morePointsNeeded: 'পয়েন্ট প্রয়োজন',
    funderLabel: 'ইপিআর স্পনসর',

    collectionHistoryTitle: 'বর্জ্য সংগ্রহের ইতিহাস',
    collectionHistorySub: 'প্রতিটি সংগ্রহের নির্ভুল স্কেল ওজন, কাস্টডি চেইন এবং ডিজিটাল প্রমাণাদি।',
    filterAll: 'সকল',
    filterUpcoming: 'আসন্ন',
    filterCompleted: 'সম্পন্ন',
    filterAttention: 'পর্যালোচনাধীন',
    seeReceipt: 'বিস্তারিত দেখুন →',
    scaleWeight: 'সার্টিফাইড ডিজিটাল স্কেল ওজন',
    evidencePackage: 'প্রমাণপত্র স্তর',

    disputeCenterTitle: 'সহায়তা ও সমস্যা সমাধান কেন্দ্র',
    disputeCenterSub: 'বর্জ্য সংগ্রহ বা পয়েন্ট সংক্রান্ত যেকোনো সমস্যা সরাসরি আমাদের টিমকে জানান।',
    selectIssueType: 'সমস্যার ধরণ নির্বাচন করুন',
    issueMissed: 'কালেক্টর নির্ধারিত সময়ে পৌঁছাননি',
    issueWeight: 'স্কেলের ওজনে অমিল বা বিতর্ক',
    issuePoints: 'রিওয়ার্ড পয়েন্ট পেতে বিলম্ব হচ্ছে',
    issueCollector: 'কালেক্টরের অনুপযুক্ত আচরণ বা সেবা ত্রুটি',
    describeIssue: 'সমস্যার বিস্তারিত বিবরণ দিন',
    submitDispute: 'টিকেট জমা দিন',
    disputeReceived: 'আপনার অভিযোগ গৃহীত হয়েছে। অপারেটর অডিট লগ পর্যালোচনা করে দ্রুত সমাধান জানাবে।',

    verifiedCircularityImpact: 'পরিবেশগত সার্কুলার অর্জন',
    divertedFromLandfill: 'মাতুয়াইল ল্যান্ডফিল থেকে অপসারিত',
    co2Avoided: 'কার্বন নির্গমন সাশ্রয়',
    viewImpactLedger: 'ইএসজি খতিয়ান ও প্রভাব দেখুন',
    hideImpactLedger: 'বিবরণ লুকান',
    householdScope: 'আমার পরিবার',
    pilotZoneScope: 'ধানমন্ডি এলাকা (জোন ৫)',
    treesEquivalent: 'গাছ রোপণের সমান অবদান',
    plasticBottlesDiverted: 'প্লাস্টিক বোতল পুনরুদ্ধার',
    landfillSpaceSaved: 'ল্যান্ডফিলের জায়গা সাশ্রয়',

    scanQrCode: 'লট কিউআর কোড স্ক্যান করুন',
    scanQrInstruction: 'দ্রুত শনাক্ত করতে আপনার ক্যামেরাকে ব্যাগের কিউআর কোডের সামনে ধরুন',
    switchCamera: 'ক্যামেরা পরিবর্তন',
    toggleFlash: 'ফ্ল্যাশলাইট',
    recordWeight: 'ওজন রেকর্ড করুন',
    verifiedScaleWeight: 'সার্টিফাইড ডিজিটাল স্কেল ওজন',
    manualLotEntry: 'অথবা ম্যানুয়ালি লট কোড লিখুন',
    lotIdentified: 'লট সফলভাবে শনাক্ত হয়েছে',

    viewPreparationChecklist: 'প্রস্তুতি চেকলিস্ট',
    trackLiveCollection: 'লাইভ অগ্রগতি দেখুন',
    viewScaleCertificate: 'স্কেল সার্টিফিকেট দেখুন',
    recentCollection: 'সাম্প্রতিক সংগ্রহ',
    doorstepSupport: 'ডোরস্টেপ সহায়তা',
    pickupQuestions: 'সংগ্রহ সংক্রান্ত কোনো প্রশ্ন?',
    getHelp: 'সহায়তা নিন',
    selectAddress: 'সেবার ঠিকানা নির্বাচন করুন',
    addNewAddress: 'নতুন ঠিকানা যোগ করুন'
  }
};

/**
 * Translation helper function
 */
export function useTranslation(lang: 'en' | 'bn'): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
