import { supabase } from '../lib/supabase';

/**
 * Service for fetching real balance data from cryptocurrency exchanges
 * Uses Supabase Edge Function for server-side CCXT integration
 * Supports: OKX, Binance, Bybit, Gate.io, BTCTURK
 */

/**
 * Fetch balances from all user's connected exchanges via Edge Function
 */
export const fetchUserBalances = async (userId) => {
  try {
    const { data, error } = await supabase?.functions?.invoke('fetch-exchange-balances', {
      body: { userId }
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching user balances:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch balances',
      balances: []
    };
  }
};

/**
 * Calculate total portfolio value in USDT
 */
export const calculateTotalValue = (balances) => {
  let totalUSDT = 0;

  balances?.forEach(balance => {
    if (balance?.success && balance?.total) {
      Object.entries(balance?.total)?.forEach(([currency, amount]) => {
        if (currency === 'USDT' || currency === 'USD') {
          totalUSDT += parseFloat(amount) || 0;
        }
        // For other currencies, you would need price conversion
        // This is a simplified version
      });
    }
  });

  return totalUSDT;
};

/**
 * Format balance data for display
 */
export const formatBalanceData = (balances) => {
  return balances?.map(balance => {
    if (!balance?.success) {
      return {
        exchange: balance?.exchange,
        status: 'error',
        error: balance?.error,
        assets: []
      };
    }

    const assets = [];
    const total = balance?.total || {};
    const free = balance?.free || {};
    const used = balance?.used || {};

    Object.keys(total)?.forEach(currency => {
      const totalAmount = parseFloat(total?.[currency]) || 0;
      if (totalAmount > 0.00001) { // Filter out dust
        assets?.push({
          currency,
          total: totalAmount,
          free: parseFloat(free?.[currency]) || 0,
          used: parseFloat(used?.[currency]) || 0
        });
      }
    });

    return {
      exchange: balance?.exchange,
      status: 'success',
      assets: assets?.sort((a, b) => b?.total - a?.total),
      timestamp: balance?.timestamp
    };
  });
};
