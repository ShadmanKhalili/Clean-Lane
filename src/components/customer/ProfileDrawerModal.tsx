import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  X,
  User,
  MapPin,
  Building,
  Plus,
  Globe,
  HelpCircle,
  LogOut,
  Check,
  ShieldCheck,
  Phone,
  ChevronRight,
  Bell
} from 'lucide-react';

interface ProfileDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrgDashboard?: () => void;
  onOpenHelp?: () => void;
  onOpenOnboarding?: () => void;
}

export const ProfileDrawerModal: React.FC<ProfileDrawerModalProps> = ({
  isOpen,
  onClose,
  onOpenOrgDashboard,
  onOpenHelp,
  onOpenOnboarding
}) => {
  const {
    role,
    setRole,
    lang,
    setLang,
    savedLocations,
    selectedLocationId,
    setSelectedLocationId,
    addSavedLocation
  } = useApp();

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newZone, setNewZone] = useState('ZONE-GUL-02');

  if (!isOpen) return null;

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    addSavedLocation({
      label: newLabel.trim() || 'Secondary Site',
      address: newAddress.trim(),
      zoneId: newZone,
      isDefault: false,
      status: 'available'
    });
    setIsAddingAddress(false);
    setNewLabel('');
    setNewAddress('');
  };

  const isOrgUser = role === 'customer_apartment' || role === 'customer_business';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col border-l border-[#EDE4D8] overflow-hidden text-[#202B38]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EDE4D8] flex items-center justify-between bg-[#FFF9F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25345C] text-white flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#202B38] text-base">Shadman Khalili</h3>
              <p className="text-xs text-[#53616D] font-mono">+880 1712 345678</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#53616D] hover:text-[#202B38] hover:bg-[#EDE4D8]/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Organisation Portal Link if Org Account */}
          {isOrgUser && (
            <div className="p-4 bg-[#EDF1F9] rounded-2xl border border-[#25345C]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#25345C] text-sm">
                  {role === 'customer_apartment' ? 'Apartment Management' : 'Business Site Portal'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#25345C] text-white font-mono text-[10px]">
                  B01–B04
                </span>
              </div>
              <p className="text-[#53616D]">
                Manage recurring pickup schedule, multi-bin bays, and period waste certificates.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrgDashboard && onOpenOrgDashboard();
                }}
                className="w-full mt-1 min-h-[44px] px-4 py-2.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Building className="w-4 h-4" />
                <span>Open Organisation Dashboard</span>
              </button>
            </div>
          )}

          {/* Saved Locations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#202B38] text-sm uppercase tracking-wider font-mono">
                My Addresses ({savedLocations.length})
              </span>
              <button
                type="button"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                className="text-xs font-bold text-[#25345C] hover:underline cursor-pointer"
              >
                {isAddingAddress ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {isAddingAddress && (
              <form
                onSubmit={handleSaveNewAddress}
                className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#EDE4D8] space-y-3 animate-fade-in"
              >
                <div>
                  <label className="block text-[#53616D] font-medium mb-1">Location Label</label>
                  <input
                    type="text"
                    required
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Office / Parents' Home"
                    className="w-full bg-white border border-[#EDE4D8] rounded-xl px-3 py-2 text-[#202B38]"
                  />
                </div>
                <div>
                  <label className="block text-[#53616D] font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="e.g. House 12, Road 4, Banani"
                    className="w-full bg-white border border-[#EDE4D8] rounded-xl px-3 py-2 text-[#202B38]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full min-h-[44px] bg-[#25345C] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="space-y-2">
              {savedLocations.map((loc) => {
                const isSelected = selectedLocationId === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedLocationId(loc.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between min-h-[48px] ${
                      isSelected
                        ? 'border-[#25345C] bg-[#FFF9F0] ring-2 ring-[#25345C]/15'
                        : 'border-[#EDE4D8] bg-white hover:bg-[#FFF9F0]/60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#25345C]" />
                        <span className="font-bold text-[#202B38] text-xs">{loc.label}</span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-[#25345C] text-white font-mono text-[9px]">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[#53616D] text-[11px] pl-5">{loc.address}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#25345C] shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences & Language */}
          <div className="space-y-3 pt-3 border-t border-[#EDE4D8]">
            <span className="font-bold text-[#202B38] text-sm uppercase tracking-wider font-mono block">
              Preferences
            </span>

            {/* Language Switch */}
            <div className="p-3.5 rounded-2xl border border-[#EDE4D8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#53616D]" />
                <span className="font-semibold text-[#202B38]">App Language</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLang('bn')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    lang === 'bn' ? 'bg-[#25345C] text-white' : 'bg-[#FFF9F0] text-[#53616D]'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    lang === 'en' ? 'bg-[#25345C] text-white' : 'bg-[#FFF9F0] text-[#53616D]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Help & Support */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHelp && onOpenHelp();
              }}
              className="w-full p-3.5 rounded-2xl border border-[#EDE4D8] flex items-center justify-between text-left hover:bg-[#FFF9F0] cursor-pointer min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#53616D]" />
                <span className="font-semibold text-[#202B38]">Need Help / Support Cases</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8896A4]" />
            </button>

            {/* R01 Welcome & Onboarding Test */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOnboarding && onOpenOnboarding();
              }}
              className="w-full p-3.5 rounded-2xl border border-[#EDE4D8] flex items-center justify-between text-left hover:bg-[#FFF9F0] cursor-pointer min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#12613F]" />
                <span className="font-semibold text-[#202B38]">R01 Area & Service Check</span>
              </div>
              <span className="text-[10px] font-mono text-[#12613F] bg-[#C9F1DC] px-2 py-0.5 rounded-full font-bold">
                R01
              </span>
            </button>
          </div>

          {/* Account Role Switching for Demo */}
          <div className="space-y-2 pt-3 border-t border-[#EDE4D8]">
            <span className="text-[10px] font-mono uppercase text-[#8896A4] block">
              Switch Account Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'customer_household', label: 'Household' },
                { id: 'customer_apartment', label: 'Apartment' },
                { id: 'customer_business', label: 'Business' },
                { id: 'collector', label: 'Collector App' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRole(r.id as UserRole);
                    onClose();
                  }}
                  className={`p-2 rounded-xl text-center border font-bold text-xs cursor-pointer ${
                    role === r.id
                      ? 'bg-[#25345C] text-white border-[#25345C]'
                      : 'bg-[#FFF9F0] text-[#53616D] border-[#EDE4D8] hover:bg-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
