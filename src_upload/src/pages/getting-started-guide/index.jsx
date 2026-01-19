import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import StepProgress from './components/StepProgress';
import VideoTutorial from './components/VideoTutorial';
import ApiIntegrationForm from './components/ApiIntegrationForm';
import DemoModeGuide from './components/DemoModeGuide';
import RealModeActivation from './components/RealModeActivation';

const GettingStartedGuide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [userProgress, setUserProgress] = useState(null);

  const steps = [
    { id: 1, title: 'API Anahtarı Alma', icon: 'Key', description: 'Borsanızdan API anahtarı alın' },
    { id: 2, title: 'API Entegrasyonu', icon: 'Link', description: 'API anahtarınızı sisteme ekleyin' },
    { id: 3, title: 'Demo Mod Testi', icon: 'TestTube', description: 'Sanal para ile test edin' },
    { id: 4, title: 'Gerçek Mod Aktivasyonu', icon: 'DollarSign', description: 'Gerçek işlemlere başlayın' }
  ];

  const exchanges = [
    { id: 'Binance', name: 'Binance', icon: 'TrendingUp', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', color: 'from-yellow-600 to-orange-600' },
    { id: 'OKX', name: 'OKX', icon: 'Zap', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', color: 'from-blue-600 to-cyan-600' },
    { id: 'Bybit', name: 'Bybit', icon: 'Activity', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', color: 'from-purple-600 to-pink-600' },
    { id: 'Gate.io', name: 'Gate.io', icon: 'Shield', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', color: 'from-green-600 to-emerald-600' },
    { id: 'BTCTURK', name: 'BTCTURK', icon: 'DollarSign', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', color: 'from-red-600 to-rose-600' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserProgress();
  }, [user, navigate]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      
      // Check if user has API keys
      const { data: apiKeys, error: apiError } = await supabase
        ?.from('exchange_api_keys')
        ?.select('*')
        ?.eq('user_id', user?.id);

      if (apiError) throw apiError;

      // Determine completed steps based on user data
      const completed = [];
      if (apiKeys?.length > 0) {
        completed?.push(2); // API Integration completed
        const hasTestMode = apiKeys?.some(k => k?.mode === 'TEST');
        const hasRealMode = apiKeys?.some(k => k?.mode === 'REAL' && k?.verification_status === 'approved');
        
        if (hasTestMode) completed?.push(3); // Demo mode
        if (hasRealMode) completed?.push(4); // Real mode
      }

      setCompletedSteps(completed);
      
      // Set current step to first incomplete step
      if (completed?.length === 0) {
        setCurrentStep(1);
      } else if (!completed?.includes(2)) {
        setCurrentStep(2);
      } else if (!completed?.includes(3)) {
        setCurrentStep(3);
      } else if (!completed?.includes(4)) {
        setCurrentStep(4);
      } else {
        setCurrentStep(4); // All completed
      }

      setUserProgress({ apiKeys });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepId) => {
    if (!completedSteps?.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    // Move to next step
    if (stepId < 4) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleExchangeSelect = (exchange) => {
    setSelectedExchange(exchange);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Yükleniyor...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg">
                <Icon name="BookOpen" size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Başlangıç Rehberi</h1>
                <p className="text-slate-400 text-sm">Adım adım kurulum ve test süreci</p>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <StepProgress 
            steps={steps} 
            currentStep={currentStep} 
            completedSteps={completedSteps}
            onStepClick={setCurrentStep}
          />

          {/* Step Content */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Key" size={24} className="text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">Adım 1: API Anahtarı Alma</h2>
                </div>
                <p className="text-slate-300 mb-6">
                  İşlem yapmak istediğiniz borsadan API anahtarı almanız gerekiyor. Aşağıdaki videolardan borsanızı seçin ve adımları takip edin.
                </p>

                {/* Exchange Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {exchanges?.map((exchange) => (
                    <button
                      key={exchange?.id}
                      onClick={() => handleExchangeSelect(exchange)}
                      className={`bg-slate-700/30 rounded-lg p-4 border-2 transition-all hover:bg-slate-700/50 ${
                        selectedExchange?.id === exchange?.id ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <div className={`bg-gradient-to-br ${exchange?.color} p-3 rounded-lg w-fit mb-3`}>
                        <Icon name={exchange?.icon} size={24} className="text-white" />
                      </div>
                      <h3 className="text-white font-semibold">{exchange?.name}</h3>
                      <p className="text-slate-400 text-sm">Video rehber izle</p>
                    </button>
                  ))}
                </div>

                {/* Video Tutorial */}
                {selectedExchange && (
                  <VideoTutorial exchange={selectedExchange} />
                )}

                {/* Help Section */}
                <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      <p className="font-semibold mb-2">Önemli Notlar:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>API anahtarı oluştururken "Spot Trading" iznini aktif edin</li>
                        <li>IP kısıtlaması koymayın veya sunucu IP'sini ekleyin</li>
                        <li>API Secret'ı güvenli bir yere kaydedin (bir daha gösterilmez)</li>
                        <li>Withdrawal (para çekme) iznini vermeyin</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleStepComplete(1)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2"
                  >
                    API Anahtarımı Aldım
                    <Icon name="ArrowRight" size={20} />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <ApiIntegrationForm 
                exchanges={exchanges}
                onComplete={() => handleStepComplete(2)}
                onRefresh={loadUserProgress}
              />
            )}

            {currentStep === 3 && (
              <DemoModeGuide 
                userProgress={userProgress}
                onComplete={() => handleStepComplete(3)}
              />
            )}

            {currentStep === 4 && (
              <RealModeActivation 
                userProgress={userProgress}
                onComplete={() => handleStepComplete(4)}
              />
            )}
          </div>

          {/* Completion Status */}
          {completedSteps?.length === 4 && (
            <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-full">
                  <Icon name="CheckCircle" size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Tebrikler! Kurulum Tamamlandı</h3>
                  <p className="text-green-200">Artık trading botunuzu kullanmaya başlayabilirsiniz.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/trading-dashboard')}
                className="mt-4 bg-white text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all flex items-center gap-2"
              >
                İşlem Paneline Git
                <Icon name="ArrowRight" size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default GettingStartedGuide;