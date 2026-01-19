import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationService } from '../../../services/notificationService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PriceAlertConfiguration = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    conditionType: 'above',
    targetPrice: '',
    currentPrice: '',
  });

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await notificationService?.getPriceAlerts(user?.id);
      setAlerts(data || []);
    } catch (err) {
      console.error('Error loading price alerts:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const coinOptions = [
    { value: 'BTC/USDT', label: 'Bitcoin (BTC)' },
    { value: 'ETH/USDT', label: 'Ethereum (ETH)' },
    { value: 'BNB/USDT', label: 'Binance Coin (BNB)' },
    { value: 'SOL/USDT', label: 'Solana (SOL)' },
    { value: 'XRP/USDT', label: 'Ripple (XRP)' }
  ];

  const conditionOptions = [
    { value: 'above', label: 'Price Above' },
    { value: 'below', label: 'Price Below' },
    { value: 'change_percentage', label: 'Change Percentage' }
  ];

  const handleCreateAlert = async () => {
    if (newAlert?.symbol && newAlert?.targetPrice) {
      try {
        setLoading(true);
        await notificationService?.createPriceAlert(user?.id, {
          symbol: newAlert?.symbol,
          conditionType: newAlert?.conditionType,
          targetPrice: parseFloat(newAlert?.targetPrice),
          currentPrice: parseFloat(newAlert?.currentPrice) || 0,
        });
        setNewAlert({ symbol: '', conditionType: 'above', targetPrice: '', currentPrice: '' });
        setShowCreateForm(false);
        loadAlerts();
      } catch (err) {
        console.error('Error creating alert:', err);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Bu uyarıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await notificationService?.deletePriceAlert(id);
      loadAlerts();
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError(err?.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date)?.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'triggered':
        return 'text-warning bg-warning/10';
      case 'expired':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  if (loading && alerts?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 md:p-6">
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">Price Alerts</h2>
          <p className="caption text-muted-foreground">
            Configure alerts for price movements and trading opportunities
          </p>
        </div>

        <Button
          variant="default"
          iconName="Plus"
          iconPosition="left"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          Create Alert
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {showCreateForm && (
        <div className="bg-muted rounded-lg p-4 md:p-6 mb-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Create New Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select
              label="Cryptocurrency"
              options={coinOptions}
              value={newAlert?.symbol}
              onChange={(value) => setNewAlert({ ...newAlert, symbol: value })}
              placeholder="Select coin"
            />

            <Select
              label="Condition"
              options={conditionOptions}
              value={newAlert?.conditionType}
              onChange={(value) => setNewAlert({ ...newAlert, conditionType: value })}
            />

            <Input
              label="Target Price (USDT)"
              type="number"
              placeholder="Enter price"
              value={newAlert?.targetPrice}
              onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e?.target?.value })}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="default" onClick={handleCreateAlert} disabled={loading}>
              {loading ? 'Creating...' : 'Create Alert'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="caption text-muted-foreground">Active Alerts</span>
            <Icon name="Bell" size={16} className="text-success" />
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {alerts?.filter(a => a?.status === 'active')?.length}
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="caption text-muted-foreground">Triggered Today</span>
            <Icon name="BellRing" size={16} className="text-warning" />
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {alerts?.filter(a => a?.status === 'triggered')?.length}
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="caption text-muted-foreground">Total Alerts</span>
            <Icon name="ListChecks" size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold text-foreground">{alerts?.length}</p>
        </div>
      </div>
      <div className="space-y-3">
        {alerts?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz fiyat uyarısı oluşturmadınız
          </div>
        ) : (
          alerts?.map((alert) => (
            <div
              key={alert?.id}
              className="bg-muted rounded-lg p-4 hover:bg-card transition-colors border border-border"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <span className="font-semibold text-primary">{alert?.symbol?.split('/')?.[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {alert?.symbol} Price Alert
                        </h3>
                        <span className={`caption px-2 py-1 rounded ${getStatusColor(alert?.status)}`}>
                          {alert?.status}
                        </span>
                      </div>
                      <p className="caption text-muted-foreground">
                        Notify when price is {alert?.conditionType} $
                        {alert?.targetPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={14} className="text-muted-foreground" />
                      <span className="caption text-muted-foreground">
                        Created: {formatDate(alert?.createdAt)}
                      </span>
                    </div>
                    {alert?.triggeredAt && (
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={14} className="text-warning" />
                        <span className="caption text-warning">
                          Triggered: {formatDate(alert?.triggeredAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    iconName="Trash2"
                    iconPosition="left"
                    onClick={() => handleDeleteAlert(alert?.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceAlertConfiguration;