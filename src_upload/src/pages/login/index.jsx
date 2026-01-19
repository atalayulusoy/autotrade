import React from 'react';

import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import LoginForm from './components/LoginForm';
import SecurityFeatures from './components/SecurityFeatures';
import ExchangeStatus from './components/ExchangeStatus';
import TradingViewIntegration from './components/TradingViewIntegration';

const Login = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg sm:max-w-2xl">
        <div className="card-mobile">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 sm:p-4 rounded-xl bg-primary/10">
                <Icon name="Bitcoin" size={40} color="#2563eb" />
              </div>
            </div>
            <h1 className="text-responsive-h1 font-bold text-foreground mb-2">
              Crypto Trading Bot
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Profesyonel kripto para ticaret platformu
            </p>
          </div>

          <LoginForm onSuccess={handleLoginSuccess} />

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-card text-muted-foreground">veya</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/register')}
              className="btn-touch-secondary w-full"
            >
              Yeni Hesap Oluştur
            </button>

            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors py-2"
            >
              Şifrenizi mi unuttunuz?
            </button>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 border-t border-border">
            <SecurityFeatures />
            <ExchangeStatus />
            <TradingViewIntegration />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;