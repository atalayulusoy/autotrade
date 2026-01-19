import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const WebhookConfigPanel = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userWebhook, setUserWebhook] = useState(null);
  const [editingWebhook, setEditingWebhook] = useState(false);
  const [webhookFormData, setWebhookFormData] = useState({
    webhook_url: '',
    is_active: true
  });
  const [testPayload, setTestPayload] = useState({
    user_id: '',
    symbol: 'BTC/USDT',
    signal_type: 'BUY',
    price: 45000,
    amount_usdt: 20
  });
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const webhookEndpoint = `${supabaseUrl}/functions/v1/tradingview-webhook`;
      setWebhookUrl(webhookEndpoint);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserWebhook(selectedUserId);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('id, full_name, email')
        ?.order('full_name');

      if (error) throw error;
      setUsers(data || []);
      
      if (data?.length > 0) {
        setSelectedUserId(data?.[0]?.id);
        setTestPayload(prev => ({ ...prev, user_id: data?.[0]?.id }));
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadUserWebhook = async (userId) => {
    try {
      const { data, error } = await supabase
        ?.from('user_webhooks')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      setUserWebhook(data || null);
      if (data) {
        setWebhookFormData({
          webhook_url: data?.webhook_url || '',
          is_active: data?.is_active ?? true
        });
      } else {
        setWebhookFormData({
          webhook_url: '',
          is_active: true
        });
      }
    } catch (err) {
      console.error('Error loading webhook:', err);
      setUserWebhook(null);
    }
  };

  const regenerateWebhookToken = async () => {
    if (!selectedUserId) return;

    const confirm = window.confirm('Webhook token yenilenecek. Eski token geçersiz olacak. Devam edilsin mi?');
    if (!confirm) return;

    try {
      setLoading(true);
      const newToken = `wh_${Math.random()?.toString(36)?.substring(2, 15)}${Math.random()?.toString(36)?.substring(2, 15)}`;
      const newWebhookUrl = `${webhookUrl}?token=${newToken}`;

      const { error } = await supabase
        ?.from('user_webhooks')
        ?.upsert({
          user_id: selectedUserId,
          webhook_token: newToken,
          webhook_url: newWebhookUrl,
          is_active: true,
          updated_at: new Date()?.toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      await loadUserWebhook(selectedUserId);
      alert('Webhook token başarıyla yenilendi!');
    } catch (err) {
      alert('Token yenileme hatası: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWebhook = async () => {
    if (!selectedUserId || !userWebhook) return;

    try {
      setLoading(true);
      const { error } = await supabase
        ?.from('user_webhooks')
        ?.update({
          webhook_url: webhookFormData?.webhook_url,
          is_active: webhookFormData?.is_active,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('user_id', selectedUserId);

      if (error) throw error;
      await loadUserWebhook(selectedUserId);
      setEditingWebhook(false);
      alert('Webhook başarıyla güncellendi!');
    } catch (err) {
      alert('Webhook güncelleme hatası: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    if (!userWebhook?.webhook_url) {
      alert('Webhook URL bulunamadı');
      return;
    }

    try {
      setLoading(true);
      setTestResult(null);

      const response = await fetch(userWebhook?.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const result = await response?.json();
      setTestResult({
        success: response?.ok,
        status: response?.status,
        data: result
      });
    } catch (err) {
      setTestResult({
        success: false,
        error: err?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator?.clipboard?.writeText(text);
    alert('Panoya kopyalandı!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Webhook Yönetimi</h2>
        <Button onClick={loadUsers} variant="outline" size="sm">
          <Icon name="RefreshCw" size={16} />
        </Button>
      </div>

      {/* User Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Kullanıcı Seç</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e?.target?.value)}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
        >
          {users?.map((user) => (
            <option key={user?.id} value={user?.id}>
              {user?.full_name} ({user?.email})
            </option>
          ))}
        </select>
      </div>

      {/* Webhook Configuration */}
      {userWebhook ? (
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Webhook Bilgileri</h3>
            <div className="flex gap-2">
              {editingWebhook ? (
                <>
                  <Button onClick={updateWebhook} size="sm" loading={loading}>
                    <Icon name="Save" size={14} className="mr-1" />
                    Kaydet
                  </Button>
                  <Button onClick={() => setEditingWebhook(false)} variant="outline" size="sm">
                    İptal
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditingWebhook(true)} variant="outline" size="sm">
                  <Icon name="Edit" size={14} className="mr-1" />
                  Düzenle
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Webhook Token</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userWebhook?.webhook_token || ''}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 font-mono text-sm"
              />
              <Button onClick={() => copyToClipboard(userWebhook?.webhook_token)} variant="outline" size="sm">
                <Icon name="Copy" size={14} />
              </Button>
              <Button onClick={regenerateWebhookToken} variant="outline" size="sm" loading={loading}>
                <Icon name="RefreshCw" size={14} />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Webhook URL</label>
            {editingWebhook ? (
              <input
                type="text"
                value={webhookFormData?.webhook_url}
                onChange={(e) => setWebhookFormData(prev => ({ ...prev, webhook_url: e?.target?.value }))}
                className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 font-mono text-sm"
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userWebhook?.webhook_url || ''}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 font-mono text-sm"
                />
                <Button onClick={() => copyToClipboard(userWebhook?.webhook_url)} variant="outline" size="sm">
                  <Icon name="Copy" size={14} />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editingWebhook ? webhookFormData?.is_active : userWebhook?.is_active}
              onChange={(e) => editingWebhook && setWebhookFormData(prev => ({ ...prev, is_active: e?.target?.checked }))}
              disabled={!editingWebhook}
              className="w-4 h-4"
            />
            <label className="text-sm text-slate-300">Webhook Aktif</label>
          </div>

          <div className="text-xs text-slate-400">
            Son kullanım: {userWebhook?.last_used_at ? new Date(userWebhook?.last_used_at)?.toLocaleString('tr-TR') : 'Henüz kullanılmadı'}
          </div>
        </div>
      ) : (
        <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600 text-center">
          <Icon name="Webhook" size={48} className="text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">Bu kullanıcı için webhook oluşturulmamış</p>
          <Button onClick={regenerateWebhookToken} loading={loading}>
            <Icon name="Plus" size={14} className="mr-1" />
            Webhook Oluştur
          </Button>
        </div>
      )}

      {/* Test Webhook */}
      {userWebhook && (
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 space-y-4">
          <h3 className="text-lg font-semibold text-white">Webhook Test</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Symbol"
              value={testPayload?.symbol}
              onChange={(e) => setTestPayload(prev => ({ ...prev, symbol: e?.target?.value }))}
            />
            <Input
              label="Signal Type"
              value={testPayload?.signal_type}
              onChange={(e) => setTestPayload(prev => ({ ...prev, signal_type: e?.target?.value }))}
            />
            <Input
              label="Price"
              type="number"
              value={testPayload?.price}
              onChange={(e) => setTestPayload(prev => ({ ...prev, price: parseFloat(e?.target?.value) }))}
            />
            <Input
              label="Amount USDT"
              type="number"
              value={testPayload?.amount_usdt}
              onChange={(e) => setTestPayload(prev => ({ ...prev, amount_usdt: parseFloat(e?.target?.value) }))}
            />
          </div>

          <Button onClick={testWebhook} loading={loading} fullWidth>
            <Icon name="Send" size={14} className="mr-1" />
            Test Gönder
          </Button>

          {testResult && (
            <div className={`p-3 rounded-lg border ${
              testResult?.success ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name={testResult?.success ? 'CheckCircle' : 'XCircle'} size={16} className={testResult?.success ? 'text-green-400' : 'text-red-400'} />
                <span className={`font-medium ${testResult?.success ? 'text-green-400' : 'text-red-400'}`}>
                  {testResult?.success ? 'Başarılı' : 'Hata'}
                </span>
                {testResult?.status && (
                  <span className="text-xs text-slate-400">Status: {testResult?.status}</span>
                )}
              </div>
              <pre className="text-xs text-slate-300 bg-slate-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(testResult?.data || testResult?.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebhookConfigPanel;