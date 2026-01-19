import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
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
            <h3 className="text-xl font-semibold text-foreground">Gizlilik Politikası</h3>
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
              <h4 className="text-base font-semibold text-foreground mb-3">1. Toplanan Bilgiler</h4>
              <p className="mb-2">
                Atalay Ulusoy Kripto İşlem Platformu olarak, hizmetlerimizi sunabilmek için aşağıdaki bilgileri toplarız:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Kişisel Bilgiler:</strong> Ad, soyad, e-posta adresi, telefon numarası</li>
                <li><strong>Hesap Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenmiş), profil tercihleri</li>
                <li><strong>API Anahtarları:</strong> Borsa API anahtarları (AES-256 şifreleme ile korunur)</li>
                <li><strong>İşlem Verileri:</strong> Alım-satım geçmişi, portföy bilgileri, risk yönetimi ayarları</li>
                <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı bilgisi, cihaz türü, kullanım logları</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">2. Bilgilerin Kullanım Amacı</h4>
              <p className="mb-2">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Otomatik işlem botunuzun çalışmasını sağlamak</li>
                <li>Hesap güvenliğinizi korumak ve dolandırıcılığı önlemek</li>
                <li>Müşteri desteği sağlamak ve sorularınızı yanıtlamak</li>
                <li>Platform performansını iyileştirmek ve hataları gidermek</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                <li>Size önemli güncellemeler ve bildirimler göndermek</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">3. Bilgi Güvenliği</h4>
              <p className="mb-2">
                Verilerinizin güvenliği bizim için en önemli önceliktir. Aşağıdaki güvenlik önlemlerini alıyoruz:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Şifreleme:</strong> Tüm hassas veriler AES-256 şifreleme ile korunur</li>
                <li><strong>SSL/TLS:</strong> Tüm veri aktarımları şifreli kanallar üzerinden yapılır</li>
                <li><strong>Erişim Kontrolü:</strong> Verilere sadece yetkili personel erişebilir</li>
                <li><strong>Düzenli Denetim:</strong> Güvenlik açıkları için düzenli taramalar yapılır</li>
                <li><strong>Yedekleme:</strong> Verileriniz düzenli olarak yedeklenir</li>
                <li><strong>2FA Desteği:</strong> İki faktörlü kimlik doğrulama ile ek güvenlik</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">4. Bilgi Paylaşımı</h4>
              <p className="mb-2">
                Kişisel bilgilerinizi üçüncü taraflarla <strong>asla satmayız</strong>. Ancak aşağıdaki durumlarda bilgi paylaşımı yapabiliriz:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Hizmet Sağlayıcılar:</strong> Supabase (veritabanı), Resend (e-posta) gibi altyapı sağlayıcıları</li>
                <li><strong>Yasal Zorunluluk:</strong> Mahkeme kararı veya yasal düzenleme gerektirdiğinde</li>
                <li><strong>Güvenlik:</strong> Dolandırıcılık veya güvenlik tehditlerine karşı</li>
              </ul>
              <p className="mt-2">
                <strong>Önemli:</strong> API anahtarlarınız hiçbir koşulda üçüncü taraflarla paylaşılmaz ve sadece işlem yapmak için kullanılır.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">5. Çerezler (Cookies)</h4>
              <p className="mb-2">
                Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanır:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Zorunlu Çerezler:</strong> Oturum yönetimi ve güvenlik için gereklidir</li>
                <li><strong>Tercih Çerezleri:</strong> Dil, tema gibi tercihlerinizi hatırlar</li>
                <li><strong>Analitik Çerezler:</strong> Platform kullanımını analiz eder (anonim)</li>
              </ul>
              <p className="mt-2">
                Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz, ancak bazı özellikler çalışmayabilir.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">6. Kullanıcı Hakları</h4>
              <p className="mb-2">KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında haklarınız:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Erişim Hakkı:</strong> Hangi verilerinizin toplandığını öğrenebilirsiniz</li>
                <li><strong>Düzeltme Hakkı:</strong> Yanlış bilgilerin düzeltilmesini isteyebilirsiniz</li>
                <li><strong>Silme Hakkı:</strong> Hesabınızı ve verilerinizi silebilirsiniz</li>
                <li><strong>İtiraz Hakkı:</strong> Veri işlemeye itiraz edebilirsiniz</li>
                <li><strong>Taşınabilirlik:</strong> Verilerinizi başka bir platforma aktarabilirsiniz</li>
              </ul>
              <p className="mt-2">
                Bu haklarınızı kullanmak için <strong>support@atalayulusoy.com</strong> adresine e-posta gönderebilirsiniz.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">7. Veri Saklama Süresi</h4>
              <p>
                Kişisel verileriniz, hizmet sunumu için gerekli olduğu sürece saklanır. Hesabınızı sildiğinizde:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>Kişisel bilgileriniz 30 gün içinde silinir</li>
                <li>İşlem geçmişi yasal zorunluluk nedeniyle 5 yıl saklanır (anonim)</li>
                <li>API anahtarları anında ve kalıcı olarak silinir</li>
              </ul>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">8. Çocukların Gizliliği</h4>
              <p>
                Platformumuz 18 yaş altı kullanıcılara yönelik değildir. 18 yaşından küçük kullanıcılardan bilerek veri toplamıyoruz. 
                Eğer 18 yaşından küçük bir kullanıcının kayıt olduğunu fark edersek, hesabı derhal kapatır ve verilerini sileriz.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">9. Politika Değişiklikleri</h4>
              <p>
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda size e-posta ile bildirim göndeririz. 
                Güncellenmiş politika bu sayfada yayınlanır ve "Son güncelleme" tarihi değiştirilir.
              </p>
            </section>

            <section>
              <h4 className="text-base font-semibold text-foreground mb-3">10. İletişim</h4>
              <p className="mb-2">
                Gizlilik politikamız hakkında sorularınız varsa bizimle iletişime geçin:
              </p>
              <ul className="list-none space-y-1">
                <li><strong>E-posta:</strong> support@atalayulusoy.com</li>
                <li><strong>Adres:</strong> İstanbul, Türkiye</li>
                <li><strong>Destek:</strong> Destek Merkezi üzerinden talep oluşturabilirsiniz</li>
              </ul>
            </section>

            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Icon name="Shield" size={20} className="text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Güvenlik Taahhüdümüz</p>
                  <p className="text-sm">
                    Verilerinizin güvenliği bizim için en önemli önceliktir. Endüstri standardı güvenlik önlemleri alıyor 
                    ve düzenli olarak güvenlik denetimlerinden geçiyoruz. API anahtarlarınız asla çözülmemiş halde saklanmaz 
                    ve fonlarınıza erişim yetkimiz yoktur.
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

export default PrivacyPolicyModal;