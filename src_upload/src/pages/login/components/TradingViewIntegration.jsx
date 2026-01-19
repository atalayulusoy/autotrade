import React from 'react';
import Icon from '../../../components/AppIcon';

const TradingViewIntegration = () => {
  const features = [
    {
      icon: 'Zap',
      title: 'Otomatik Sinyal Alımı',
      description: 'TradingView\'dan gelen sinyaller anında işleme alınır',
      status: 'active'
    },
    {
      icon: 'Target',
      title: 'Hassas Emir İletimi',
      description: 'Belirlenen fiyat seviyelerinde otomatik alım-satım',
      status: 'active'
    },
    {
      icon: 'Shield',
      title: 'Risk Yönetimi',
      description: 'Stop-loss ve take-profit otomasyonu',
      status: 'active'
    },
    {
      icon: 'BarChart3',
      title: 'Çoklu Zaman Dilimi',
      description: '1m, 5m, 15m, 1h, 4h, 1D analiz desteği',
      status: 'active'
    }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/5 border border-primary/20">
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg bg-primary">
          <Icon name="Activity" size={28} color="#ffffff" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground">
            TradingView Entegrasyonu
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Profesyonel sinyal takibi ve otomatik işlem
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        {features?.map((feature, index) => (
          <div
            key={index}
            className="p-3 md:p-4 rounded-lg bg-card/80 border border-border hover:border-primary/30 transition-all duration-250"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex-shrink-0">
                <Icon name={feature?.icon} size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <h3 className="text-sm md:text-base font-semibold text-foreground">
                    {feature?.title}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs text-success">Aktif</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {feature?.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-start gap-2 md:gap-3">
          <Icon name="CheckCircle2" size={18} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs md:text-sm font-medium text-success mb-1">
              Sistem Hazır
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              TradingView webhook bağlantısı aktif. Giriş yaptıktan sonra otomatik işlemler başlayacaktır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewIntegration;