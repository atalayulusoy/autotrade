import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityFeatures = () => {
  const features = [
    {
      icon: 'Shield',
      title: '256-bit SSL Şifreleme',
      description: 'Verileriniz bankacılık düzeyinde güvenlik ile korunur'
    },
    {
      icon: 'Lock',
      title: 'İki Faktörlü Doğrulama',
      description: 'Hesabınız için ekstra güvenlik katmanı'
    },
    {
      icon: 'Server',
      title: 'Güvenli Sunucular',
      description: 'Türkiye\'de yerli ve milli altyapı'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
      {features?.map((feature, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-4 md:p-6 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-250"
        >
          <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg bg-primary/10 mb-3 md:mb-4">
            <Icon name={feature?.icon} size={24} className="text-primary" />
          </div>
          <h3 className="text-sm md:text-base lg:text-lg font-semibold text-foreground mb-1 md:mb-2">
            {feature?.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {feature?.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SecurityFeatures;