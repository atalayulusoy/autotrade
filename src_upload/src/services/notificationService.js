import { supabase } from '../lib/supabase';

export const notificationService = {
  // Get user's notification preferences
  async getPreferences(userId) {
    const { data, error } = await supabase
      ?.from('notification_preferences')?.select('*')?.eq('user_id', userId)
      ?.maybeSingle();

    if (error) throw error;
    
    // Return default preferences if no row exists
    if (!data) {
      return {
        telegramEnabled: false,
        telegramChatId: null,
        emailEnabled: true,
        emailAddress: null,
        inAppEnabled: true,
        priceAlertsEnabled: true,
        pnlAlertsEnabled: true,
        connectivityAlertsEnabled: true,
        tradeAlertsEnabled: true,
      };
    }
    
    return {
      telegramEnabled: data?.telegram_enabled,
      telegramChatId: data?.telegram_chat_id,
      emailEnabled: data?.email_enabled,
      emailAddress: data?.email_address,
      inAppEnabled: data?.in_app_enabled,
      priceAlertsEnabled: data?.price_alerts_enabled,
      pnlAlertsEnabled: data?.pnl_alerts_enabled,
      connectivityAlertsEnabled: data?.connectivity_alerts_enabled,
      tradeAlertsEnabled: data?.trade_alerts_enabled,
    };
  },

  // Update notification preferences
  async updatePreferences(userId, preferences) {
    const { data, error } = await supabase
      ?.from('notification_preferences')
      ?.upsert({
        user_id: userId,
        telegram_enabled: preferences?.telegramEnabled,
        telegram_chat_id: preferences?.telegramChatId,
        email_enabled: preferences?.emailEnabled,
        email_address: preferences?.emailAddress,
        in_app_enabled: preferences?.inAppEnabled,
        price_alerts_enabled: preferences?.priceAlertsEnabled,
        pnl_alerts_enabled: preferences?.pnlAlertsEnabled,
        connectivity_alerts_enabled: preferences?.connectivityAlertsEnabled,
        trade_alerts_enabled: preferences?.tradeAlertsEnabled,
        updated_at: new Date()?.toISOString(),
      }, { onConflict: 'user_id' })
      ?.select()
      ?.single();

    if (error) throw error;
    return data;
  },

  // Get all price alerts for user
  async getPriceAlerts(userId) {
    const { data, error } = await supabase?.from('price_alerts')?.select('*')?.eq('user_id', userId)?.order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(alert => ({
      id: alert?.id,
      symbol: alert?.symbol,
      conditionType: alert?.condition_type,
      targetPrice: alert?.target_price,
      changePercentage: alert?.change_percentage,
      currentPrice: alert?.current_price,
      status: alert?.status,
      triggeredAt: alert?.triggered_at,
      triggeredPrice: alert?.triggered_price,
      notificationSent: alert?.notification_sent,
      createdAt: alert?.created_at,
    }));
  },

  // Create new price alert
  async createPriceAlert(userId, alertData) {
    const { data, error } = await supabase?.from('price_alerts')?.insert({
        user_id: userId,
        symbol: alertData?.symbol,
        condition_type: alertData?.conditionType,
        target_price: alertData?.targetPrice,
        change_percentage: alertData?.changePercentage,
        current_price: alertData?.currentPrice,
        status: 'active',
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Update price alert
  async updatePriceAlert(alertId, updates) {
    const { data, error } = await supabase?.from('price_alerts')?.update({
        target_price: updates?.targetPrice,
        change_percentage: updates?.changePercentage,
        current_price: updates?.currentPrice,
        status: updates?.status,
        updated_at: new Date()?.toISOString(),
      })?.eq('id', alertId)?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Delete price alert
  async deletePriceAlert(alertId) {
    const { error } = await supabase?.from('price_alerts')?.delete()?.eq('id', alertId);

    if (error) throw error;
  },

  // Get notification history
  async getNotificationHistory(userId, limit = 50) {
    const { data, error } = await supabase?.from('notification_history')?.select('*')?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;
    
    return data?.map(notification => ({
      id: notification?.id,
      notificationType: notification?.notification_type,
      channel: notification?.channel,
      title: notification?.title,
      message: notification?.message,
      metadata: notification?.metadata,
      status: notification?.status,
      sentAt: notification?.sent_at,
      readAt: notification?.read_at,
      errorMessage: notification?.error_message,
    }));
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const { error } = await supabase?.from('notification_history')?.update({
        status: 'read',
        read_at: new Date()?.toISOString(),
      })?.eq('id', notificationId);

    if (error) throw error;
  },

  // Get unread notification count
  async getUnreadCount(userId) {
    const { count, error } = await supabase?.from('notification_history')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId)?.eq('channel', 'in_app')?.eq('status', 'sent');

    if (error) throw error;
    return count || 0;
  },
};