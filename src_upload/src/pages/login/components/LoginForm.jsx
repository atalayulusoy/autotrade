import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../lib/supabase';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const mockCredentials = {
    email: 'test@atalaytrade.com',
    password: 'test123'
  };

  useEffect(() => {
    const saved = localStorage.getItem('au_remember_me');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setFormData((prev) => ({
        ...prev,
        email: parsed?.email || '',
        password: parsed?.password || '',
        rememberMe: !!parsed?.rememberMe
      }));
    } catch (error) {
      localStorage.removeItem('au_remember_me');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'E-posta adresi gereklidir';
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

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: e?.target?.checked
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Attempt Supabase authentication
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email: formData?.email,
        password: formData?.password
      });

      if (error) {
        // If Supabase auth fails, fallback to mock credentials
        if (
          formData?.email === mockCredentials?.email &&
          formData?.password === mockCredentials?.password
        ) {
          navigate('/trading-dashboard');
          return;
        }
        throw error;
      }

      // Check user role from profile
      const { data: profileData, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('role')
        ?.eq('id', data?.user?.id)
        ?.single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Default to trading dashboard if profile fetch fails
        navigate('/trading-dashboard');
        return;
      }

      // Redirect based on role
      if (formData?.rememberMe) {
        localStorage.setItem(
          'au_remember_me',
          JSON.stringify({
            email: formData?.email,
            password: formData?.password,
            rememberMe: true
          })
        );
      } else {
        localStorage.removeItem('au_remember_me');
      }

      if (profileData?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/trading-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('E-posta veya şifre hatalı. Lütfen tekrar deneyiniz.');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 md:space-y-6">
      <div>
        <Input
          type="email"
          name="email"
          label="E-posta Adresi"
          placeholder="ornek@atalaytrade.com"
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
          placeholder="Şifrenizi giriniz"
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
            <p className="text-sm md:text-base text-error whitespace-pre-line">{loginError}</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-2 md:gap-3">
        <Checkbox
          label="Beni Hatırla"
          checked={formData?.rememberMe}
          onChange={handleCheckboxChange}
          disabled={isLoading}
          size="sm"
        />
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm md:text-base text-primary hover:text-secondary transition-colors"
          disabled={isLoading}
        >
          Şifremi Unuttum
        </button>
      </div>
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading}
        className="mt-4 md:mt-6"
      >
        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
      </Button>
      <div className="text-center pt-2 md:pt-4">
        <p className="text-sm md:text-base text-muted-foreground">
          Hesabınız yok mu?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-primary hover:text-secondary transition-colors font-medium"
            disabled={isLoading}
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
