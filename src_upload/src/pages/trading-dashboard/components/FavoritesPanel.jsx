import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FavoritesPanel = ({ onCoinSelect }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const popularCoins = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
    'ADA/USDT', 'AVAX/USDT', 'DOT/USDT', 'MATIC/USDT', 'LINK/USDT'
  ];

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        ?.from('user_favorites')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('display_order', { ascending: true });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (symbol) => {
    try {
      const maxOrder = favorites?.length > 0 ? Math.max(...favorites?.map(f => f?.display_order)) : 0;
      const { error } = await supabase
        ?.from('user_favorites')
        ?.insert({
          user_id: user?.id,
          symbol,
          display_order: maxOrder + 1
        });

      if (error) throw error;
      loadFavorites();
      setNewSymbol('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding favorite:', error);
      alert('Favori eklenemedi: ' + error?.message);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        ?.from('user_favorites')
        ?.delete()
        ?.eq('id', favoriteId);

      if (error) throw error;
      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Star" size={18} className="text-yellow-400" />
          <h3 className="font-semibold text-white">Favori Coinler</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
        >
          <Icon name="Plus" size={16} className="text-white" />
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Popüler Coinler:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {popularCoins?.map((coin) => (
              <button
                key={coin}
                onClick={() => addFavorite(coin)}
                disabled={favorites?.some(f => f?.symbol === coin)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {coin}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e?.target?.value?.toUpperCase())}
              placeholder="Örn: DOGE/USDT"
              className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <Button
              onClick={() => addFavorite(newSymbol)}
              disabled={!newSymbol || favorites?.some(f => f?.symbol === newSymbol)}
              size="sm"
            >
              Ekle
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-slate-400 text-sm">Yükleniyor...</div>
        ) : favorites?.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-sm">
            Henüz favori eklemediniz
          </div>
        ) : (
          favorites?.map((favorite) => (
            <div
              key={favorite?.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors group"
            >
              <button
                onClick={() => onCoinSelect?.(favorite?.symbol)}
                className="flex-1 text-left"
              >
                <span className="text-white font-medium">{favorite?.symbol}</span>
              </button>
              <button
                onClick={() => removeFavorite(favorite?.id)}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
              >
                <Icon name="X" size={14} className="text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoritesPanel;