import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import VerificationQueue from './components/VerificationQueue';
import VerificationDetails from './components/VerificationDetails';
import AuditLog from './components/AuditLog';

const AdminApiVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingKeys, setPendingKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/admin-login');
      return;
    }

    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('role')
        ?.eq('id', user?.id)
        ?.single();

      if (error) throw error;

      if (data?.role !== 'admin') {
        navigate('/admin-login');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/admin-login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load pending API keys
      const { data: keysData, error: keysError } = await supabase
        ?.from('exchange_api_keys')
        ?.select(`
          *,
          user_profiles (full_name, email)
        `)
        ?.order('created_at', { ascending: false });

      if (keysError) throw keysError;

      // Calculate stats
      const allKeys = keysData || [];
      setStats({
        pending: allKeys?.filter(k => k?.verification_status === 'pending')?.length,
        approved: allKeys?.filter(k => k?.verification_status === 'approved')?.length,
        rejected: allKeys?.filter(k => k?.verification_status === 'rejected')?.length,
        total: allKeys?.length
      });

      setPendingKeys(allKeys?.filter(k => k?.verification_status === 'pending'));

      // Load audit logs
      const { data: logsData, error: logsError } = await supabase
        ?.from('activity_logs')
        ?.select('*')
        ?.in('action_type', ['api_key_approved', 'api_key_rejected'])
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (logsError) throw logsError;
      setAuditLogs(logsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (keyId, status, notes) => {
    try {
      const { error } = await supabase
        ?.from('exchange_api_keys')
        ?.update({
          verification_status: status,
          verified_by: user?.id,
          verified_at: new Date()?.toISOString(),
          verification_notes: notes
        })
        ?.eq('id', keyId);

      if (error) throw error;

      // Log the verification action
      await supabase
        ?.from('activity_logs')
        ?.insert({
          user_id: user?.id,
          action_type: status === 'approved' ? 'api_key_approved' : 'api_key_rejected',
          action_description: `API anahtarı ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
          metadata: {
            api_key_id: keyId,
            status,
            notes
          }
        });

      setSelectedKey(null);
      await loadData();
      alert(`API anahtarı ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`);
    } catch (error) {
      console.error('Error verifying API key:', error);
      alert('İşlem başarısız: ' + error?.message);
    }
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

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group"
          >
            <Icon name="ArrowLeft" size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Geri Dön</span>
          </button>

          {/* Header */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg">
                <Icon name="ShieldCheck" size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">API Anahtar Doğrulama</h1>
                <p className="text-slate-400 text-sm">Kullanıcı API anahtarlarını inceleyin ve onaylayın</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-900/50 p-2 rounded-lg">
                  <Icon name="Clock" size={20} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.pending}</p>
                  <p className="text-xs text-slate-400">Bekleyen</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="bg-green-900/50 p-2 rounded-lg">
                  <Icon name="CheckCircle" size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.approved}</p>
                  <p className="text-xs text-slate-400">Onaylanan</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="bg-red-900/50 p-2 rounded-lg">
                  <Icon name="XCircle" size={20} className="text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.rejected}</p>
                  <p className="text-xs text-slate-400">Reddedilen</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900/50 p-2 rounded-lg">
                  <Icon name="Database" size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats?.total}</p>
                  <p className="text-xs text-slate-400">Toplam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verification Queue */}
            <div className="lg:col-span-2">
              <VerificationQueue
                pendingKeys={pendingKeys}
                onSelectKey={setSelectedKey}
                selectedKeyId={selectedKey?.id}
              />
            </div>

            {/* Verification Details */}
            <div>
              {selectedKey ? (
                <VerificationDetails
                  apiKey={selectedKey}
                  onVerify={handleVerify}
                  onClose={() => setSelectedKey(null)}
                />
              ) : (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
                  <Icon name="MousePointerClick" size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Detayları görmek için bir API anahtarı seçin</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Log */}
          <AuditLog logs={auditLogs} />
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminApiVerification;