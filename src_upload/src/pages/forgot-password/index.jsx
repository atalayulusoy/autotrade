import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('E-posta adresi gereklidir');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Şifre sıfırlama bağlantısı gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Şifremi Unuttum - Atalay Ulusoy Kripto İşlem Botu</title>
        <meta 
          name="description" 
          content="Şifrenizi sıfırlayın ve hesabınıza tekrar erişim sağlayın." 
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700/50 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-4 rounded-full">
                  <Icon name="Key" size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Şifremi Unuttum</h1>
              <p className="text-slate-400 text-sm md:text-base">
                E-posta adresinize şifre sıfırlama bağlantısı gönderelim
              </p>
            </div>

            {success ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-900/30 border border-green-700/50">
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle" size={24} className="text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-medium mb-1">Bağlantı Gönderildi!</p>
                      <p className="text-green-200 text-sm">
                        Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-300 text-sm font-medium mb-1">Sonraki Adımlar:</p>
                      <ul className="text-blue-200 text-xs space-y-1">
                        <li>• E-posta gelen kutunuzu kontrol edin</li>
                        <li>• Spam/Çöp klasörünü de kontrol etmeyi unutmayın</li>
                        <li>• Bağlantı 15 dakika için geçerlidir</li>
                        <li>• Bağlantıya tıklayarak yeni şifrenizi oluşturun</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  variant="default"
                  fullWidth
                  onClick={() => navigate('/login')}
                >
                  Giriş Sayfasına Dön
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  label="E-posta Adresi"
                  placeholder="ornek@atalaytrade.com"
                  value={email}
                  onChange={(e) => setEmail(e?.target?.value)}
                  error={error}
                  required
                  disabled={loading}
                />

                {error && (
                  <div className="p-3 md:p-4 rounded-lg bg-red-900/30 border border-red-700/50">
                    <div className="flex items-start gap-2 md:gap-3">
                      <Icon name="AlertCircle" size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm md:text-base text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Shield" size={20} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-300 text-sm font-medium mb-1">Güvenlik Bilgisi</p>
                      <p className="text-slate-400 text-xs">
                        Şifre sıfırlama bağlantısı sadece kayıtlı e-posta adreslerine gönderilir ve 15 dakika için geçerlidir.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                </Button>

                <div className="text-center pt-4 border-t border-slate-700/50">
                  <p className="text-sm text-slate-400">
                    Şifrenizi hatırladınız mı?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      disabled={loading}
                    >
                      Giriş Yap
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500">
              &copy; {new Date()?.getFullYear()} Atalay Ulusoy Trading Bot. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;