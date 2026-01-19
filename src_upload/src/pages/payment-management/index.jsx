import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';

import SubscriptionPlans from './components/SubscriptionPlans';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import TransactionHistory from './components/TransactionHistory';
import FreeTrialBanner from './components/FreeTrialBanner';

const PaymentManagement = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plans');
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [plansResult, paymentsResult] = await Promise.all([
        supabase?.from('subscription_plans')?.select('*')?.eq('is_active', true)?.order('price_monthly', { ascending: true }),
        supabase?.from('payments')?.select('*')?.eq('user_id', user?.id)?.order('created_at', { ascending: false })
      ]);

      if (plansResult?.data) setSubscriptionPlans(plansResult?.data);
      if (paymentsResult?.data) setPayments(paymentsResult?.data);
    } catch (error) {
      console.error('Data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTrialActive = userProfile?.subscription_plan === 'free_trial' && 
    new Date(userProfile?.trial_end_date) > new Date();

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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-lg">
                <Icon name="CreditCard" size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Ödeme Yönetimi</h1>
                <p className="text-slate-400 text-sm">Abonelik ve Ödeme İşlemleri</p>
              </div>
            </div>
          </div>

          {/* Free Trial Banner */}
          {isTrialActive && <FreeTrialBanner trialEndDate={userProfile?.trial_end_date} />}

          {/* Current Subscription Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Mevcut Paket</p>
                <p className="text-white text-xl font-bold">
                  {userProfile?.subscription_plan === 'free_trial' ? '7 Günlük Ücretsiz Deneme' :
                   userProfile?.subscription_plan === 'basic' ? 'Temel Paket' :
                   userProfile?.subscription_plan === 'premium' ? 'Premium Paket' :
                   userProfile?.subscription_plan === 'enterprise' ? 'Elit Paket' : 'Paket Yok'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-1">Bakiye</p>
                <p className="text-green-400 text-xl font-bold">
                  {parseFloat(userProfile?.balance || 0)?.toFixed(2)} TL
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('plans')}
                className={`flex-1 min-w-[120px] px-4 py-3 font-medium transition-colors ${
                  activeTab === 'plans' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Package" size={18} />
                  <span>Paketler</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex-1 min-w-[120px] px-4 py-3 font-medium transition-colors ${
                  activeTab === 'payment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Wallet" size={18} />
                  <span>Ödeme Yap</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 min-w-[120px] px-4 py-3 font-medium transition-colors ${
                  activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon name="History" size={18} />
                  <span>İşlem Geçmişi</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
            {activeTab === 'plans' && <SubscriptionPlans plans={subscriptionPlans} currentPlan={userProfile?.subscription_plan} />}
            {activeTab === 'payment' && <PaymentMethodSelector onPaymentComplete={loadData} />}
            {activeTab === 'history' && <TransactionHistory payments={payments} />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentManagement;