import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Smartphone,
  MessageSquare,
  Sparkles,
  Clock,
  Trash2,
  Settings,
  Volume2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppNotification } from '../../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreparation: (notif: AppNotification) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenPreparation
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    notificationSettings,
    updateNotificationSettings,
    triggerManual24hReminderCheck,
    lang,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'reminders' | 'settings'>('all');
  const [selectedPreviewNotif, setSelectedPreviewNotif] = useState<AppNotification | null>(null);
  const [previewChannel, setPreviewChannel] = useState<'sms' | 'push'>('sms');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'reminders') {
      return (
        n.type === 'COLLECTION_REMINDER_24H' ||
        n.type === 'COLLECTION_REMINDER_2H' ||
        n.type === 'PREPARATION_ALERT'
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTestTrigger = () => {
    const count = triggerManual24hReminderCheck();
    if (count > 0) {
      showToast(
        lang === 'en'
          ? `Dispatched ${count} automated 24h collection reminder(s)!`
          : `${count}টি স্বয়ংক্রিয় ২৪ ঘণ্টা পূর্বে রিমাইন্ডার পাঠানো হয়েছে!`
      );
    } else {
      showToast(
        lang === 'en'
          ? 'All eligible upcoming bookings already have active 24h reminders.'
          : 'আসন্ন সব বুকিংয়ের জন্যই রিমাইন্ডার সক্রিয় রয়েছে।'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FFF9F0] border border-[#EDE4D8] rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-[#25345C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5BF55] text-[#202B38] flex items-center justify-center font-bold relative shadow-xs">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#25345C]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {lang === 'en' ? 'Notifications & Reminders' : 'বিজ্ঞপ্তি ও স্মারক'}
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[#C9F1DC] text-[#12613F] px-2 py-0.5 rounded-full">
                  Automated 24h Service
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {lang === 'en'
                  ? 'Scheduled pickup alerts, preparation guidance & SMS delivery'
                  : 'বর্জ্য সংগ্রহের অ্যালার্ট, প্রস্তুতি নির্দেশিকা ও এসএমএস'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab & Action Bar */}
        <div className="bg-[#FAF5EC] border-b border-[#EDE4D8] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#25345C] text-white shadow-xs'
                  : 'bg-white text-[#53616D] border border-[#EDE4D8] hover:bg-white/80'
              }`}
            >
              {lang === 'en' ? 'All Alerts' : 'সব নোটিফিকেশন'} ({notifications.length})
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reminders'
                  ? 'bg-[#25345C] text-white shadow-xs'
                  : 'bg-white text-[#53616D] border border-[#EDE4D8] hover:bg-white/80'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{lang === 'en' ? '24h Reminders' : '২৪ ঘণ্টার রিমাইন্ডার'}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-[#25345C] text-white shadow-xs'
                  : 'bg-white text-[#53616D] border border-[#EDE4D8] hover:bg-white/80'
              }`}
            >
              <Settings className="w-3 h-3" />
              <span>{lang === 'en' ? 'Channels' : 'চ্যানেল সেটিংস'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-[#25345C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Mark all read' : 'সব পঠিত হিসেবে চিহ্নিত করুন'}</span>
              </button>
            )}

            <button
              onClick={handleTestTrigger}
              className="px-2.5 py-1 bg-[#C9F1DC] hover:bg-[#b5ebd0] text-[#12613F] rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-[#12613F]/20"
              title="Manually test and fire automated 24h reminder scheduler"
            >
              <Sparkles className="w-3 h-3 text-[#12613F]" />
              <span>{lang === 'en' ? 'Run Auto-Scheduler' : 'অটো-শিডিউলার চালু'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#EDE4D8] rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#53616D]">
                  {lang === 'en'
                    ? 'Automated Reminder Preferences'
                    : 'স্বয়ংক্রিয় রিমাইন্ডার পছন্দসমূহ'}
                </h3>
                <p className="text-xs text-[#53616D]">
                  {lang === 'en'
                    ? 'Clean Lane automatically alerts you 24 hours prior to your scheduled collection window with tailored preparation steps.'
                    : 'আপনার বুকিংয়ের ২৪ ঘণ্টা আগে ক্লিন লেন স্বয়ংক্রিয়ভাবে বর্জ্য প্রস্তুত করার নির্দেশনা সহ রিমাইন্ডার পাঠায়।'}
                </p>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EC] border border-[#EDE4D8] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#202B38] block">
                        {lang === 'en'
                          ? '24-Hour Prior Reminder (Default)'
                          : '২৪ ঘণ্টা পূর্ববর্তী রিমাইন্ডার (ডিফল্ট)'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en'
                          ? 'Sends preparation checklist and window timing 1 day before'
                          : 'সংগ্রহের ১ দিন আগে প্রস্তুতির নিয়মাবলী ও সময়সূচি'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.reminder24h}
                      onChange={(e) =>
                        updateNotificationSettings({ reminder24h: e.target.checked })
                      }
                      className="w-4 h-4 text-[#25345C] rounded focus:ring-[#25345C]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EC] border border-[#EDE4D8] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#202B38] block">
                        {lang === 'en'
                          ? '2-Hour Doorstep Alert'
                          : '২ ঘণ্টা পূর্বে ডোরস্টেপ সতর্কতা'}
                      </span>
                      <span className="text-[11px] text-[#53616D]">
                        {lang === 'en'
                          ? 'Prompt to place bags at doorstep before truck arrival'
                          : 'গাড়ি আসার আগে ব্যাগ দরজায় রাখার তাগিদ'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.reminder2h}
                      onChange={(e) =>
                        updateNotificationSettings({ reminder2h: e.target.checked })
                      }
                      className="w-4 h-4 text-[#25345C] rounded focus:ring-[#25345C]"
                    />
                  </label>
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="p-4 bg-white border border-[#EDE4D8] rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#53616D]">
                  {lang === 'en' ? 'Delivery Channels' : 'যোগাযোগের মাধ্যম'}
                </h3>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EC] border border-[#EDE4D8] cursor-pointer">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      <div>
                        <span className="text-xs font-bold text-[#202B38] block">
                          SMS Text Messages
                        </span>
                        <span className="text-[11px] text-[#53616D]">
                          Bangla / English text to registered mobile
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsEnabled}
                      onChange={(e) =>
                        updateNotificationSettings({ smsEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-[#25345C] rounded focus:ring-[#25345C]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EC] border border-[#EDE4D8] cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-indigo-700" />
                      <div>
                        <span className="text-xs font-bold text-[#202B38] block">
                          Mobile App Push Notifications
                        </span>
                        <span className="text-[11px] text-[#53616D]">
                          Interactive notifications with one-tap preparation view
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushEnabled}
                      onChange={(e) =>
                        updateNotificationSettings({ pushEnabled: e.target.checked })
                      }
                      className="w-4 h-4 text-[#25345C] rounded focus:ring-[#25345C]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5EC] border border-[#EDE4D8] cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-[#F5BF55]" />
                      <div>
                        <span className="text-xs font-bold text-[#202B38] block">
                          Spoken Audio Guidance
                        </span>
                        <span className="text-[11px] text-[#53616D]">
                          Read aloud preparation instructions in Bangla / English
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.audioReadout}
                      onChange={(e) =>
                        updateNotificationSettings({ audioReadout: e.target.checked })
                      }
                      className="w-4 h-4 text-[#25345C] rounded focus:ring-[#25345C]"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS LIST */}
          {activeTab !== 'settings' && (
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#EDE4D8] rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF5EC] text-[#53616D] flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#202B38]">
                    {lang === 'en' ? 'No notifications yet' : 'কোনো বিজ্ঞপ্তি নেই'}
                  </h4>
                  <p className="text-xs text-[#53616D] max-w-sm mx-auto">
                    {lang === 'en'
                      ? 'When you book a collection, automated 24-hour reminders and preparation guides will appear here.'
                      : 'পিকআপ বুক করার পর স্বয়ংক্রিয় রিমাইন্ডার এবং নির্দেশিকা এখানে প্রদর্শিত হবে।'}
                  </p>
                  <button
                    onClick={handleTestTrigger}
                    className="px-4 py-2 bg-[#25345C] text-white rounded-xl text-xs font-bold hover:bg-[#1B2644] transition-colors cursor-pointer"
                  >
                    {lang === 'en'
                      ? 'Trigger 24h Reminder Test'
                      : 'টেস্ট রিমাইন্ডার তৈরি করুন'}
                  </button>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const is24h = notif.type === 'COLLECTION_REMINDER_24H';

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 shadow-xs ${
                        notif.read
                          ? 'bg-white border-[#EDE4D8]'
                          : is24h
                          ? 'bg-[#FEF8EB] border-[#F5BF55] ring-1 ring-[#F5BF55]/50'
                          : 'bg-[#EDF1F9] border-[#25345C]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              is24h
                                ? 'bg-[#F5BF55] text-[#202B38]'
                                : 'bg-[#25345C] text-white'
                            }`}
                          >
                            {is24h ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <FileCheck2 className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-[#202B38]">
                                {lang === 'en' ? notif.title : notif.titleBn}
                              </h4>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-[#25345C] animate-pulse" />
                              )}
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                  notif.channel === 'SMS'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {notif.channel}
                              </span>
                            </div>

                            <p className="text-xs text-[#53616D] leading-relaxed">
                              {lang === 'en' ? notif.message : notif.messageBn}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#53616D]">
                              <span className="font-semibold text-[#202B38]">
                                📅 {notif.scheduledCollectionDate} ({notif.scheduledTimeWindow})
                              </span>
                              <span>·</span>
                              <span>📍 {notif.address.split(',')[0]}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action Bar for this notification */}
                      <div className="pt-2 border-t border-[#EDE4D8]/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* View Preparation Guidance */}
                          <button
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              onOpenPreparation(notif);
                            }}
                            className="px-3 py-1.5 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-[#C9F1DC]" />
                            <span>
                              {lang === 'en'
                                ? 'View Preparation Steps'
                                : 'প্রস্তুতি নির্দেশিকা দেখুন'}
                            </span>
                          </button>

                          {/* Preview SMS / Push simulator */}
                          <button
                            onClick={() => setSelectedPreviewNotif(notif)}
                            className="px-3 py-1.5 bg-white hover:bg-[#FAF5EC] border border-[#EDE4D8] text-[#25345C] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'en' ? 'Simulate SMS/Push' : 'এসএমএস প্রিভিউ'}
                            </span>
                          </button>
                        </div>

                        {!notif.read && (
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="text-[11px] font-semibold text-[#53616D] hover:text-[#25345C] cursor-pointer"
                          >
                            {lang === 'en' ? 'Mark read' : 'পঠিত'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SIMULATED SMS / PHONE PREVIEW DRAWER */}
          {selectedPreviewNotif && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 border border-slate-800 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Live Mobile Delivery Simulator
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewChannel('sms')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                      previewChannel === 'sms'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    SMS View
                  </button>
                  <button
                    onClick={() => setPreviewChannel('push')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                      previewChannel === 'push'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Push Banner
                  </button>
                  <button
                    onClick={() => setSelectedPreviewNotif(null)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SMS Simulator UI */}
              {previewChannel === 'sms' && (
                <div className="bg-slate-950 rounded-xl p-3 space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Sender: CLEAN-LANE-BD</span>
                    <span>To: {selectedPreviewNotif.customerPhone || '+880 1711-XXXXXX'}</span>
                  </div>
                  <div className="p-3 bg-emerald-950/70 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 font-mono leading-relaxed">
                    {selectedPreviewNotif.smsPreview}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Delivered via Grameenphone / Robi SMS Gateway</span>
                    <span>Status: DELIVERED (0.4s)</span>
                  </div>
                </div>
              )}

              {/* Push Simulator UI */}
              {previewChannel === 'push' && (
                <div className="bg-slate-950 rounded-xl p-3 space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Lock Screen Banner Preview</span>
                    <span>Now</span>
                  </div>
                  <div className="p-3 bg-slate-800/90 rounded-xl flex items-start gap-3 border border-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-[#25345C] text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-[#F5BF55]" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Clean Lane</span>
                        <span className="text-[10px] text-slate-400">1m ago</span>
                      </div>
                      <p className="text-xs text-slate-200">
                        {selectedPreviewNotif.pushPreview}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF5EC] border-t border-[#EDE4D8] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#53616D]">
            <ShieldCheck className="w-4 h-4 text-[#12613F]" />
            <span>
              {lang === 'en'
                ? 'Automated 24h reminders reduce contamination by 42%'
                : 'স্বয়ংক্রিয় রিমাইন্ডার বর্জ্য মিশ্রণ ৪২% হ্রাস করে'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#25345C] hover:bg-[#1B2644] text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
