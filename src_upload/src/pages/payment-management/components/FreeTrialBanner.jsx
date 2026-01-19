import React from 'react';
import Icon from '../../../components/AppIcon';

const FreeTrialBanner = ({ trialEndDate }) => {
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(trialEndDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Süresi doldu';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} gün ${hours} saat`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-600 p-3 rounded-lg">
          <Icon name="Gift" size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">🎉 7 Günlük Ücretsiz Deneme Aktif!</h3>
          <p className="text-blue-200 text-sm mb-3">
            Gerçek para ile 7 günlük ücretsiz deneme süreniz devam ediyor. Tüm özellikleri tam erişimle deneyebilirsiniz.
          </p>
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={16} className="text-blue-300" />
            <span className="text-blue-300 text-sm font-medium">
              Kalan süre: {getTimeRemaining()}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-blue-700/50">
        <div className="flex items-start gap-2">
          <Icon name="ShieldCheck" size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-200 text-xs">
            💡 Deneme süresi admin onayı ile aktif edilmiştir. Süre bitiminde paket seçimi yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialBanner;