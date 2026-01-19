import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityFeatures = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'Güvenli Şifreleme',
      description: 'Verileriniz 256-bit SSL şifreleme ile korunur'
    },
    {
      icon: 'Lock',
      title: 'İki Faktörlü Doğrulama',
      description: 'Hesabınız için ekstra güvenlik katmanı'
    },
    {
      icon: 'Eye',
      title: 'Gizlilik Koruması',
      description: 'Kişisel bilgileriniz asla paylaşılmaz'
    },
    {
      icon: 'CheckCircle',
      title: 'BTCTURK Uyumlu',
      description: 'Türkiye finansal düzenlemelerine tam uyum'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Icon name="ShieldCheck" size={24} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Güvenlik Özellikleri</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityFeatures?.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-250"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
              <Icon name={feature?.icon} size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-1">
                {feature?.title}
              </h4>
              <p className="caption text-muted-foreground">
                {feature?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 rounded-lg bg-muted border border-border">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-secondary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="caption text-foreground">
              Hesabınız oluşturulduktan sonra, e-posta adresinize bir doğrulama bağlantısı gönderilecektir. 
              İşlem yapmaya başlamadan önce e-posta adresinizi doğrulamanız gerekmektedir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityFeatures;