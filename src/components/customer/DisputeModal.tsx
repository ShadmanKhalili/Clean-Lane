import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertCircle } from 'lucide-react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, bookingId }) => {
  const { lang, bookings, fileComplaint } = useApp();

  const [selectedBooking, setSelectedBooking] = useState(bookingId || bookings[0]?.id || '');
  const [complaintType, setComplaintType] = useState<
    'MISSED_COLLECTION' | 'WEIGHT_DISCREPANCY' | 'POINTS_CALCULATION' | 'BEHAVIOR' | 'OTHER'
  >('WEIGHT_DISCREPANCY');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    fileComplaint(complaintType, description, selectedBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en' ? 'Challenge Service or Weight Record' : 'অভিযোগ বা ওজন যাচাই আবেদন'}
              </h3>
              <p className="text-xs text-slate-500">
                PRD § C-25: Direct complaint & audit review resolution
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {lang === 'en' ? 'Related Booking / Transaction' : 'সম্পর্কিত বুকিং'}
            </label>
            <select
              value={selectedBooking}
              onChange={(e) => setSelectedBooking(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
            >
              <option value="">No specific booking</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} · {b.serviceType} ({b.scheduledDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {lang === 'en' ? 'Reason for Challenge' : 'অভিযোগের ধরন'}
            </label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
            >
              <option value="WEIGHT_DISCREPANCY">Weight Discrepancy (Field vs Hub Scale)</option>
              <option value="MISSED_COLLECTION">Missed Collection (Collector did not arrive)</option>
              <option value="POINTS_CALCULATION">Points Calculation / Pending Delay</option>
              <option value="BEHAVIOR">Collector / Service Professionalism</option>
              <option value="OTHER">Other Operational Challenge</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {lang === 'en' ? 'Details of the discrepancy / issue' : 'বিস্তারিত বিবরণ'}
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. My home scale showed 15 kg of clean PET bottles, but the collector recorded 11 kg. Please review certified hub scale measurement."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-slate-600 leading-relaxed">
            Every challenge creates an immutable audit event for the clean lane operations coordinator. You will receive an outcome update within 24 operational hours.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
