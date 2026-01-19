import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import VerificationQueue from '../admin-api-verification/components/VerificationQueue';
import VerificationDetails from '../admin-api-verification/components/VerificationDetails';
import ConnectionTestPanel from './components/ConnectionTestPanel';
import ModeSelectionPanel from './components/ModeSelectionPanel';
import AuditLog from '../admin-api-verification/components/AuditLog';

const ApiKeyVerificationCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allKeys, setAllKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // pending, all, testing
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

      // Load all API keys with user profiles
      const { data: keysData, error: keysError } = await supabase
        ?.from('exchange_api_keys')
        ?.select(`
          *,
          user_profiles (full_name, email)
        `)
        ?.order('created_at', { ascending: false });

      if (keysError) throw keysError;

      // Calculate stats
      const allKeysData = keysData || [];
      setStats({
        pending: allKeysData?.filter(k => k?.verification_status === 'pending')?.length,
        approved: allKeysData?.filter(k => k?.verification_status === 'approved')?.length,
        rejected: allKeysData?.filter(k => k?.verification_status === 'rejected')?.length,
        total: allKeysData?.length
      });

      setAllKeys(allKeysData);

      // Load audit logs
      const { data: logsData, error: logsError } = await supabase
        ?.from('activity_logs')
        ?.select('*')
        ?.in('action_type', ['api_key_approved', 'api_key_rejected', 'api_key_tested'])
        ?.order('created_at', { ascending: false })
        ?.limit(50);

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

  const handleTestConnection = async (keyId) => {
    try {
      // Simulate connection test (in real implementation, this would call the exchange API)
      const testResult = Math.random() > 0.2 ? 'success' : 'failed';
      
      const { error } = await supabase
        ?.from('exchange_api_keys')
        ?.update({
          last_connection_test: new Date()?.toISOString(),
          connection_status: testResult
        })
        ?.eq('id', keyId);

      if (error) throw error;

      // Log the test action
      await supabase
        ?.from('activity_logs')
        ?.insert({
          user_id: user?.id,
          action_type: 'api_key_tested',
          action_description: `API bağlantı testi: ${testResult}`,
          metadata: {
            api_key_id: keyId,
            test_result: testResult
          }
        });

      await loadData();
      alert(`Bağlantı testi: ${testResult === 'success' ? 'Başarılı' : 'Başarısız'}`);
    } catch (error) {
      console.error('Error testing connection:', error);
      alert('Test başarısız: ' + error?.message);
    }
  };

  const handleModeChange = async (keyId, newMode) => {
    try {
      const { error } = await supabase
        ?.from('exchange_api_keys')
        ?.update({
          mode: newMode,
          verification_status: newMode === 'REAL' ? 'pending' : 'approved'
        })
        ?.eq('id', keyId);

      if (error) throw error;

      await supabase
        ?.from('activity_logs')
        ?.insert({
          user_id: user?.id,
          action_type: 'mode_changed',
          action_description: `İşlem modu ${newMode} olarak değiştirildi`,
          metadata: {
            api_key_id: keyId,
            new_mode: newMode
          }
        });

      await loadData();
      alert(`İşlem modu ${newMode} olarak güncellendi`);
    } catch (error) {
      console.error('Error changing mode:', error);
      alert('Mod değiştirme başarısız: ' + error?.message);
    }
  };

  const getFilteredKeys = () => {
    if (activeTab === 'pending') {
      return allKeys?.filter(k => k?.verification_status === 'pending');
    }
    return allKeys;
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
          {/* Header */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg">
                <Icon name="ShieldCheck" size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">API Doğrulama Merkezi</h1>
                <p className="text-slate-400 text-sm">Kullanıcı API anahtarlarını test edin ve yönetin</p>
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

          {/* Tabs */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-slate-700/50 flex gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'pending' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon name="Clock" size={16} className="inline mr-2" />
              Bekleyen
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon name="List" size={16} className="inline mr-2" />
              Tümü
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'testing' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon name="Activity" size={16} className="inline mr-2" />
              Test Araçları
            </button>
          </div>

          {/* Main Content */}
          {activeTab === 'testing' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConnectionTestPanel 
                apiKeys={allKeys}
                onTestConnection={handleTestConnection}
              />
              <ModeSelectionPanel 
                apiKeys={allKeys}
                onModeChange={handleModeChange}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Verification Queue */}
              <div className="lg:col-span-2">
                <VerificationQueue
                  apiKeys={getFilteredKeys()}
                  pendingKeys={getFilteredKeys()}
                  onSelectKey={setSelectedKey}
                  selectedKeyId={selectedKey?.id}
                  showAllStatuses={activeTab === 'all'}
                />
              </div>

              {/* Verification Details */}
              <div>
                {selectedKey ? (
                  <VerificationDetails
                    apiKey={selectedKey}
                    onVerify={handleVerify}
                    onTestConnection={handleTestConnection}
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
          )}

          {/* Audit Log */}
          <AuditLog logs={auditLogs} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ApiKeyVerificationCenter;