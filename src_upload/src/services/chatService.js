import { supabase } from '../lib/supabase';

export const chatService = {
  // Get all chat rooms
  async getChatRooms() {
    try {
      const { data, error } = await supabase?.from('chat_rooms')?.select('*')?.eq('is_active', true)?.order('updated_at', { ascending: false });

      if (error) throw error;

      return data?.map(room => ({
        id: room?.id,
        roomName: room?.room_name,
        roomType: room?.room_type,
        tradingPair: room?.trading_pair,
        description: room?.description,
        activeUsersCount: room?.active_users_count,
        totalMessagesCount: room?.total_messages_count,
        createdBy: room?.created_by,
        isActive: room?.is_active,
        createdAt: room?.created_at,
        updatedAt: room?.updated_at
      }));
    } catch (error) {
      return [
        {
          id: 'global-room',
          roomName: 'Genel Sohbet',
          roomType: 'public',
          tradingPair: 'ALL',
          description: 'Tüm kullanıcıların katılabileceği genel sohbet odası',
          activeUsersCount: 0,
          totalMessagesCount: 0,
          createdBy: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  },

  // Get messages for a room
  async getRoomMessages(roomId, limit = 50) {
    const { data, error } = await supabase?.from('chat_messages')?.select(`
        *,
        user_profiles!chat_messages_user_id_fkey (
          full_name,
          email
        )
      `)?.eq('room_id', roomId)?.eq('is_deleted', false)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;

    return data?.map(msg => ({
      id: msg?.id,
      roomId: msg?.room_id,
      userId: msg?.user_id,
      messageType: msg?.message_type,
      content: msg?.content,
      metadata: msg?.metadata,
      isEdited: msg?.is_edited,
      editedAt: msg?.edited_at,
      isDeleted: msg?.is_deleted,
      deletedAt: msg?.deleted_at,
      createdAt: msg?.created_at,
      userProfile: msg?.user_profiles ? {
        fullName: msg?.user_profiles?.full_name,
        email: msg?.user_profiles?.email
      } : null
    }))?.reverse();
  },

  // Send a message
  async sendMessage(roomId, content, messageType = 'text', metadata = null) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('chat_messages')?.insert({
        room_id: roomId,
        user_id: user?.id,
        message_type: messageType,
        content: content,
        metadata: metadata
      })?.select()?.single();

    if (error) throw error;

    return {
      id: data?.id,
      roomId: data?.room_id,
      userId: data?.user_id,
      messageType: data?.message_type,
      content: data?.content,
      metadata: data?.metadata,
      createdAt: data?.created_at
    };
  },

  // Join a room
  async joinRoom(roomId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase?.from('room_memberships')?.upsert({
        room_id: roomId,
        user_id: user?.id,
        is_online: true,
        last_seen_at: new Date()?.toISOString()
      }, {
        onConflict: 'room_id,user_id'
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Leave a room
  async leaveRoom(roomId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase?.from('room_memberships')?.update({
        is_online: false,
        last_seen_at: new Date()?.toISOString()
      })?.eq('room_id', roomId)?.eq('user_id', user?.id);

    if (error) throw error;
  },

  // Get room members
  async getRoomMembers(roomId) {
    const { data, error } = await supabase?.from('room_memberships')?.select(`
        *,
        user_profiles!room_memberships_user_id_fkey (
          full_name,
          email
        )
      `)?.eq('room_id', roomId)?.order('is_online', { ascending: false });

    if (error) throw error;

    return data?.map(member => ({
      id: member?.id,
      roomId: member?.room_id,
      userId: member?.user_id,
      isOnline: member?.is_online,
      lastSeenAt: member?.last_seen_at,
      joinedAt: member?.joined_at,
      userProfile: member?.user_profiles ? {
        fullName: member?.user_profiles?.full_name,
        email: member?.user_profiles?.email
      } : null
    }));
  },

  // Subscribe to new messages in a room
  subscribeToMessages(roomId, callback) {
    const channel = supabase?.channel(`room-${roomId}`)?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Fetch user profile for the new message
          const { data: userProfile } = await supabase?.from('user_profiles')?.select('full_name, email')?.eq('id', payload?.new?.user_id)?.single();

          callback({
            id: payload?.new?.id,
            roomId: payload?.new?.room_id,
            userId: payload?.new?.user_id,
            messageType: payload?.new?.message_type,
            content: payload?.new?.content,
            metadata: payload?.new?.metadata,
            createdAt: payload?.new?.created_at,
            userProfile: userProfile ? {
              fullName: userProfile?.full_name,
              email: userProfile?.email
            } : null
          });
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  },

  // Subscribe to room updates
  subscribeToRoomUpdates(callback) {
    const channel = supabase?.channel('room-updates')?.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          callback({
            id: payload?.new?.id,
            activeUsersCount: payload?.new?.active_users_count,
            totalMessagesCount: payload?.new?.total_messages_count,
            updatedAt: payload?.new?.updated_at
          });
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }
};
