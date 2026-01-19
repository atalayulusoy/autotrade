import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { MessageCircle, Users, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import RoomList from './components/RoomList';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import RoomMembers from './components/RoomMembers';
import MessageFilters from './components/MessageFilters';

const LiveTradingChat = () => {
  const { userProfile } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);

  // Load messages when room changes
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom?.id);
      loadMembers(selectedRoom?.id);
      joinRoom(selectedRoom?.id);
    }
  }, [selectedRoom]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedRoom) return;

    const unsubscribe = chatService?.subscribeToMessages(
      selectedRoom?.id,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      }
    );

    return () => unsubscribe();
  }, [selectedRoom]);

  // Subscribe to room updates
  useEffect(() => {
    const unsubscribe = chatService?.subscribeToRoomUpdates((updatedRoom) => {
      setRooms(prev => prev?.map(room => 
        room?.id === updatedRoom?.id 
          ? { ...room, activeUsersCount: updatedRoom?.activeUsersCount, totalMessagesCount: updatedRoom?.totalMessagesCount }
          : room
      ));
    });

    return () => unsubscribe();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await chatService?.getChatRooms();
      setRooms(data);
      if (data?.length > 0) {
        setSelectedRoom(data?.[0]);
      }
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const data = await chatService?.getRoomMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const loadMembers = async (roomId) => {
    try {
      const data = await chatService?.getRoomMembers(roomId);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      await chatService?.joinRoom(roomId);
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };

  const handleSendMessage = async (content, messageType = 'text', metadata = null) => {
    try {
      await chatService?.sendMessage(selectedRoom?.id, content, messageType, metadata);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleRoomSelect = (room) => {
    if (selectedRoom) {
      chatService?.leaveRoom(selectedRoom?.id);
    }
    setSelectedRoom(room);
  };

  const filteredMessages = messages?.filter(msg => {
    if (messageFilter === 'signals' && msg?.messageType !== 'signal') return false;
    if (messageFilter === 'charts' && msg?.messageType !== 'chart') return false;
    if (messageFilter === 'strategies' && msg?.messageType !== 'strategy') return false;
    if (searchQuery && !msg?.content?.toLowerCase()?.includes(searchQuery?.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Sohbet odaları yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Hata: {error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
              Canlı Trading Sohbet
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Trader'larla stratejileri tartışın, sinyalleri paylaşın ve gerçek zamanlı işbirliği yapın
            </p>
          </div>
        </div>

        {/* Three-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel - Room List */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)] overflow-y-auto">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Sohbet Odaları
              </h2>
              <RoomList 
                rooms={rooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
              />
            </div>
          </div>

          {/* Center Panel - Messages */}
          <div className="lg:col-span-6">
            <div className="bg-card rounded-lg border border-border h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)] flex flex-col">
              {/* Room Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedRoom?.roomName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{selectedRoom?.activeUsersCount} aktif</span>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <MessageFilters 
                    activeFilter={messageFilter}
                    onFilterChange={setMessageFilter}
                  />
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Mesajlarda ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e?.target?.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <MessageList 
                  messages={filteredMessages}
                  currentUserId={userProfile?.id}
                />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <MessageInput onSendMessage={handleSendMessage} />
              </div>
            </div>
          </div>

          {/* Right Panel - Room Members */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border border-border p-4 h-[calc(100vh-16rem)] lg:h-[calc(100vh-12rem)] overflow-y-auto">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Katılımcılar ({members?.length})
              </h2>
              <RoomMembers members={members} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LiveTradingChat;