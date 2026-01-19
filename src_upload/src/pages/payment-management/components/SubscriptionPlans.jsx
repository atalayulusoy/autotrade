import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubscriptionPlans = ({ plans, currentPlan }) => {
  const getPlanIcon = (planType) => {
    switch(planType) {
      case 'free_trial': return 'Gift';
      case 'basic': return 'Package';
      case 'premium': return 'Star';
      case 'enterprise': return 'Crown';
      default: return 'Package';
    }
  };

  const getPlanColor = (planType) => {
    switch(planType) {
      case 'free_trial': return 'from-blue-600 to-cyan-600';
      case 'basic': return 'from-green-600 to-emerald-600';
      case 'premium': return 'from-purple-600 to-pink-600';
      case 'enterprise': return 'from-orange-600 to-red-600';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  // Define new pricing structure
  const pricingOverrides = {
    'basic': { price: 7500, name: 'Temel Paket', features: ['Aylık 300 işlem hakkı', 'Auto işlemlerde 2 coin açabilme', '7/24 Destek', 'Temel analiz araçları'] },
    'premium': { price: 12500, name: 'Premium Paket', features: ['Aylık 600 işlem hakkı', 'Auto işlemlerde 3 coin açabilme', 'Öncelikli destek', 'Gelişmiş analiz araçları', 'Özel stratejiler'] },
    'enterprise': { price: 20000, name: 'Elit Paket', features: ['Sınırsız işlem hakkı', 'Auto işlemlerde 5 coin açabilme', 'VIP destek', 'Tüm premium özellikler', 'Özel danışmanlık'] }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Abonelik Paketleri</h2>
        <p className="text-slate-400 text-sm">Size uygun paketi seçin ve otomatik trading'e başlayın</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans?.map((plan) => {
          const override = pricingOverrides?.[plan?.plan_type];
          const displayPrice = override?.price || parseFloat(plan?.price_monthly);
          const displayName = override?.name || plan?.plan_name;
          const displayFeatures = override?.features || plan?.features?.features || [];
          const isCurrentPlan = currentPlan === plan?.plan_type;

          return (
            <div
              key={plan?.id}
              className={`relative bg-slate-700/50 rounded-xl p-6 border ${
                isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-600'
              } transition-all hover:border-blue-500/50`}
            >
              {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Aktif Paket
                  </span>
                </div>
              )}

              <div className={`bg-gradient-to-br ${getPlanColor(plan?.plan_type)} p-3 rounded-lg inline-block mb-4`}>
                <Icon name={getPlanIcon(plan?.plan_type)} size={24} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{displayName}</h3>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {displayPrice?.toFixed(0)}
                  </span>
                  <span className="text-slate-400 text-sm">TL/ay</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {displayFeatures?.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                    <Icon name="Check" size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrentPlan ? 'outline' : 'default'}
                fullWidth
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Mevcut Paket' : 'Paketi Seç'}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">Paket Yükseltme</p>
            <p className="text-blue-200 text-xs">
              Paket değiştirmek için "Ödeme Yap" sekmesinden ödeme yapabilir veya admin ile iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;