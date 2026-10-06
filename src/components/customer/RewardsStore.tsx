import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coins, CheckCircle, AlertTriangle, Gift, Tag, ExternalLink, ArrowLeft } from 'lucide-react';

interface RewardsStoreProps {
  onBackToPortal: () => void;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({ onBackToPortal }) => {
  const {
    lang,
    rewards,
    redemptions,
    customerAvailablePoints,
    customerPendingPoints,
    redeemReward
  } = useApp();

  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredRewards =
    activeCategory === 'all'
      ? rewards
      : rewards.filter((r) => r.category === activeCategory);

  const handleRedeem = (rewardId: string) => {
    const res = redeemReward(rewardId);
    if (res.success && res.couponCode) {
      setSuccessCode(res.couponCode);
      setSelectedRewardId(rewardId);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to My Services' : 'পূর্ববর্তী পাতায় ফিরুন'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Coins className="w-4 h-4 text-emerald-700" />
            <span className="text-slate-500 font-medium">Available:</span>
            <span className="font-bold font-mono text-slate-900">{customerAvailablePoints} pts</span>
          </div>
          {customerPendingPoints > 0 && (
            <div className="text-[11px] text-amber-700 font-medium">
              +{customerPendingPoints} pending hub scale confirmation
            </div>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <Gift className="w-4 h-4" />
          <span>Circular Economy Partner Catalogue</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {lang === 'en' ? 'Redeem Circular Points' : 'বৃত্তাকার পয়েন্ট রিডিম করুন'}
        </h1>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          PRD § 10: Points reflect verified post-consumer recovery behavior. Fully funded by Clean Lane partner programmes and corporate circular funds. Points are distinct from cash material compensation.
        </p>

        {/* Categories */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {['all', 'groceries', 'artisan', 'utility', 'donation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRewards.map((reward) => {
          const canAfford = customerAvailablePoints >= reward.pointsCost;
          const isOutOfStock = reward.stockAvailable <= 0;

          return (
            <div
              key={reward.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wide">
                      {reward.partnerName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {lang === 'en' ? reward.title : reward.titleBn}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                      {reward.pointsCost}
                    </span>
                    <span className="text-xs text-slate-500 block font-mono">points</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {reward.description}
                </p>

                {/* Metadata items unboxed with separators (anti-slop discipline) */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Cash value: ৳{reward.cashEquivalentBdt}</span>
                  <span aria-hidden="true">·</span>
                  <span>Valid for {reward.validityDays} days</span>
                  <span aria-hidden="true">·</span>
                  <span>{reward.stockAvailable} in stock</span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Funder: <span className="text-slate-600 font-medium">{reward.funder}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="text-xs">
                  {!canAfford && (
                    <span className="text-amber-700 font-medium">
                      Need {reward.pointsCost - customerAvailablePoints} more available points
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="text-rose-600 font-medium">Temporarily out of stock</span>
                  )}
                </div>

                <button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!canAfford || isOutOfStock}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    canAfford && !isOutOfStock
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {lang === 'en' ? 'Redeem Voucher' : 'ভাউচার নিন'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redemption Success Modal */}
      {successCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Redemption Successful!</h3>
              <p className="text-xs text-slate-500">
                Your reward coupon has been issued and debited from the points ledger.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <span className="text-xs text-slate-400 block mb-1">Coupon / Fulfillment Code</span>
              <span className="text-lg font-mono font-bold text-emerald-800 select-all tracking-wider">
                {successCode}
              </span>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
              Present this code at checkout or partner outlet. If a partner fails to fulfill, PRD safeguard guarantees automatic restoration of your points.
            </div>

            <button
              onClick={() => {
                setSuccessCode(null);
                setSelectedRewardId(null);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Past Redemptions History */}
      {redemptions.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            {lang === 'en' ? 'My Redeemed Vouchers' : 'আমার রিডিম করা ভাউচার'}
          </h2>
          <div className="divide-y divide-slate-100">
            {redemptions.map((red) => (
              <div key={red.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{red.rewardTitle}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Code: <span className="font-bold text-slate-700">{red.couponCode}</span> · {red.timestamp.split('T')[0]}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-700 font-bold">-{red.pointsDeducted} pts</span>
                  <span className="block text-[11px] text-slate-500">{red.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
