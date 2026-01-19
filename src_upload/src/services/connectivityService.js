import { supabase } from '../lib/supabase';

export const connectivityService = {
  // Get all exchange API keys with connectivity status
  async getExchangeConnectivity(userId) {
    const { data, error } = await supabase?.from('exchange_api_keys')?.select('*')?.eq('user_id', userId)?.order('exchange');

    if (error) throw error;
    
    return data?.map(key => ({
      id: key?.id,
      exchange: key?.exchange,
      connectionStatus: key?.connection_status,
      lastConnectionTest: key?.last_connection_test,
      isActive: key?.is_active,
      mode: key?.mode,
    }));
  },

  // Test exchange connection
  async testConnection(apiKeyId) {
    // This would call the actual exchange API to test connectivity
    // For now, we'll simulate the test
    const { data, error } = await supabase?.from('exchange_api_keys')?.update({
        last_connection_test: new Date()?.toISOString(),
        connection_status: Math.random() > 0.1 ? 'success' : 'failed',
      })?.eq('id', apiKeyId)?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Subscribe to connectivity changes
  subscribeToConnectivityChanges(userId, callback) {
    const channel = supabase?.channel('connectivity-changes')?.on('postgres_changes',
        {
          event: 'UPDATE',schema: 'public',table: 'exchange_api_keys',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload?.new);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  },
};