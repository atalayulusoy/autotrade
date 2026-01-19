import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Hakkımızda - Atalay Ulusoy Kripto İşlem Botu</title>
        <meta 
          name="description" 
          content="Atalay Ulusoy otomatik kripto para işlem platformu hakkında bilgi edinin. Misyonumuz, vizyonumuz ve güvenilir ticaret çözümlerimiz." 
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <Icon name="ArrowLeft" size={20} />
              <span>Geri Dön</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary">
                <Icon name="Bitcoin" size={32} color="#ffffff" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Hakkımızda
                </h1>
                <p className="text-muted-foreground mt-1">
                  Atalay Ulusoy Kripto İşlem Platformu
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Mission Section */}
            <div className="p-6 md:p-8 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Icon name="Target" size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Misyonumuz</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Türk yatırımcılara güvenilir, otomatik ve profesyonel kripto para işlem çözümleri sunmak. 
                TradingView entegrasyonu ile 7/24 çalışan botlarımız sayesinde, kullanıcılarımızın piyasa 
                fırsatlarını kaçırmamasını ve duygusal kararlar almadan sistematik ticaret yapmalarını sağlıyoruz.
              </p>
            </div>

            {/* Vision Section */}
            <div className="p-6 md:p-8 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Icon name="Eye" size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Vizyonumuz</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Türkiye'nin en güvenilir ve kullanıcı dostu otomatik kripto işlem platformu olmak. 
                Gelişmiş risk yönetimi, yapay zeka destekli analiz ve çoklu borsa entegrasyonu ile 
                yatırımcılarımıza kurumsal seviyede ticaret deneyimi sunmayı hedefliyoruz.
              </p>
            </div>

            {/* Founder Section */}
            <div className="p-6 md:p-8 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Kurucumuz</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">Atalay Ulusoy</strong>, 2017 yılından beri kripto para 
                piyasalarında aktif olarak işlem yapan deneyimli bir trader'dır. Yazılım geliştirme ve finansal 
                piyasalar konusundaki uzmanlığını birleştirerek, Türk yatırımcıların ihtiyaçlarına özel bu 
                platformu geliştirmiştir.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Platformumuz, yıllarca süren piyasa deneyimi ve binlerce işlem analizinin sonucunda ortaya 
                çıkan stratejileri otomatikleştirerek, kullanıcılarımıza profesyonel seviyede ticaret imkanı sunmaktadır.
              </p>
            </div>

            {/* Technology Section */}
            <div className="p-6 md:p-8 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Icon name="Cpu" size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Teknolojimiz</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">TradingView Entegrasyonu</h3>
                    <p className="text-sm text-muted-foreground">
                      Dünya çapında kullanılan TradingView platformu ile webhook entegrasyonu sayesinde 
                      anlık sinyal alımı ve otomatik işlem gerçekleştirme.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Çoklu Borsa Desteği</h3>
                    <p className="text-sm text-muted-foreground">
                      Binance, Bybit, OKX ve diğer önde gelen borsalar ile API entegrasyonu. 
                      Tüm işlemlerinizi tek platformdan yönetin.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Gelişmiş Risk Yönetimi</h3>
                    <p className="text-sm text-muted-foreground">
                      Trailing stop loss, günlük zarar limitleri, pozisyon boyutlandırma ve acil durdurma 
                      özellikleri ile sermayenizi koruyun.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Check" size={20} className="text-success mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Gerçek Zamanlı Bildirimler</h3>
                    <p className="text-sm text-muted-foreground">
                      Telegram entegrasyonu ile anlık işlem bildirimleri, risk uyarıları ve performans raporları.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="p-6 md:p-8 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  <Icon name="Shield" size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Güvenlik ve Uyumluluk</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <Icon name="Lock" size={16} className="mt-1 text-success" />
                  <span>API anahtarlarınız şifreli olarak saklanır ve asla üçüncü taraflarla paylaşılmaz.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="Lock" size={16} className="mt-1 text-success" />
                  <span>Tüm işlemler SSL/TLS şifrelemesi ile güvenli kanallardan gerçekleştirilir.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="Lock" size={16} className="mt-1 text-success" />
                  <span>İki faktörlü kimlik doğrulama (2FA) desteği ile hesap güvenliği.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="Lock" size={16} className="mt-1 text-success" />
                  <span>Fonlarınız kendi borsa hesabınızda kalır, biz sadece işlem sinyali göndeririz.</span>
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-card border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">7/24</div>
                <p className="text-sm text-muted-foreground">Kesintisiz Hizmet</p>
              </div>
              <div className="p-6 rounded-lg bg-card border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">5+</div>
                <p className="text-sm text-muted-foreground">Desteklenen Borsa</p>
              </div>
              <div className="p-6 rounded-lg bg-card border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime Garantisi</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="p-6 md:p-8 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Otomatik İşlem Botunuzu Kurmaya Hazır Mısınız?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Hemen ücretsiz hesap oluşturun ve 7 gün deneme sürenizden yararlanın.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="default"
                    size="lg"
                    iconName="UserPlus"
                    iconPosition="left"
                    onClick={() => navigate('/register')}
                  >
                    Ücretsiz Kayıt Ol
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    iconName="MessageCircle"
                    iconPosition="left"
                    onClick={() => navigate('/support-center')}
                  >
                    Destek Al
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button onClick={() => navigate('/about-us')} className="hover:text-foreground transition-colors">
                  Hakkımızda
                </button>
                <button onClick={() => navigate('/support-center')} className="hover:text-foreground transition-colors">
                  Destek
                </button>
                <button onClick={() => navigate('/faq')} className="hover:text-foreground transition-colors">
                  SSS
                </button>
                <button onClick={() => navigate('/contact')} className="hover:text-foreground transition-colors">
                  İletişim
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date()?.getFullYear()} Atalay Ulusoy. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;