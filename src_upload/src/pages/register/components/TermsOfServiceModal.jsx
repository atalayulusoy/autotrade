import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TermsOfServiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg border border-border w-full max-w-3xl max-h-[80vh] shadow-lg flex flex-col"
        onClick={(e) => e?.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Kullanım Koşulları</h3>
            <p className="caption text-muted-foreground mt-1">
              Son güncelleme: {new Date()?.toLocaleDateString('tr-TR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
            aria-label="Kapat"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">1. Hizmet Tanımı</h4>
              <p>
                Atalay Ulusoy Kripto İşlem Platformu ("Platform"), TradingView sinyallerine göre otomatik kripto para 
                alım-satım işlemleri yapan bir yazılım hizmetidir. Platform, kullanıcıların kendi borsa hesaplarında 
                işlem yapmalarını sağlar ve hiçbir şekilde fonlara doğrudan erişim sağlamaz.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">2. Kullanıcı Sorumlulukları</h4>
              <p className="mb-2">Platform kullanıcısı olarak şunları kabul edersiniz:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>18 yaşından büyük olduğunuzu ve yasal ehliyete sahip olduğunuzu</li>
                <li>Kripto para işlemlerinin risklerini anladığınızı ve kabul ettiğinizi</li>
                <li>Tüm işlem kararlarının sorumluluğunun size ait olduğunu</li>
                <li>API anahtarlarınızı güvenli bir şekilde saklayacağınızı</li>
                <li>Hesap bilgilerinizi başkalarıyla paylaşmayacağınızı</li>
                <li>Platform kurallarına ve yasal düzenlemelere uyacağınızı</li>
                <li>Verdiğiniz bilgilerin doğru ve güncel olduğunu</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">3. Risk Bildirimi</h4>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-3">
                <div className="flex items-start gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground mb-2">ÖNEMLİ RİSK UYARISI</p>
                    <p className="text-sm">
                      Kripto para işlemleri yüksek risk içerir ve sermaye kaybına yol açabilir. Geçmiş performans 
                      gelecekteki sonuçların garantisi değildir. Kaybetmeyi göze alamayacağınız parayla işlem yapmayın.
                    </p>
                  </div>
                </div>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Piyasa Riski:</strong> Kripto para fiyatları son derece volatildir ve hızlı değişebilir</li>
                <li><strong>Likidite Riski:</strong> Bazı durumlarda pozisyonları kapatmak zor olabilir</li>
                <li><strong>Kaldıraç Riski:</strong> Yüksek kaldıraç kullanımı kayıpları artırabilir</li>
                <li><strong>Teknik Risk:</strong> İnternet kesintisi, borsa arızası gibi teknik sorunlar olabilir</li>
                <li><strong>Düzenleme Riski:</strong> Yasal düzenlemeler değişebilir ve işlemleri etkileyebilir</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">4. Yatırım Tavsiyesi Değildir</h4>
              <p>
                Platform, <strong>yatırım tavsiyesi vermemektedir</strong>. Sunulan tüm bilgiler, analizler ve sinyaller 
                sadece bilgilendirme amaçlıdır. Her kullanıcı kendi araştırmasını yapmalı ve bağımsız finansal danışman 
                ile görüşmelidir. Platform operatörleri, çalışanları ve ortakları hiçbir şekilde yatırım tavsiyesi vermez 
                ve işlem sonuçlarından sorumlu tutulamaz.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">5. API Anahtarları ve Güvenlik</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>API anahtarlarınız AES-256 şifreleme ile korunur</li>
                <li>Sadece "trade" (işlem yapma) yetkisi vermelisiniz, "withdrawal" (para çekme) yetkisi vermemelisiniz</li>
                <li>API anahtarlarınızı düzenli olarak yenilemeniz önerilir</li>
                <li>Şüpheli aktivite fark ederseniz derhal API anahtarlarınızı iptal edin</li>
                <li>Platform, API anahtarlarınızın kötüye kullanımından sorumlu değildir</li>
                <li>Fonlarınız her zaman kendi borsa hesabınızda kalır, biz asla fonlara erişemeyiz</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">6. Hizmet Kullanım Kuralları</h4>
              <p className="mb-2">Aşağıdaki faaliyetler kesinlikle yasaktır:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Platform güvenliğini tehlikeye atmak veya hack girişiminde bulunmak</li>
                <li>Başkalarının hesaplarına yetkisiz erişim sağlamak</li>
                <li>Sahte hesap oluşturmak veya kimlik bilgilerini çalmak</li>
                <li>Platform altyapısına zarar verecek şekilde kullanmak (DDoS, spam vb.)</li>
                <li>Kara para aklama veya yasadışı faaliyetlerde kullanmak</li>
                <li>Platform içeriğini izinsiz kopyalamak veya dağıtmak</li>
                <li>Botları manipüle etmeye veya sistemi kandırmaya çalışmak</li>
              </ul>
              <p className="mt-2">
                Bu kurallara uymayan kullanıcıların hesapları uyarı yapılmaksızın kapatılabilir ve yasal işlem başlatılabilir.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">7. Ücretler ve Ödemeler</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Abonelik ücretleri aylık veya yıllık olarak tahsil edilir</li>
                <li>7 günlük ücretsiz deneme süresi sonunda otomatik ücretlendirme başlar</li>
                <li>İptal etmediğiniz sürece aboneliğiniz otomatik olarak yenilenir</li>
                <li>İptal sonrası mevcut dönem sonuna kadar hizmet devam eder, ücret iadesi yapılmaz</li>
                <li>Fiyatlar önceden bildirimle değiştirilebilir</li>
                <li>Ödeme yapılmayan hesaplar askıya alınır</li>
                <li>Borsa işlem ücretleri ayrıca borsalar tarafından tahsil edilir</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">8. Hizmet Garantisi ve Sorumluluk Reddi</h4>
              <p className="mb-2">
                Platform "olduğu gibi" sunulur ve aşağıdaki konularda garanti verilmez:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Kesintisiz ve hatasız hizmet sunumu</li>
                <li>Belirli bir kar veya getiri elde edilmesi</li>
                <li>TradingView sinyallerinin doğruluğu</li>
                <li>Borsa API'lerinin çalışması</li>
                <li>İnternet bağlantısının sürekliliği</li>
              </ul>
              <p className="mt-3">
                <strong>Sorumluluk Sınırı:</strong> Platform operatörleri, maksimum sorumluluk tutarı olarak son 3 ayda 
                ödediğiniz abonelik ücretiyle sınırlıdır. Dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan 
                (kar kaybı, veri kaybı vb.) sorumlu değiliz.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">9. Hizmet Değişiklikleri ve Sonlandırma</h4>
              <p className="mb-2">Platform yönetimi şu haklara sahiptir:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Hizmet özelliklerini değiştirme, ekleme veya kaldırma</li>
                <li>Bakım için geçici olarak hizmeti durdurma</li>
                <li>Kullanım koşullarını güncelleme (önemli değişiklikler bildirilir)</li>
                <li>Kural ihlali yapan hesapları askıya alma veya kapatma</li>
                <li>Hizmeti tamamen sonlandırma (30 gün önceden bildirimle)</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">10. Fikri Mülkiyet Hakları</h4>
              <p>
                Platform üzerindeki tüm içerik, yazılım, tasarım, logo ve ticari markalar Atalay Ulusoy'a aittir ve 
                telif hakkı yasalarıyla korunmaktadır. İzinsiz kopyalama, dağıtma veya ticari kullanım yasaktır. 
                Kullanıcılar sadece kişisel, ticari olmayan kullanım için sınırlı bir lisans alır.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">11. Uyuşmazlık Çözümü</h4>
              <p>
                Bu sözleşmeden doğan uyuşmazlıklar öncelikle dostane görüşmelerle çözülmeye çalışılır. Çözülemezse, 
                <strong> İstanbul Mahkemeleri ve İcra Daireleri</strong> yetkilidir. Türkiye Cumhuriyeti yasaları uygulanır.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">12. İletişim ve Bildirimler</h4>
              <p className="mb-2">
                Kullanım koşulları hakkında sorularınız için:
              </p>
              <ul className="list-none space-y-1">
                <li><strong>E-posta:</strong> support@atalayulusoy.com</li>
                <li><strong>Destek:</strong> Destek Merkezi üzerinden talep oluşturabilirsiniz</li>
                <li><strong>Adres:</strong> İstanbul, Türkiye</li>
              </ul>
              <p className="mt-2">
                Önemli bildirimler kayıtlı e-posta adresinize gönderilir. E-posta adresinizi güncel tutmanız önemlidir.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">13. Hesap Sonlandırma</h4>
              <p className="mb-2">Hesabınızı istediğiniz zaman kapatabilirsiniz:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ayarlar &gt; Hesap &gt; "Hesabı Kapat" seçeneğini kullanın</li>
                <li>Tüm açık pozisyonlarınızı kapatın</li>
                <li>API bağlantılarınız otomatik olarak silinir</li>
                <li>Kişisel verileriniz 30 gün içinde silinir</li>
                <li>İşlem geçmişi yasal zorunluluk nedeniyle 5 yıl saklanır (anonim)</li>
                <li>Ödenen ücretler iade edilmez</li>
              </ul>
            </section>

            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Icon name="FileText" size={20} className="text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Sözleşme Kabulü</p>
                  <p className="text-sm">
                    Platforma kayıt olarak bu kullanım koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. 
                    Bu koşulları kabul etmiyorsanız, lütfen platformu kullanmayın. Kullanım koşulları değiştiğinde size bildirim 
                    gönderilir ve platformu kullanmaya devam ederek yeni koşulları kabul etmiş sayılırsınız.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            variant="default"
            onClick={onClose}
          >
            Anladım
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;