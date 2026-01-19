import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import RegistrationForm from './components/RegistrationForm';
import SecurityFeatures from './components/SecurityFeatures';
import BenefitsSection from './components/BenefitsSection';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';



const Register = () => {
  const navigate = useNavigate();
  
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);

  const handleRegistrationSuccess = () => {
    navigate('/dashboard');
  };
  
  return (
    <>
      <Helmet>
        <title>Kayıt Ol - Atalay Ulusoy Kripto İşlem Botu</title>
        <meta 
          name="description" 
          content="Atalay Ulusoy otomatik kripto para işlem botu için hesap oluşturun. TradingView entegrasyonu ile 7/24 otomatik işlem yapın." 
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="card-mobile">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 sm:p-4 rounded-xl bg-primary/10">
                  <Icon name="UserPlus" size={40} color="#2563eb" />
                </div>
              </div>
              <h1 className="text-responsive-h1 font-bold text-foreground mb-2">
                Hesap Oluştur
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Ücretsiz deneme ile başlayın
              </p>
            </div>

            <RegistrationForm onSuccess={handleRegistrationSuccess} />

            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Zaten hesabınız var mı? <span className="text-primary font-medium">Giriş Yap</span>
              </button>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 border-t border-border">
              <BenefitsSection />
              <SecurityFeatures />
            </div>
          </div>

          <TermsOfServiceModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
          <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        </div>
      </div>
    </>
  );
};

export default Register;