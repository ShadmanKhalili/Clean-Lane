import type { MaterialCategory } from '../types';

export interface RecycleItem {
  id: string;
  en: string;
  bn: string;
  recyclable: boolean;
  /** Set for recyclable items: which Clean Lane material stream they join. */
  material?: MaterialCategory;
  tipEn: string;
  tipBn: string;
  keywords: string[];
}

/** Everyday Dhaka household items. Clean Lane collects clean, dry, sorted streams only. */
export const ITEMS: RecycleItem[] = [
  // ---- Recyclable: plastic bottles (PET) ----
  { id: 'pet-water-bottle', en: 'Plastic water bottle', bn: 'প্লাস্টিকের পানির বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Empty it, rinse, and squash it flat.', tipBn: 'খালি করে ধুয়ে চেপ্টা করে রাখুন।', keywords: ['water bottle', 'bottle', 'pet', 'mineral water', 'pani', 'পানির বোতল', 'বোতল', 'পানি'] },
  { id: 'pet-large-bottle', en: 'Large water bottle (1.5 litre)', bn: 'দেড় লিটারের পানির বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Empty, rinse, and squash flat.', tipBn: 'খালি করে ধুয়ে চেপ্টা করুন।', keywords: ['1.5 litre', 'large bottle', 'big bottle', 'বড় বোতল', 'দেড় লিটার'] },
  { id: 'pet-soft-drink-bottle', en: 'Soft-drink bottle', bn: 'কোল্ড ড্রিংকসের বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Rinse, squash flat. Caps go in their own bag.', tipBn: 'ধুয়ে চেপ্টা করুন। ঢাকনা আলাদা ব্যাগে।', keywords: ['coke', 'cola', 'soda', 'sprite', 'cold drink', 'soft drink', 'কোক', 'কোলা', 'কোল্ড ড্রিংক', 'সফট ড্রিংক'] },
  { id: 'juice-bottle-1l', en: 'One-litre plastic juice bottle', bn: 'এক লিটারের প্লাস্টিকের জুসের বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Empty, rinse, and squash flat.', tipBn: 'খালি করে ধুয়ে চেপ্টা করুন।', keywords: ['juice bottle', 'plastic juice', 'জুসের বোতল', 'জুস'] },
  { id: 'cooking-oil-bottle', en: 'Cooking-oil bottle', bn: 'রান্নার তেলের বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Rinse with hot water until no oil is left.', tipBn: 'গরম পানি দিয়ে তেল একদম না থাকা পর্যন্ত ধুন।', keywords: ['oil bottle', 'cooking oil', 'soybean oil', 'তেলের বোতল', 'সয়াবিন তেল', 'ভোজ্য তেল'] },
  { id: 'hair-oil-bottle', en: 'Hair-oil bottle', bn: 'চুলের তেলের বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Rinse out all the oil. Squash flat.', tipBn: 'তেল ধুয়ে ফেলে চেপ্টা করুন।', keywords: ['hair oil', 'চুলের তেল'] },
  { id: 'soy-sauce-bottle', en: 'Soy sauce or vinegar bottle', bn: 'সয়া সসের বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Rinse well, dry, and squash flat.', tipBn: 'ভালো করে ধুয়ে শুকিয়ে চেপ্টা করুন।', keywords: ['soy sauce', 'sauce bottle', 'vinegar', 'সস', 'সয়া সস', 'ভিনেগার'] },
  { id: 'honey-bottle', en: 'Plastic honey bottle', bn: 'প্লাস্টিকের মধুর বোতল', recyclable: true, material: 'PET_BOTTLES', tipEn: 'Rinse out the honey with warm water.', tipBn: 'গরম পানি দিয়ে মধু ধুয়ে ফেলুন।', keywords: ['honey', 'মধু', 'মধুর বোতল'] },

  // ---- Recyclable: hard plastic (HDPE) ----
  { id: 'bottle-cap', en: 'Plastic bottle cap', bn: 'বোতলের ঢাকনা', recyclable: true, material: 'HDPE_RIGID', tipEn: 'Keep caps in a separate small bag.', tipBn: 'ঢাকনা আলাদা একটি ছোট ব্যাগে রাখুন।', keywords: ['cap', 'lid', 'bottle cap', 'ঢাকনা', 'বোতলের মুখ'] },
  { id: 'shampoo-bottle', en: 'Shampoo bottle', bn: 'শ্যাম্পুর বোতল', recyclable: true, material: 'HDPE_RIGID', tipEn: 'Empty fully, rinse, and let it dry.', tipBn: 'পুরোপুরি খালি করে ধুয়ে শুকাতে দিন।', keywords: ['shampoo', 'conditioner', 'hair wash', 'শ্যাম্পু', 'শ্যাম্পুর বোতল'] },
  { id: 'detergent-bottle', en: 'Detergent or dish-wash bottle', bn: 'ডিটারজেন্ট বা ডিশওয়াশের বোতল', recyclable: true, material: 'HDPE_RIGID', tipEn: 'Rinse well and let it dry.', tipBn: 'ভালো করে ধুয়ে শুকাতে দিন।', keywords: ['detergent', 'washing liquid', 'dish wash', 'dishwash', 'ডিটারজেন্ট', 'ডিশ ওয়াশ', 'ডিশওয়াশ'] },
  { id: 'detergent-powder-tub', en: 'Detergent powder tub', bn: 'গুঁড়া সাবানের প্লাস্টিক কৌটা', recyclable: true, material: 'HDPE_RIGID', tipEn: 'Empty out the powder, rinse, and let it dry.', tipBn: 'গুঁড়া ফেলে ধুয়ে শুকাতে দিন।', keywords: ['powder tub', 'detergent powder', 'plastic tub', 'কৌটা', 'ডিটারজেন্ট পাউডার'] },
  { id: 'harpic-bottle', en: 'Toilet-cleaner bottle', bn: 'টয়লেট ক্লিনারের বোতল', recyclable: true, material: 'HDPE_RIGID', tipEn: 'Rinse very well so no chemical is left.', tipBn: 'খুব ভালো করে ধুয়ে রাসায়নিক অবশিষ্ট রাখবেন না।', keywords: ['harpic', 'toilet cleaner', 'phenyl', 'bleach', 'হার্পিক', 'ফিনাইল', 'টয়লেট ক্লিনার'] },
  { id: 'liquid-soap-bottle', en: 'Liquid soap bottle', bn: 'তরল সাবানের বোতল', recyclable: true, material: 'HDPE_RIGID', tipEn: 'Remove the pump, rinse, and keep the bottle.', tipBn: 'পাম্প খুলে ধুয়ে নিন।', keywords: ['liquid soap', 'hand wash', 'handwash', 'soap pump', 'তরল সাবান', 'হ্যান্ডওয়াশ', 'সাবানের বোতল'] },
  { id: 'oil-jerrycan', en: 'Large plastic oil can (5 litre)', bn: 'পাঁচ লিটারের তেলের প্লাস্টিক ক্যান', recyclable: true, material: 'HDPE_RIGID', tipEn: 'Drain, rinse, and keep it dry.', tipBn: 'তেল ঝরিয়ে ধুয়ে শুকনো রাখুন।', keywords: ['jerrycan', 'jerry can', '5 litre', 'oil can', 'জেরিক্যান', 'তেলের ক্যান'] },

  // ---- Recyclable: soft plastic film (LDPE) ----
  { id: 'milk-packet', en: 'Clean milk packet', bn: 'দুধের খালি প্যাকেট', recyclable: true, material: 'LDPE_FILM', tipEn: 'Clean, dry, and flatten it.', tipBn: 'পরিষ্কার ও শুকনো রেখে চেপ্টা করুন।', keywords: ['milk packet', 'milk bag', 'milk pouch', 'dudh', 'doodh', 'দুধের প্যাকেট', 'দুধের থলি'] },
  { id: 'polythene-bag-clean', en: 'Clean polythene carrier bag', bn: 'পরিষ্কার পলিথিন ব্যাগ', recyclable: true, material: 'LDPE_FILM', tipEn: 'Clean, dry, and folded. Nothing sticky inside.', tipBn: 'পরিষ্কার, শুকনো আর ভাঁজ করে রাখুন।', keywords: ['polythene', 'poly bag', 'polybag', 'carrier bag', 'shopping bag', 'plastic bag', 'পলি', 'পলিথিন', 'পলিব্যাগ', 'শপিং ব্যাগ'] },
  { id: 'veg-bag-clean', en: 'Thin vegetable bag', bn: 'সবজির পাতলা ব্যাগ', recyclable: true, material: 'LDPE_FILM', tipEn: 'Shake out soil and leaves. Keep it dry.', tipBn: 'মাটি ও পাতা ঝেড়ে শুকনো রাখুন।', keywords: ['veg bag', 'vegetable bag', 'thin bag', 'সবজির ব্যাগ', 'সবজির পলিথিন', 'পাতলা ব্যাগ'] },
  { id: 'bread-bag', en: 'Bread bag', bn: 'রুটির ব্যাগ', recyclable: true, material: 'LDPE_FILM', tipEn: 'Clean and dry. Take the tie off.', tipBn: 'শুকনো রাখুন; টুইস্ট-টাই খুলে নিন।', keywords: ['bread bag', 'bread packet', 'ruti', 'bread wrapper', 'রুটির ব্যাগ', 'রুটির প্যাকেট', 'রুটি'] },

  // ---- Recyclable: aluminium and drink cartons ----
  { id: 'aluminium-can', en: 'Aluminium drink can', bn: 'অ্যালুমিনিয়ামের ক্যান', recyclable: true, material: 'ALUMINUM_CANS', tipEn: 'Rinse out the drink, crush it, keep it dry.', tipBn: 'পানীয় ধুয়ে চেপে শুকনো রাখুন।', keywords: ['can', 'soda can', 'beer can', 'drink can', 'aluminium', 'aluminum', 'ক্যান', 'অ্যালুমিনিয়াম', 'কোল্ড ড্রিংক ক্যান'] },
  { id: 'foil-tray', en: 'Clean aluminium foil tray', bn: 'পরিষ্কার অ্যালুমিনিয়ামের ট্রে', recyclable: true, material: 'ALUMINUM_CANS', tipEn: 'Only if clean. Scrape off all food.', tipBn: 'শুধু পরিষ্কার হলে; খাবারের অংশ মুছে ফেলুন।', keywords: ['foil', 'foil tray', 'aluminium tray', 'ফয়েল', 'অ্যালুমিনিয়াম ট্রে'] },
  { id: 'juice-carton', en: 'Juice carton (Tetra Pak)', bn: 'জুসের কার্টন (টেট্রা প্যাক)', recyclable: true, material: 'TETRAPAK_BEVERAGE', tipEn: 'Rinse, flatten, and throw the straw away.', tipBn: 'ধুয়ে চেপ্টা করুন; স্ট্র ফেলে দিন।', keywords: ['juice box', 'tetra pak', 'tetrapak', 'carton', 'milk carton', 'juice pack', 'জুস', 'টেট্রা প্যাক', 'কার্টন', 'জুসের প্যাকেট'] },

  // ---- Recyclable: paper and card (OCC / clean paper) ----
  { id: 'cardboard-delivery-box', en: 'Cardboard delivery box', bn: 'কার্ডবোর্ডের ডেলিভারি বাক্স', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Flatten it. Remove tape and plastic windows.', tipBn: 'চেপ্টা করুন; টেপ ও প্লাস্টিকের জানালা খুলে নিন।', keywords: ['box', 'carton box', 'cardboard', 'delivery box', 'courier box', 'কার্টন', 'বাক্স', 'কার্ডবোর্ড', 'ডেলিভারি বক্স'] },
  { id: 'cereal-box', en: 'Cereal or biscuit card box', bn: 'সিরিয়াল বা বিস্কুটের কার্ডবোর্ড বাক্স', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Flatten it. Take out any plastic liner.', tipBn: 'চেপ্টা করুন; ভেতরের প্লাস্টিক খুলে নিন।', keywords: ['cereal box', 'biscuit box', 'card box', 'সিরিয়াল', 'বিস্কুটের বাক্স'] },
  { id: 'shoe-box', en: 'Shoe box', bn: 'জুতার বাক্স', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Flatten it and keep it dry.', tipBn: 'চেপ্টা করে শুকনো রাখুন।', keywords: ['shoe box', 'shoebox', 'জুতার বক্স', 'জুতার বাক্স'] },
  { id: 'pizza-lid-clean', en: 'Clean pizza-box lid', bn: 'পরিষ্কার পিজ্জার বাক্সের ঢাকনা', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Only if there is no grease or cheese.', tipBn: 'তেল বা পনির না লাগলে তবেই দিন।', keywords: ['pizza box', 'pizza lid', 'পিৎজা', 'পিজ্জার বাক্স'] },
  { id: 'toilet-roll-tube', en: 'Toilet-roll tube', bn: 'টয়লেট রোলের নল', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Flatten it and keep it dry.', tipBn: 'চেপ্টা করে শুকনো রাখুন।', keywords: ['toilet roll', 'tissue roll', 'roll core', 'টয়লেট রোল', 'রোলের নল'] },
  { id: 'egg-tray', en: 'Egg tray', bn: 'ডিমের ট্রে', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Keep it dry. Wet trays do not go in.', tipBn: 'শুকনো রাখুন; ভেজা ট্রে দেবেন না।', keywords: ['egg tray', 'egg box', 'egg carton', 'ডিমের ট্রে', 'ডিমের বাক্স', 'ডিম'] },
  { id: 'newspaper', en: 'Newspaper', bn: 'খবরের কাগজ', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Keep it dry. Stack it and tie with string.', tipBn: 'শুকনো রেখে গাদা করে সুতলি দিয়ে বাঁধুন।', keywords: ['news paper', 'paper', 'old newspaper', 'kagoj', 'kagaj', 'কাগজ', 'পত্রিকা', 'পুরনো কাগজ'] },
  { id: 'office-paper', en: 'Office paper or exercise book pages', bn: 'অফিসের কাগজ বা খাতার পাতা', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Take out wire springs and plastic covers.', tipBn: 'স্প্রিং ও প্লাস্টিকের মলাট খুলে নিন।', keywords: ['copy paper', 'a4', 'notebook', 'exercise book', 'khata', 'খাতা', 'খাতার পাতা', 'অফিসের কাগজ', 'ফটোকপি'] },
  { id: 'paper-bag-plain', en: 'Plain paper bag', bn: 'সাদা কাগজের ব্যাগ', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Only if plain. Keep it dry and flat.', tipBn: 'শুধু সাদা হলে দিন; শুকনো ও চেপ্টা রাখুন।', keywords: ['paper bag', 'kagojer bag', 'কাগজের ব্যাগ', 'কাগজের থলি'] },
  { id: 'envelope', en: 'Paper envelope', bn: 'কাগজের খাম', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Remove the plastic window.', tipBn: 'প্লাস্টিকের জানালা খুলে নিন।', keywords: ['envelope', 'letter', 'খাম', 'চিঠি'] },
  { id: 'gift-box', en: 'Plain card gift box', bn: 'সাদা কার্ডের গিফট বাক্স', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Remove ribbon, foil, and plastic film.', tipBn: 'ফিতা, ফয়েল ও প্লাস্টিক খুলে নিন।', keywords: ['gift box', 'card box', 'গিফট বক্স', 'উপহারের বাক্স'] },
  { id: 'milk-powder-box', en: 'Milk-powder card box', bn: 'দুধের গুঁড়ার কার্ডবোর্ড বাক্স', recyclable: true, material: 'CARDBOARD_OCC', tipEn: 'Flatten it. Take out the inner foil bag.', tipBn: 'চেপ্টা করুন; ভেতরের ফয়েলের প্যাকেট খুলে নিন।', keywords: ['milk powder', 'গুঁড়া দুধ', 'দুধের গুঁড়া', 'দুধের বাক্স'] },

  // ---- Not recyclable (Clean Lane does not collect these) ----
  { id: 'chip-packet', en: 'Chips or crisp packet', bn: 'চিপসের প্যাকেট', recyclable: false, tipEn: 'Multi-layer foil. Not recyclable here, so use general waste.', tipBn: 'একাধিক স্তরের ফয়েল, এখানে রিসাইকেল হয় না। সাধারণ বর্জ্যে দিন।', keywords: ['chips', 'crisps', 'chip packet', 'chanachur', 'chanachur packet', 'চিপস', 'চানাচুর', 'চানাচুরের প্যাকেট'] },
  { id: 'pizza-box-greasy', en: 'Greasy pizza box', bn: 'তেল-মাখা পিজ্জার বাক্স', recyclable: false, tipEn: 'Grease ruins the paper. Only a clean lid goes in.', tipBn: 'তেল লাগলে কাগজ নষ্ট হয়। পরিষ্কার ঢাকনাই শুধু দিন।', keywords: ['greasy box', 'oily box', 'pizza', 'পিজ্জা', 'তেলাক্ত'] },
  { id: 'tissue', en: 'Used tissue or napkin', bn: 'ব্যবহৃত টিস্যু', recyclable: false, tipEn: 'Wet and soiled paper cannot be recycled.', tipBn: 'ভেজা ও নোংরা কাগজ রিসাইকেল হয় না।', keywords: ['tissue', 'paper towel', 'napkin', 'টিস্যু', 'ন্যাপকিন', 'কাগজের রুমাল'] },
  { id: 'food-waste', en: 'Banana peel or food scraps', bn: 'কলার খোসা বা খাবারের উচ্ছিষ্ট', recyclable: false, tipEn: 'Compost it at home, or keep it separate.', tipBn: 'বাসায় কম্পোস্ট করুন, বা আলাদা রাখুন।', keywords: ['banana peel', 'peel', 'food waste', 'scraps', 'কলার খোসা', 'খোসা', 'উচ্ছিষ্ট', 'খাবার'] },
  { id: 'battery', en: 'Batteries', bn: 'ব্যাটারি', recyclable: false, tipEn: 'Batteries are hazardous. Give them to a battery drop-off.', tipBn: 'ব্যাটারি বিপজ্জনক। আলাদাভাবে ফেরত দিন।', keywords: ['battery', 'cell', 'AA', 'AAA', 'ব্যাটারি', 'সেল'] },
  { id: 'charger', en: 'Phone charger or cable', bn: 'ফোনের চার্জার বা তার', recyclable: false, tipEn: 'Electronics go to e-waste, not the recycling bag.', tipBn: 'ইলেকট্রনিক বর্জ্য আলাদা করে দিন।', keywords: ['charger', 'cable', 'wire', 'e-waste', 'চার্জার', 'তার', 'ই-বর্জ্য'] },
  { id: 'broken-glass', en: 'Broken glass bottle', bn: 'ভাঙা কাঁচের বোতল', recyclable: false, tipEn: 'Clean Lane does not collect glass. Wrap the pieces safely.', tipBn: 'Clean Lane কাঁচ নেয় না। ভাঙা টুকরো মুড়ে রাখুন।', keywords: ['glass', 'kancher', 'kacher', 'কাঁচ', 'কাচ', 'কাঁচের বোতল'] },
  { id: 'thermocol', en: 'Thermocol or styrofoam box', bn: 'থার্মোকলের বাক্স', recyclable: false, tipEn: 'Thermocol is not accepted. Keep it out of the bag.', tipBn: 'থার্মোকল নেওয়া হয় না। ব্যাগে দেবেন না।', keywords: ['thermocol', 'styrofoam', 'foam', 'polystyrene', 'থার্মোকল', 'ফোম'] },
  { id: 'medicine-blister', en: 'Medicine blister strip', bn: 'ওষুধের ব্লিস্টার পাতা', recyclable: false, tipEn: 'Mixed foil and plastic. Give unused medicine back to a pharmacy.', tipBn: 'ফয়েল আর প্লাস্টিক মেশানো। বাড়তি ওষুধ ফার্মেসিতে দিন।', keywords: ['blister', 'tablet strip', 'medicine', 'ওষুধ', 'ট্যাবলেট', 'ব্লিস্টার'] },
  { id: 'toothpaste-tube', en: 'Toothpaste tube', bn: 'টুথপেস্টের টিউব', recyclable: false, tipEn: 'Tubes mix plastic and foil. Not accepted.', tipBn: 'টিউবে প্লাস্টিক ও ফয়েল মেশানো, তাই নেওয়া হয় না।', keywords: ['toothpaste', 'tube', 'টুথপেস্ট', 'টিউব'] },
  { id: 'biscuit-wrapper', en: 'Biscuit wrapper', bn: 'বিস্কুটের মোড়ক', recyclable: false, tipEn: 'Foil-lined wrappers go in general waste.', tipBn: 'ফয়েলের মোড়ক সাধারণ বর্জ্যে যাবে।', keywords: ['biscuit', 'biscuit packet', 'cookie', 'বিস্কুট', 'বিস্কুটের প্যাকেট'] },
  { id: 'candy-wrapper', en: 'Chocolate or candy wrapper', bn: 'চকলেটের মোড়ক', recyclable: false, tipEn: 'Shiny wrappers cannot be recycled here.', tipBn: 'চকচকে মোড়ক এখানে রিসাইকেল হয় না।', keywords: ['chocolate', 'candy', 'toffee', 'wrapper', 'চকলেট', 'টফি', 'ক্যান্ডি', 'মোড়ক'] },
  { id: 'dirty-polythene', en: 'Polythene with food or oil', bn: 'খাবার বা তেল লাগা পলিথিন', recyclable: false, tipEn: 'Food on the film spoils the whole batch. Bin it.', tipBn: 'খাবার লাগলে পুরো ব্যাচ নষ্ট হয়। ফেলে দিন।', keywords: ['dirty bag', 'greasy bag', 'food bag', 'নোংরা পলিথিন', 'তেলাক্ত ব্যাগ'] },
  { id: 'plastic-straw', en: 'Plastic straw', bn: 'প্লাস্টিকের স্ট্র', recyclable: false, tipEn: 'Too small for our sorting. Say no to it next time.', tipBn: 'খুব ছোট বলে নেওয়া হয় না। পরের বার না বলুন।', keywords: ['straw', 'স্ট্র'] },
  { id: 'paper-cup', en: 'Paper cup with plastic lining', bn: 'প্লাস্টিক আস্তরণের কাগজের কাপ', recyclable: false, tipEn: 'The inner plastic lining stops recycling. Use a steel cup.', tipBn: 'ভেতরের প্লাস্টিকের জন্য রিসাইকেল হয় না। স্টিলের কাপ ব্যবহার করুন।', keywords: ['cup', 'paper cup', 'tea cup', 'কাপ', 'কাগজের কাপ', 'চায়ের কাপ'] },
  { id: 'tea-bag', en: 'Used tea bag', bn: 'ব্যবহৃত চায়ের ব্যাগ', recyclable: false, tipEn: 'Tea leaves can be composted. The bag is general waste.', tipBn: 'চা-পাতা কম্পোস্ট করা যায়। ব্যাগ সাধারণ বর্জ্যে।', keywords: ['tea bag', 'tea', 'চা', 'চায়ের ব্যাগ', 'চা পাতা'] },
  { id: 'cigarette-butt', en: 'Cigarette butt', bn: 'সিগারেটের টুকরো', recyclable: false, tipEn: 'Filters are plastic. Use a butt bin.', tipBn: 'ফিল্টার প্লাস্টিকের। আলাদা ডাস্টবিন ব্যবহার করুন।', keywords: ['cigarette', 'butt', 'smoke', 'সিগারেট', 'বিড়ি'] },
  { id: 'plastic-spoon', en: 'Plastic spoon or fork', bn: 'প্লাস্টিকের চামচ', recyclable: false, tipEn: 'Too small and mixed. Use a reusable spoon.', tipBn: 'ছোট ও মিশ্র। আবার ব্যবহারযোগ্য চামচ নিন।', keywords: ['spoon', 'fork', 'cutlery', 'চামচ', 'প্লাস্টিক চামচ'] },
  { id: 'yogurt-cup', en: 'Yogurt or dahi cup', bn: 'দইয়ের কাপ', recyclable: false, tipEn: 'Not in our pilot yet. Keep it in general waste.', tipBn: 'এখনো আমাদের পাইলটে নেই। সাধারণ বর্জ্যে রাখুন।', keywords: ['yogurt', 'yoghurt', 'dahi', 'doi', 'দই', 'দইয়ের কাপ'] },
  { id: 'sanitary-pad', en: 'Sanitary pad', bn: 'স্যানিটারি প্যাড', recyclable: false, tipEn: 'Wrap it and put it in general waste.', tipBn: 'মুড়িয়ে সাধারণ বর্জ্যে দিন।', keywords: ['sanitary pad', 'period pad', 'pad', 'স্যানিটারি প্যাড', 'প্যাড'] },
  { id: 'ballpoint-pen', en: 'Ballpoint pen', bn: 'বলপয়েন্ট কলম', recyclable: false, tipEn: 'Mixed plastic and ink. Use a refillable pen.', tipBn: 'প্লাস্টিক ও কালি মেশানো। রিফিল করা কলম নিন।', keywords: ['pen', 'ballpoint', 'কলম', 'বলপয়েন্ট'] },
  { id: 'old-cloth', en: 'Old cloth or rags', bn: 'পুরনো কাপড় বা ন্যাকড়া', recyclable: false, tipEn: 'Not in our list yet. Donate it or reuse it.', tipBn: 'এখনো আমাদের তালিকায় নেই। দান করুন বা নতুন কাজে লাগান।', keywords: ['cloth', 'rag', 'old clothes', 'কাপড়', 'ন্যাকড়া', 'পুরনো কাপড়'] },
  { id: 'rice-sack', en: 'Rice or flour sack (woven plastic)', bn: 'চাল বা আটার বস্তা (বোনা প্লাস্টিক)', recyclable: false, tipEn: 'Woven sacks are not in our pilot. Reuse them.', tipBn: 'বোনা বস্তা এখন নেওয়া হয় না। নতুন কাজে লাগান।', keywords: ['sack', 'bag of rice', 'bori', 'বস্তা', 'চালের বস্তা', 'আটার বস্তা'] },
  { id: 'shampoo-sachet', en: 'Shampoo sachet', bn: 'শ্যাম্পুর ছোট প্যাকেট', recyclable: false, tipEn: 'Multi-layer sachets cannot be recycled.', tipBn: 'এই ছোট প্যাকেট রিসাইকেল হয় না।', keywords: ['sachet', 'pouch', 'শ্যাম্পু প্যাকেট', 'স্যাশে'] },
  { id: 'receipt-paper', en: 'Shop receipt (thermal paper)', bn: 'দোকানের রসিদ (থার্মাল কাগজ)', recyclable: false, tipEn: 'Thermal paper is coated. Not accepted.', tipBn: 'এই কাগজে আস্তরণ থাকে, তাই নেওয়া হয় না।', keywords: ['receipt', 'bill', 'thermal paper', 'রসিদ', 'বিল'] },
  { id: 'cling-film', en: 'Cling film', bn: 'ক্লিং ফিল্ম', recyclable: false, tipEn: 'Thin stretch film is not accepted. Bin it.', tipBn: 'পাতলা স্ট্রেচ ফিল্ম নেওয়া হয় না। ফেলে দিন।', keywords: ['cling film', 'cling wrap', 'saran', 'ক্লিং ফিল্ম', 'মোড়ক'] },
  { id: 'steel-tin', en: 'Steel tin (fish or milk tin)', bn: 'স্টিলের টিন (মাছ বা দুধের)', recyclable: false, tipEn: 'Steel tins are not in our pilot. Keep them out.', tipBn: 'স্টিলের টিন এখন নেওয়া হয় না। বাইরে রাখুন।', keywords: ['tin', 'steel tin', 'fish tin', 'condensed milk', 'টিন', 'মাছের টিন'] }
];

const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Case-insensitive search across English, Bangla and keywords.
 * Ranking: a field starting with the query (0) beats a word inside a field (1),
 * which beats a plain substring (2). Ties keep the list order.
 */
export function searchItems(query: string, items: RecycleItem[] = ITEMS): RecycleItem[] {
  const q = norm(query);
  if (!q) return [];
  const scored: { item: RecycleItem; score: number; index: number }[] = [];
  items.forEach((item, index) => {
    let best = Infinity;
    for (const field of [item.en, item.bn, ...item.keywords]) {
      const t = norm(field);
      if (t.startsWith(q)) best = Math.min(best, 0);
      else if (t.split(/[\s/(),.-]+/).some((w) => w.startsWith(q))) best = Math.min(best, 1);
      else if (t.includes(q)) best = Math.min(best, 2);
    }
    if (best !== Infinity) scored.push({ item, score: best, index });
  });
  return scored.sort((a, b) => a.score - b.score || a.index - b.index).map((s) => s.item);
}

/** Small seeded PRNG (mulberry32) so a seed always gives the same round. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick n distinct items. Each kind (recyclable / not) makes up at least a third
 * of the round when n >= 3. Pass a seed for a repeatable round.
 */
export function pickRound(n: number, seed?: number): RecycleItem[] {
  const rand = seed === undefined ? Math.random : mulberry32(seed);
  const rec = shuffle(
    ITEMS.filter((i) => i.recyclable),
    rand
  );
  const non = shuffle(
    ITEMS.filter((i) => !i.recyclable),
    rand
  );
  const count = Math.max(0, Math.min(n, rec.length + non.length));
  const minEach = count >= 3 ? Math.ceil(count / 3) : 0;
  let nonCount = minEach + Math.floor(rand() * (count - 2 * minEach + 1));
  // Respect pool sizes: enough non-recyclable and enough recyclable items must remain.
  nonCount = Math.min(non.length, Math.max(count - rec.length, nonCount, 0));
  const recCount = count - nonCount;
  const picked = [...non.slice(0, nonCount), ...rec.slice(0, recCount)];
  return shuffle(picked, rand);
}
