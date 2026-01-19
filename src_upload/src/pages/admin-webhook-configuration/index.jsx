import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const AdminWebhookConfiguration = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhooks, setWebhooks] = useState([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadWebhooks();
    }
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate('/login');
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
        await signOut();
        navigate('/login');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    } catch (error) {
      console.error('Admin check error:', error);
      navigate('/login');
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('id, full_name, email')
        ?.order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        ?.from('user_webhooks')
        ?.select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    }
  };

  const handleSaveWebhook = async () => {
    if (!selectedUserId || !webhookUrl) {
      alert('Lütfen kullanıcı ve webhook URL seçin');
      return;
    }

    try {
      const { error } = await supabase
        ?.from('user_webhooks')
        ?.upsert({
          user_id: selectedUserId,
          webhook_url: webhookUrl,
          is_active: true
        }, { onConflict: 'user_id' });

      if (error) throw error;
      alert('Webhook kaydedildi!');
      setSelectedUserId('');
      setWebhookUrl('');
      loadWebhooks();
    } catch (error) {
      console.error('Error saving webhook:', error);
      alert('Webhook kaydedilemedi: ' + error?.message);
    }
  };

  const handleTestWebhook = async (webhookUrl) => {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, message: 'Test webhook from admin' })
      });

      if (response?.ok) {
        alert('Webhook testi başarılı!');
      } else {
        alert('Webhook testi başarısız: ' + response?.statusText);
      }
    } catch (error) {
      alert('Webhook testi başarısız: ' + error?.message);
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    if (!confirm('Bu webhook\'u silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        ?.from('user_webhooks')
        ?.delete()
        ?.eq('id', webhookId);

      if (error) throw error;
      alert('Webhook silindi!');
      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Webhook silinemedi: ' + error?.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="card-mobile">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
            >
              <Icon name="ArrowLeft" size={20} color="#ffffff" />
            </button>
            <div className="bg-gradient-to-br from-teal-600 to-cyan-600 p-3 rounded-lg">
              <Icon name="Webhook" size={24} color="#ffffff" />
            </div>
            <div>
              <h1 className="text-responsive-h1 font-bold text-foreground">Webhook Yapılandırması</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Kullanıcı webhook ayarları</p>
            </div>
          </div>
        </div>

        <div className="card-mobile">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Yeni Webhook Ekle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Kullanıcı Seç</label>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e?.target?.value)}
                className="w-full"
              >
                <option value="">Kullanıcı seçin...</option>
                {users?.map((user) => (
                  <option key={user?.id} value={user?.id}>
                    {user?.full_name} ({user?.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Webhook URL</label>
              <Input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e?.target?.value)}
                placeholder="https://example.com/webhook"
                className="w-full"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveWebhook}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Webhook Kaydet
          </Button>
        </div>

        <div className="card-mobile">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Mevcut Webhook'lar</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Webhook URL</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Durum</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {webhooks?.map((webhook) => (
                  <tr key={webhook?.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{webhook?.user_profiles?.full_name}</p>
                        <p className="text-xs text-slate-400">{webhook?.user_profiles?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-sm font-mono break-all">
                        {webhook?.webhook_url}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          webhook?.is_active
                            ? 'bg-green-500/20 text-green-400' :'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {webhook?.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleTestWebhook(webhook?.webhook_url)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                        >
                          Test
                        </Button>
                        <Button
                          onClick={() => handleDeleteWebhook(webhook?.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminWebhookConfiguration;