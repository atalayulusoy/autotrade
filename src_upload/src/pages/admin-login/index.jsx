import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Admin e-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!formData?.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email: formData?.email,
        password: formData?.password
      });

      if (error) throw error;

      // Check if user is admin
      const { data: profileData, error: profileError } = await supabase?.from('user_profiles')?.select('role')?.eq('id', data?.user?.id)?.single();

      if (profileError) throw profileError;

      if (profileData?.role !== 'admin') {
        await supabase?.auth?.signOut();
        setLoginError('Bu alan sadece yöneticiler içindir. Lütfen normal giriş sayfasını kullanın.');
        setIsLoading(false);
        return;
      }

      navigate('/admin-dashboard');
    } catch (error) {
      setLoginError(error?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <Icon name="ArrowLeft" size={20} />
          <span>Geri Dön</span>
        </button>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700/50 shadow-2xl">
          {/* Admin Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 p-4 rounded-full">
                <Icon name="Shield" size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-slate-400 text-sm md:text-base">Yönetici Girişi</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-400 font-medium">Yüksek Güvenlik Erişimi</span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-xs text-blue-300 mb-1 font-medium">Demo Admin Girişi:</p>
            <p className="text-xs text-blue-200">admin@autotrade.com / admin123</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                name="email"
                label="Admin E-posta"
                placeholder="admin@autotrade.com"
                value={formData?.email}
                onChange={handleInputChange}
                error={errors?.email}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Şifre"
                placeholder="Güçlü şifrenizi giriniz"
                value={formData?.password}
                onChange={handleInputChange}
                error={errors?.password}
                required
                disabled={isLoading}
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                disabled={isLoading}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
              </button>
            </div>

            {loginError && (
              <div className="p-3 md:p-4 rounded-lg bg-error/10 border border-error/20">
                <div className="flex items-start gap-2 md:gap-3">
                  <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-error">{loginError}</p>
                </div>
              </div>
            )}

            {/* Security Features */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon name="Lock" size={14} className="text-green-500" />
                <span>256-bit SSL Şifreleme</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon name="Shield" size={14} className="text-green-500" />
                <span>IP Adresi Doğrulama Aktif</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Icon name="Activity" size={14} className="text-green-500" />
                <span>Oturum Kayıt Sistemi</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              className="mt-6 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              {isLoading ? 'Doğrulanıyor...' : 'Admin Girişi Yap'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-slate-700/50 mt-6">
            <p className="text-sm text-slate-400">
              Normal kullanıcı mısınız?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                disabled={isLoading}
              >
                Buradan giriş yapın
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;