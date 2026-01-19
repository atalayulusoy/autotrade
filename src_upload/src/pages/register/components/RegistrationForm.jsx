import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '+90 ',
    tradingExperience: '',
    preferredExchanges: [],
    agreeTerms: false,
    agreePrivacy: false,
    agreeCompliance: false,
    agreeContract: false
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const tradingExperienceOptions = [
    { value: '', label: 'Deneyim seviyenizi seçin', disabled: true },
    { value: 'beginner', label: 'Başlangıç (0-1 yıl)' },
    { value: 'intermediate', label: 'Orta (1-3 yıl)' },
    { value: 'advanced', label: 'İleri (3-5 yıl)' },
    { value: 'expert', label: 'Uzman (5+ yıl)' }
  ];

  const exchangeOptions = [
    { value: 'okx', label: 'OKX' },
    { value: 'binance', label: 'Binance' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'gateio', label: 'Gate.io' },
    { value: 'btcturk', label: 'BTCTURK' }
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength += 25;
    if (password?.length >= 12) strength += 25;
    if (/[a-z]/?.test(password) && /[A-Z]/?.test(password)) strength += 25;
    if (/[0-9]/?.test(password)) strength += 12.5;
    if (/[^a-zA-Z0-9]/?.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const handleInputChange = (field, value) => {
    // Prevent deletion of +90 prefix for phone number
    if (field === 'phoneNumber') {
      if (!value?.startsWith('+90 ')) {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData?.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/?.test(formData?.password)) {
      newErrors.password = 'Şifre büyük harf, küçük harf ve rakam içermelidir';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Şifre onayı gereklidir';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!formData?.fullName) {
      newErrors.fullName = 'Ad soyad gereklidir';
    } else if (formData?.fullName?.length < 3) {
      newErrors.fullName = 'Ad soyad en az 3 karakter olmalıdır';
    }

    if (!formData?.phoneNumber || formData?.phoneNumber === '+90 ') {
      newErrors.phoneNumber = 'Telefon numarası gereklidir';
    } else if (!/^\+90\s[0-9]{10}$/?.test(formData?.phoneNumber?.replace(/\s+/g, ' '))) {
      newErrors.phoneNumber = 'Geçerli bir Türkiye telefon numarası girin (10 rakam)';
    }

    if (!formData?.tradingExperience) {
      newErrors.tradingExperience = 'Deneyim seviyesi seçimi gereklidir';
    }

    if (formData?.preferredExchanges?.length === 0) {
      newErrors.preferredExchanges = 'En az bir borsa seçmelisiniz';
    }

    if (!formData?.agreeTerms) {
      newErrors.agreeTerms = 'Kullanım koşullarını kabul etmelisiniz';
    }

    if (!formData?.agreePrivacy) {
      newErrors.agreePrivacy = 'Gizlilik politikasını kabul etmelisiniz';
    }

    if (!formData?.agreeCompliance) {
      newErrors.agreeCompliance = 'Uyumluluk beyanını kabul etmelisiniz';
    }

    if (!formData?.agreeContract) {
      newErrors.agreeContract = 'Yatırım sözleşmesini kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase?.auth?.signUp({
        email: formData?.email,
        password: formData?.password,
        options: {
          data: {
            full_name: formData?.fullName,
            phone_number: formData?.phoneNumber,
            trading_experience: formData?.tradingExperience,
            preferred_exchanges: formData?.preferredExchanges
          }
        }
      });

      if (error) throw error;

      navigate('/login', { 
        state: { 
          message: 'Kayıt başarılı! 1 günlük ücretsiz deneme ve 100 TL test bakiyesi hesabınıza tanımlandı. Giriş yapabilirsiniz.',
          email: formData?.email
        }
      });
    } catch (error) {
      setErrors({ submit: error?.message || 'Kayıt başarısız oldu' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-error';
    if (passwordStrength < 50) return 'bg-warning';
    if (passwordStrength < 75) return 'bg-secondary';
    return 'bg-success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Çok Zayıf';
    if (passwordStrength < 50) return 'Zayıf';
    if (passwordStrength < 75) return 'Orta';
    return 'Güçlü';
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            type="email"
            label="E-posta Adresi"
            placeholder="ornek@email.com"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Şifre"
                placeholder="En az 8 karakter"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                error={errors?.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
              </button>
            </div>

            {formData?.password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="caption text-muted-foreground">Şifre Gücü:</span>
                  <span className={`caption font-medium ${passwordStrength >= 75 ? 'text-success' : passwordStrength >= 50 ? 'text-secondary' : passwordStrength >= 25 ? 'text-warning' : 'text-error'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className="caption text-muted-foreground">
                  Büyük harf, küçük harf, rakam ve özel karakter kullanın
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label="Şifre Onayı"
              placeholder="Şifrenizi tekrar girin"
              value={formData?.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
              error={errors?.confirmPassword}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>

          <Input
            type="text"
            label="Ad Soyad"
            placeholder="Adınız ve soyadınız"
            value={formData?.fullName}
            onChange={(e) => handleInputChange('fullName', e?.target?.value)}
            error={errors?.fullName}
            required
          />

          <Input
            type="tel"
            label="Telefon Numarası"
            placeholder="+90 5XX XXX XX XX"
            value={formData?.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e?.target?.value)}
            error={errors?.phoneNumber}
            description="+90 ile başlayan 10 haneli telefon numaranızı girin"
            required
          />

          <Select
            label="İşlem Deneyimi"
            options={tradingExperienceOptions}
            value={formData?.tradingExperience}
            onChange={(value) => handleInputChange('tradingExperience', value)}
            error={errors?.tradingExperience}
            placeholder="Deneyim seviyenizi seçin"
            required
          />

          <Select
            label="Tercih Edilen Borsalar"
            description="Kullanmayı planladığınız kripto para borsalarını seçin"
            options={exchangeOptions}
            value={formData?.preferredExchanges}
            onChange={(value) => handleInputChange('preferredExchanges', value)}
            error={errors?.preferredExchanges}
            multiple
            searchable
            clearable
            required
          />
        </div>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={formData?.agreeTerms}
              onCheckedChange={(checked) => handleInputChange('agreeTerms', checked)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <button 
                type="button"
                onClick={(e) => {
                  e?.preventDefault();
                  e?.stopPropagation();
                  setShowTermsModal(true);
                }}
                className="text-primary hover:underline"
              >
                Kullanım Koşulları
              </button>'nı okudum ve kabul ediyorum
            </span>
          </label>
          {errors?.agreeTerms && (
            <p className="caption text-error ml-7">{errors?.agreeTerms}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={formData?.agreePrivacy}
              onCheckedChange={(checked) => handleInputChange('agreePrivacy', checked)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <button 
                type="button"
                onClick={(e) => {
                  e?.preventDefault();
                  e?.stopPropagation();
                  setShowPrivacyModal(true);
                }}
                className="text-primary hover:underline"
              >
                Gizlilik Politikası
              </button>'nı okudum ve kabul ediyorum
            </span>
          </label>
          {errors?.agreePrivacy && (
            <p className="caption text-error ml-7">{errors?.agreePrivacy}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={formData?.agreeCompliance}
              onCheckedChange={(checked) => handleInputChange('agreeCompliance', checked)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Kripto para işlemlerinin risklerini anladığımı ve sorumluluğun bana ait olduğunu kabul ediyorum
            </span>
          </label>
          {errors?.agreeCompliance && (
            <p className="caption text-error ml-7">{errors?.agreeCompliance}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer group">
            <Checkbox
              checked={formData?.agreeContract}
              onCheckedChange={(checked) => handleInputChange('agreeContract', checked)}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <strong className="text-foreground">Yatırım Sözleşmesi:</strong> Bu platform yatırım tavsiyesi vermemektedir. 
              Tüm işlemler kullanıcının kendi sorumluluğundadır. Kripto para yatırımları yüksek risk içerir ve 
              sermaye kaybına yol açabilir. Geçmiş performans gelecekteki sonuçların garantisi değildir.
            </span>
          </label>
          {errors?.agreeContract && (
            <p className="caption text-error ml-7">{errors?.agreeContract}</p>
          )}
        </div>
        <div className="flex flex-col gap-4 pt-4">
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isSubmitting}
            iconName="UserPlus"
            iconPosition="left"
          >
            {isSubmitting ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
          </Button>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Zaten hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:text-secondary transition-colors font-medium"
              >
                Giriş Yapın
              </button>
            </span>
          </div>
        </div>
      </form>
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
      <TermsOfServiceModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
    </>
  );
};

export default RegistrationForm;