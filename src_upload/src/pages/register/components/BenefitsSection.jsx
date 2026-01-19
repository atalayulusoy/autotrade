import React from 'react';
import Icon from '../../../components/AppIcon';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: 'Zap',
      title: 'Otomatik İşlem',
      description: 'TradingView sinyalleri ile 7/24 otomatik kripto para işlemleri',
      color: 'text-secondary'
    },
    {
      icon: 'TrendingUp',
      title: 'Çoklu Borsa Desteği',
      description: 'OKX, Binance, Bybit, Gate.io ve BTCTURK entegrasyonu',
      color: 'text-primary'
    },
    {
      icon: 'BarChart3',
      title: 'Gelişmiş Analiz',
      description: 'Gerçek zamanlı piyasa analizi ve performans takibi',
      color: 'text-success'
    },
    {
      icon: 'Shield',
      title: 'Risk Yönetimi',
      description: 'Akıllı pozisyon boyutlandırma ve zarar durdurma araçları',
      color: 'text-warning'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Kripto İşlem Botunuzla Başlayın
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Profesyonel otomatik işlem araçlarıyla kripto para piyasasında avantaj elde edin
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {benefits?.map((benefit, index) => (
          <div
            key={index}
            className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-250 hover:elevation-2"
          >
            <div className="flex items-start gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-muted flex-shrink-0 ${benefit?.color}`}>
                <Icon name={benefit?.icon} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit?.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit?.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary flex-shrink-0">
            <Icon name="Sparkles" size={24} color="#ffffff" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ücretsiz Deneme Süresi
            </h3>
            <p className="text-sm text-muted-foreground">
              İlk 1 gün boyunca tüm premium özelliklere ücretsiz erişim. 
              Kredi kartı bilgisi gerekmez, istediğiniz zaman iptal edebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsSection;