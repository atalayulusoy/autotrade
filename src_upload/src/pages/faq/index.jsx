import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      category: 'Genel Sorular',
      icon: 'HelpCircle',
      questions: [
        {
          question: 'Atalay Ulusoy Trading Bot nedir?',
          answer: 'Atalay Ulusoy Trading Bot, TradingView sinyallerine göre otomatik olarak kripto para alım-satım işlemleri yapan profesyonel bir platformdur. 7/24 çalışan botumuz, belirlediğiniz stratejilere göre otomatik işlem yapar ve duygusal kararları ortadan kaldırarak sistematik ticaret yapmanızı sağlar.'
        },
        {
          question: 'Sistem nasıl çalışır?',
          answer: 'Sistem 3 adımda çalışır: 1) TradingView\'dan webhook ile alım/satım sinyali gelir, 2) Botumuz sinyali alır ve risk yönetimi kurallarınızı kontrol eder, 3) Onaylanmış sinyaller otomatik olarak bağlı olduğunuz borsada işleme dönüştürülür. Tüm süreç tamamen otomatiktir ve Telegram üzerinden anlık bildirim alırsınız.'
        },
        {
          question: 'Gerçek para ile işlem yapabilir miyim?',
          answer: 'Evet! Platformumuzda hem TEST (demo) hem de REAL (gerçek) mod bulunmaktadır. TEST modunda sanal bakiye ile sistemi risk almadan deneyebilirsiniz. REAL moda geçtiğinizde, kendi borsa hesabınızdaki gerçek bakiyeniz ile işlem yapılır. Mod değiştirme butonu trading dashboard\'da bulunur.'
        },
        {
          question: 'Fonlarım güvende mi?',
          answer: 'Evet, tamamen güvende! Fonlarınız kendi borsa hesabınızda kalır, biz asla fonlarınıza doğrudan erişemeyiz. Sadece "trade" (işlem yapma) yetkisi olan API key kullanırsınız, "withdrawal" (para çekme) yetkisi vermezsiniz. Böylece botumuz sadece alım-satım yapabilir, para çekemez.'
        }
      ]
    },
    {
      category: 'Hesap ve Kayıt',
      icon: 'User',
      questions: [
        {
          question: 'Nasıl kayıt olabilirim?',
          answer: 'Kayıt olmak çok kolay: 1) Ana sayfada "Kayıt Ol" butonuna tıklayın, 2) Ad, soyad, e-posta ve şifre bilgilerinizi girin, 3) Kullanım koşullarını ve gizlilik politikasını onaylayın, 4) E-posta adresinize gelen doğrulama linkine tıklayın. Kayıt sonrası 7 gün ücretsiz deneme süreniz başlar.'
        },
        {
          question: 'API anahtarlarımı nerede eklerim?',
          answer: 'Kayıt olduktan sonra Trading Dashboard\'a giriş yaptığınızda, sağ üst köşedeki "Ayarlar" veya "Borsa Bağlantıları" bölümünden API anahtarlarınızı ekleyebilirsiniz. Binance, Bybit, OKX gibi desteklenen borsalardan birini seçin, API Key ve Secret Key\'inizi girin. API oluştururken mutlaka "trade" yetkisi verin, "withdrawal" yetkisi vermeyin.'
        },
        {
          question: 'Şifremi unuttum, ne yapmalıyım?',
          answer: 'Giriş sayfasında "Şifremi Unuttum" linkine tıklayın. Kayıtlı e-posta adresinizi girin, size şifre sıfırlama linki gönderilecektir. Link 1 saat geçerlidir. E-posta gelmezse spam/gereksiz klasörünü kontrol edin.'
        }
      ]
    },
    {
      category: 'Bot Yapılandırması',
      icon: 'Bot',
      questions: [
        {
          question: 'Botu nasıl başlatırım?',
          answer: 'Bot başlatma adımları: 1) Borsa API anahtarlarınızı ekleyin, 2) Risk yönetimi ayarlarını yapın (pozisyon boyutu, stop loss, leverage), 3) TradingView webhook URL\'sini kopyalayıp TradingView stratejinize ekleyin, 4) Trading Dashboard\'da "Botu Başlat" butonuna tıklayın. Bot aktif olduğunda yeşil "ACTIVE" durumu görünür.'
        },
        {
          question: 'Risk yönetimi ayarları nelerdir?',
          answer: 'Risk yönetimi ayarları: 1) **Pozisyon Boyutu**: Her işlemde kullanılacak sermaye yüzdesi (varsayılan %10), 2) **Stop Loss**: Maksimum kayıp yüzdesi (varsayılan %2), 3) **Take Profit**: Hedef kar yüzdesi, 4) **Leverage**: Kaldıraç oranı (1x-20x), 5) **Günlük Zarar Limiti**: Günde maksimum kayıp miktarı, 6) **Trailing Stop**: Otomatik kar koruma. Bu ayarlar Admin Dashboard > Risk Yönetimi bölümünden yapılır.'
        },
        {
          question: 'Trailing Stop Loss nedir?',
          answer: 'Trailing Stop Loss, karınızı otomatik olarak koruyan akıllı bir özelliktir. Örnek: %5 trailing stop belirlediniz ve pozisyonunuz %10 kara geçti. Fiyat geri dönmeye başlarsa, %5 düştüğünde otomatik satış yapılır ve %5 karınız korunur. Fiyat yükselmeye devam ederse stop seviyesi de yükselerek karınızı maksimize eder.'
        },
        {
          question: 'Acil durdurma butonu ne işe yarar?',
          answer: 'Acil Durdurma butonu, tüm açık pozisyonlarınızı anlık olarak kapatmanızı sağlar. Piyasada ani bir düşüş olduğunda veya botu durdurmak istediğinizde bu butona basın. Tüm pozisyonlar market emriyle kapatılır ve bot durdurulur. Bu özellik Trading Dashboard\'da kırmızı buton olarak bulunur.'
        }
      ]
    },
    {
      category: 'TradingView Entegrasyonu',
      icon: 'TrendingUp',
      questions: [
        {
          question: 'TradingView webhook nasıl kurulur?',
          answer: 'Webhook kurulumu: 1) Trading Dashboard\'dan webhook URL\'nizi kopyalayın, 2) TradingView\'da stratejinizi açın, 3) "Alert" (Uyarı) oluşturun, 4) "Webhook URL" alanına kopyaladığınız URL\'yi yapıştırın, 5) Message kısmına {{strategy.order.action}} yazın, 6) "Create" butonuna basın. Artık TradingView sinyalleri otomatik olarak botunuza iletilecektir.'
        },
        {
          question: 'Hangi TradingView stratejileri destekleniyor?',
          answer: 'Tüm TradingView stratejileri desteklenmektedir! Pine Script ile yazdığınız herhangi bir stratejiyi kullanabilirsiniz. Stratejinizin "strategy.entry" ve "strategy.close" komutları içermesi yeterlidir. Popüler stratejiler: RSI, MACD, Bollinger Bands, Moving Average Crossover, Ichimoku, Elliott Wave vb. Kendi özel stratejinizi de yazabilirsiniz.'
        },
        {
          question: 'Sinyal gelmedi, sorun nedir?',
          answer: 'Sinyal gelmiyorsa kontrol listesi: 1) Webhook URL\'nin doğru kopyalandığını kontrol edin, 2) TradingView alert\'inin aktif olduğundan emin olun, 3) Botunuzun "ACTIVE" durumda olduğunu kontrol edin, 4) API bağlantılarınızın çalıştığını test edin, 5) Admin Dashboard > Webhook Logs bölümünden gelen istekleri inceleyin. Sorun devam ederse destek ekibimize ulaşın.'
        }
      ]
    },
    {
      category: 'Ödeme ve Abonelik',
      icon: 'CreditCard',
      questions: [
        {
          question: 'Fiyatlandırma nasıl?',
          answer: 'Abonelik planlarımız: 1) **Ücretsiz Deneme**: 7 gün, tüm özellikler, kredi kartı gerekmez, 2) **Basic Plan**: Aylık 299 TL, tek borsa, 5 aktif bot, 3) **Pro Plan**: Aylık 599 TL, 3 borsa, sınırsız bot, gelişmiş analiz, 4) **Premium Plan**: Aylık 999 TL, tüm borsalar, öncelikli destek, özel stratejiler. Yıllık ödemede %20 indirim.'
        },
        {
          question: 'Hangi ödeme yöntemleri kabul edilir?',
          answer: 'Kabul edilen ödeme yöntemleri: 1) Kredi/Banka Kartı (Visa, Mastercard, Troy), 2) Havale/EFT (Türk bankası hesapları), 3) Kripto Para (ödeme (USDT, BTC, ETH). Tüm ödemeler SSL şifrelemesi ile güvenli bir şekilde işlenir. Fatura otomatik olarak e-posta adresinize gönderilir.'
        },
        {
          question: 'Aboneliğimi iptal edebilir miyim?',
          answer: 'Evet, istediğiniz zaman iptal edebilirsiniz. Payment Management sayfasından "Aboneliği İptal Et" butonuna tıklayın. İptal sonrası mevcut dönem sonuna kadar hizmet almaya devam edersiniz, yenileme yapılmaz. İptal ücret iadesi içermez, ancak kalan sürenizi kullanabilirsiniz. İstediğiniz zaman tekrar abone olabilirsiniz.'
        }
      ]
    },
    {
      category: 'Güvenlik',
      icon: 'Shield',
      questions: [
        {
          question: 'API anahtarlarım güvende mi?',
          answer: 'Evet, API anahtarlarınız maksimum güvenlikle saklanır: 1) AES-256 şifrelemesi ile veritabanında saklanır, 2) SSL/TLS ile şifreli kanal üzerinden iletilir, 3) Sadece işlem anında çözülür ve kullanılır, 4) Hiçbir çalışan veya üçüncü taraf erişemez, 5) Düzenli güvenlik auditleri yapılır. Ayrıca API oluştururken "withdrawal" yetkisi vermediğiniz için fonlarınızı çekme imkanı yoktur.'
        },
        {
          question: 'İki faktörlü kimlik doğrulama (2FA) var mı?',
          answer: 'Evet, hesap güvenliği için 2FA önerilir ve mevcuttur. Ayarlar > Güvenlik bölümünden aktifleştirebilirsiniz. Google Authenticator veya Authy uygulaması kullanabilirsiniz. 2FA aktif olduğunda, giriş yaparken şifrenizin yanı sıra 6 haneli kod da gerekir. Büyük işlemler için de ek onay istenir.'
        },
        {
          question: 'Hesabım hacklendi, ne yapmalıyım?',
          answer: 'Acil durum adımları: 1) Hemen "Acil Durdurma" butonuna basarak tüm işlemleri durdurun, 2) Ayarlar\'dan tüm API bağlantılarını silin, 3) Şifrenizi değiştirin, 4) Borsa hesabınızdan API anahtarlarını iptal edin, 5) Destek ekibimize acil olarak bildirin (support@atalayulusoy.com), 6) Hesabınızı geçici olarak dondurabiliriz. Fonlarınız borsanızda olduğu için, borsadaki güvenlik önlemleriniz de önemlidir.'
        }
      ]
    },
    {
      category: 'Teknik Sorunlar',
      icon: 'AlertTriangle',
      questions: [
        {
          question: 'Bot çalışmıyor, ne yapmalıyım?',
          answer: 'Sorun giderme adımları: 1) Sayfa yenileyin (F5), 2) Tarayıcı cache\'ini temizleyin, 3) Farklı tarayıcıda deneyin (Chrome önerilir), 4) İnternet bağlantınızı kontrol edin, 5) Borsa API durumunu kontrol edin (bazı borsalar bakım yapabilir), 6) Admin Dashboard > System Status\'tan sistem sağlığını kontrol edin. Sorun devam ederse destek talebi oluşturun.'
        },
        {
          question: 'İşlemler geç gerçekleşiyor?',
          answer: 'Gecikme nedenleri ve çözümleri: 1) **TradingView gecikmesi**: Ücretsiz hesaplarda sinyal gecikmesi olabilir, premium hesap önerilir, 2) **Borsa API gecikmesi**: Yüksek volatilite sırasında borsalar yavaşlayabilir, 3) **İnternet bağlantısı**: Hızlı ve stabil bağlantı gereklidir, 4) **Sunucu yükü**: Nadir durumlarda sistem yükü olabilir, otomatik ölçeklenir. Normal gecikme 1-3 saniyedir, 10+ saniye gecikme varsa destek ekibine bildirin.'
        },
        {
          question: 'Grafik görünmüyor?',
          answer: 'Grafik sorunları için: 1) Sayfa yenileyin, 2) Tarayıcı JavaScript\'inin aktif olduğundan emin olun, 3) Reklam engelleyici varsa devre dışı bırakın, 4) Tarayıcı konsolunu açın (F12) ve hata mesajlarını kontrol edin, 5) Farklı coin seçerek test edin. Sorun devam ederse ekran görüntüsü ile destek talebi oluşturun.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>Sık Sorulan Sorular (SSS) - Atalay Ulusoy Kripto İşlem Botu</title>
        <meta 
          name="description" 
          content="Atalay Ulusoy kripto işlem botu hakkında sık sorulan sorular. Bot kullanımı, API ayarları, risk yönetimi, ödeme ve güvenlik konularında detaylı yanıtlar." 
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
                <Icon name="BookOpen" size={32} color="#ffffff" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Sık Sorulan Sorular
                </h1>
                <p className="text-muted-foreground mt-1">
                  Merak ettiklerinizin yanıtları burada
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Aranan soruyu bulamadınız mı? <button onClick={() => navigate('/support-center')} className="text-primary hover:underline font-medium">Destek Merkezi</button>
                'nden bize ulaşabilir veya <button onClick={() => navigate('/contact')} className="text-primary hover:underline font-medium">İletişim</button> sayfasından mesaj gönderebilirsiniz.
              </p>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-8">
            {faqCategories?.map((category, categoryIndex) => (
              <div key={categoryIndex} className="p-6 md:p-8 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <Icon name={category?.icon} size={24} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{category?.category}</h2>
                </div>

                <div className="space-y-3">
                  {category?.questions?.map((item, questionIndex) => {
                    const index = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === index;

                    return (
                      <div key={questionIndex} className="border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                        >
                          <span className="font-medium text-foreground pr-4">{item?.question}</span>
                          <Icon 
                            name={isOpen ? 'ChevronUp' : 'ChevronDown'} 
                            size={20} 
                            className="text-muted-foreground flex-shrink-0" 
                          />
                        </button>
                        {isOpen && (
                          <div className="p-4 pt-0 border-t border-border bg-muted/20">
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                              {item?.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="p-6 md:p-8 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Hala Soru işaretleriniz mi Var?
              </h2>
              <p className="text-muted-foreground mb-6">
                Destek ekibimiz size yardımcı olmak için hazır.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="default"
                  size="lg"
                  iconName="Headphones"
                  iconPosition="left"
                  onClick={() => navigate('/support-center')}
                >
                  Destek Talebi Oluştur
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  iconName="Mail"
                  iconPosition="left"
                  onClick={() => navigate('/contact')}
                >
                  İletişim Formu
                </Button>
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

export default FAQ;