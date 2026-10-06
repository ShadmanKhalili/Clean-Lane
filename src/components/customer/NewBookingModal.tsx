import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerType, MaterialCategory } from '../../types';
import { MATERIAL_TAXONOMY } from '../../data/mockData';
import { X, Calendar, Clock, MapPin, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose }) => {
  const { lang, role, serviceZones, createBooking } = useApp();

  const customerTypeMap: Record<string, CustomerType> = {
    customer_household: 'household',
    customer_apartment: 'apartment',
    customer_business: 'business'
  };

  const defaultCustomerType = customerTypeMap[role] || 'household';

  const [customerName, setCustomerName] = useState(
    role === 'customer_apartment'
      ? 'Green View Heights Committee'
      : role === 'customer_business'
      ? 'Artisan Roastery & Café'
      : 'Nasreen Akhter'
  );
  const [phone, setPhone] = useState('+880 1712 345678');
  const [selectedZone, setSelectedZone] = useState('ZONE-GUL-02');
  const [address, setAddress] = useState(
    role === 'customer_apartment'
      ? 'Plot 32, Road 11, Banani Block C, Dhaka'
      : role === 'customer_business'
      ? 'Road 60, Gulshan-2, Dhaka'
      : 'House 14, Road 52, Gulshan-2, Dhaka'
  );
  const [accessInstructions, setAccessInstructions] = useState(
    role === 'customer_apartment'
      ? 'Basement segregation bay #2. Security guard Mr. Kabir available.'
      : 'Apartment 4B, security will buzz elevator. Sacks kept outside door.'
  );

  const [serviceType, setServiceType] = useState<'DOORSTEP_RECOVERY' | 'COMMERCIAL_BATCH' | 'BULKY_CLEAN_LANE'>(
    role === 'customer_business' ? 'COMMERCIAL_BATCH' : 'DOORSTEP_RECOVERY'
  );

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [scheduledDate, setScheduledDate] = useState('2026-10-07');
  const [scheduledTimeWindow, setScheduledTimeWindow] = useState('09:00 AM - 11:30 AM');

  // Selected materials with bands
  const [selectedMaterials, setSelectedMaterials] = useState<
    { category: MaterialCategory; approximateBandKg: string }[]
  >([
    { category: 'PET_BOTTLES', approximateBandKg: '2-5 kg' },
    { category: 'CARDBOARD_OCC', approximateBandKg: '5-15 kg' }
  ]);

  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentZoneObj = serviceZones.find((z) => z.id === selectedZone);
  const isZoneActive = currentZoneObj?.status === 'active_clean_lane';

  const toggleMaterial = (cat: MaterialCategory) => {
    if (selectedMaterials.some((m) => m.category === cat)) {
      if (selectedMaterials.length > 1) {
        setSelectedMaterials(selectedMaterials.filter((m) => m.category !== cat));
      }
    } else {
      setSelectedMaterials([...selectedMaterials, { category: cat, approximateBandKg: '2-5 kg' }]);
    }
  };

  const updateMaterialBand = (cat: MaterialCategory, band: string) => {
    setSelectedMaterials(
      selectedMaterials.map((m) => (m.category === cat ? { ...m, approximateBandKg: band } : m))
    );
  };

  const serviceFee = serviceType === 'COMMERCIAL_BATCH' ? 150 : serviceType === 'BULKY_CLEAN_LANE' ? 250 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isZoneActive) {
      alert('Selected zone is currently in expansion phase. Please choose an active clean lane zone.');
      return;
    }

    createBooking({
      customerId: role === 'customer_apartment' ? 'CUST-APT-402' : role === 'customer_business' ? 'CUST-BIZ-511' : 'CUST-H-801',
      customerName,
      customerType: defaultCustomerType,
      phone,
      address,
      zoneId: selectedZone,
      accessInstructions,
      scheduledDate,
      scheduledTimeWindow,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      serviceType,
      materials: selectedMaterials,
      serviceFeeBdt: serviceFee,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'en' ? 'Book Clean Lane Recovery Service' : 'ক্লিন লেন বর্জ্য সংগ্রহ বুকিং'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Scheduled doorstep or bay collection within designated recovery corridor'
                : 'নির্ধারিত করিডোরে বাসাবাড়ি বা প্রতিষ্ঠান থেকে অনুমোদিত সংগ্রহ'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Zone Eligibility Check (PRD C-03, C-04) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'en' ? 'Service Zone Eligibility Check' : 'সার্ভিস জোন যাচাই'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {serviceZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.status === 'active_clean_lane' ? 'Active' : 'Waitlist'})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 text-xs">
                {isZoneActive ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Eligible Zone · Daily Pickups Active
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Expansion Phase · Pre-registration Only
                  </span>
                )}
              </div>
            </div>
            {currentZoneObj && (
              <p className="text-xs text-slate-500 mt-2">
                Coverage: {currentZoneObj.coverageDescription} (Enterprise: {currentZoneObj.assignedEnterprise})
              </p>
            )}
          </div>

          {/* Account Details & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'en' ? 'Contact Name' : 'যোগাযোগকারীর নাম'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'en' ? 'Contact Phone' : 'মোবাইল নম্বর'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {lang === 'en' ? 'Pickup Address (Street & Floor / Plot)' : 'সংগ্রহের ঠিকানা'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {lang === 'en' ? 'Access Instructions / Gate Notes' : 'গেট বা প্রবেশের নির্দেশিকা'}
            </label>
            <input
              type="text"
              value={accessInstructions}
              onChange={(e) => setAccessInstructions(e.target.value)}
              placeholder="e.g. Leave sacks at basement bay 2, security will buzz..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Schedule & Recurrence (PRD C-13) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                {lang === 'en' ? 'Date' : 'তারিখ'}
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                {lang === 'en' ? 'Time Window' : 'সময়সূচি'}
              </label>
              <select
                value={scheduledTimeWindow}
                onChange={(e) => setScheduledTimeWindow(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="09:00 AM - 11:30 AM">09:00 AM - 11:30 AM (Morning)</option>
                <option value="02:00 PM - 04:30 PM">02:00 PM - 04:30 PM (Afternoon)</option>
                <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM (Evening)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {lang === 'en' ? 'Recurrence' : 'পুনরাবৃত্তি'}
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{lang === 'en' ? 'Weekly recurring' : 'সাপ্তাহিক'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Material Selection (PRD C-09, C-14) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-800">
                {lang === 'en' ? 'Select Segregated Materials Present' : 'উপকরণ নির্বাচন করুন'}
              </label>
              <span className="text-xs text-slate-500">
                {selectedMaterials.length} category selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(MATERIAL_TAXONOMY).map((mat) => {
                const isSelected = selectedMaterials.some((m) => m.category === mat.id);
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => toggleMaterial(mat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">{mat.name.split(' ')[0]}</span>
                      {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {lang === 'en' ? mat.name : mat.nameBn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commercial Model Disclosure (PRD § 6.2, C-15) */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700" />
                {lang === 'en' ? 'Commercial Terms & Reward Rules' : 'বাণিজ্যিক শর্ত ও রিওয়ার্ড নিয়মাবলী'}
              </span>
              <span className="font-mono font-bold text-slate-900">
                Service Fee: {serviceFee === 0 ? '৳0 (Pilot Sponsored)' : `৳${serviceFee}`}
              </span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              • <strong>Truth in Rewards:</strong> Points estimated at ~150 pts will appear in <em>Pending Hold</em> immediately upon booking and unlock to <em>Available</em> once verified by the aggregation hub certified floor scale (Evidence Level E2).
            </p>
            <p className="text-emerald-900 leading-relaxed">
              • Material cash payout (৳15-32/kg depending on fraction) is disbursed separately from points.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isZoneActive}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold text-white transition-colors shadow-xs ${
              isZoneActive
                ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            {lang === 'en' ? 'Confirm Booking' : 'বুকিং নিশ্চিত করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
