import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import UserDetailsModal from './components/UserDetailsModal';

const AdminUserManagementHub = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    premiumUsers: 0
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
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
        ?.select(`
          *,
          exchange_api_keys (count),
          trading_operations (count),
          notification_preferences (telegram_chat_id)
        `)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
      
      // Calculate stats
      const totalUsers = data?.length || 0;
      const activeUsers = data?.filter(u => u?.is_active)?.length || 0;
      const verifiedUsers = data?.filter(u => u?.exchange_api_keys?.[0]?.count > 0)?.length || 0;
      const premiumUsers = data?.filter(u => u?.subscription_plan === 'premium' || u?.subscription_plan === 'enterprise')?.length || 0;
      
      setStats({
        totalUsers,
        activeUsers,
        verifiedUsers,
        premiumUsers
      });
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Kullanıcılar yüklenemedi: ' + error?.message);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!confirm(`Bu kullanıcıyı ${currentStatus ? 'devre dışı bırakmak' : 'aktif etmek'} istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const { error } = await supabase
        ?.from('user_profiles')
        ?.update({ is_active: !currentStatus })
        ?.eq('id', userId);

      if (error) throw error;
      await loadUsers();
      alert('Kullanıcı durumu güncellendi');
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Durum güncellenemedi: ' + error?.message);
    }
  };

  const filteredUsers = users?.filter(user => {
    const searchLower = searchTerm?.toLowerCase();
    const matchesSearch = 
      user?.full_name?.toLowerCase()?.includes(searchLower) ||
      user?.email?.toLowerCase()?.includes(searchLower);
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && user?.is_active) ||
      (filterStatus === 'inactive' && !user?.is_active);
    
    const matchesPlan = 
      filterPlan === 'all' ||
      user?.subscription_plan === filterPlan;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

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
      <div className="space-y-6">
        {/* Header */}
        <div className="card-mobile">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg">
                <Icon name="Users" size={24} color="#ffffff" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Kullanıcı Yönetim Merkezi
                </h1>
                <p className="text-sm text-muted-foreground">
                  Kapsamlı kullanıcı hesap yönetimi ve gözetimi
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin-dashboard')}
              className="flex items-center gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Geri Dön
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-mobile bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300 mb-1">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-white">{stats?.totalUsers}</p>
              </div>
              <div className="bg-blue-600/30 p-3 rounded-lg">
                <Icon name="Users" size={24} color="#60a5fa" />
              </div>
            </div>
          </div>

          <div className="card-mobile bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300 mb-1">Aktif Kullanıcı</p>
                <p className="text-3xl font-bold text-white">{stats?.activeUsers}</p>
              </div>
              <div className="bg-green-600/30 p-3 rounded-lg">
                <Icon name="UserCheck" size={24} color="#4ade80" />
              </div>
            </div>
          </div>

          <div className="card-mobile bg-gradient-to-br from-purple-900/30 to-purple-800/30 border-purple-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300 mb-1">Doğrulanmış</p>
                <p className="text-3xl font-bold text-white">{stats?.verifiedUsers}</p>
              </div>
              <div className="bg-purple-600/30 p-3 rounded-lg">
                <Icon name="ShieldCheck" size={24} color="#c084fc" />
              </div>
            </div>
          </div>

          <div className="card-mobile bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-orange-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300 mb-1">Premium Üye</p>
                <p className="text-3xl font-bold text-white">{stats?.premiumUsers}</p>
              </div>
              <div className="bg-orange-600/30 p-3 rounded-lg">
                <Icon name="Crown" size={24} color="#fb923c" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-mobile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              icon="Search"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e?.target?.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e?.target?.value)}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tüm Paketler</option>
              <option value="free_trial">Deneme</option>
              <option value="basic">Temel</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Elit</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="card-mobile">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Abonelik</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">API Bağlantıları</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">İşlem Sayısı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Durum</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers?.map((user) => (
                  <tr key={user?.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-white">{user?.full_name}</div>
                        <div className="text-sm text-slate-400">{user?.email}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Kayıt: {new Date(user?.created_at)?.toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        user?.subscription_plan === 'enterprise' ? 'bg-purple-900/50 text-purple-300' :
                        user?.subscription_plan === 'premium' ? 'bg-blue-900/50 text-blue-300' :
                        user?.subscription_plan === 'basic'? 'bg-green-900/50 text-green-300' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {user?.subscription_plan === 'free_trial' ? 'Deneme' :
                         user?.subscription_plan === 'basic' ? 'Temel' :
                         user?.subscription_plan === 'premium' ? 'Premium' :
                         user?.subscription_plan === 'enterprise' ? 'Elit' : 'Bilinmiyor'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Key" size={14} className="text-blue-400" />
                        <span className="text-white font-medium">
                          {user?.exchange_api_keys?.[0]?.count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon name="TrendingUp" size={14} className="text-green-400" />
                        <span className="text-white font-medium">
                          {user?.trading_operations?.[0]?.count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        user?.is_active
                          ? 'bg-green-900/50 text-green-300' :'bg-red-900/50 text-red-300'
                      }`}>
                        {user?.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(user)}
                          className="flex items-center gap-1"
                        >
                          <Icon name="Eye" size={14} />
                          Detay
                        </Button>
                        <Button
                          size="sm"
                          variant={user?.is_active ? 'outline' : 'default'}
                          onClick={() => handleToggleUserStatus(user?.id, user?.is_active)}
                          className="flex items-center gap-1"
                        >
                          <Icon name={user?.is_active ? 'UserX' : 'UserCheck'} size={14} />
                          {user?.is_active ? 'Devre Dışı' : 'Aktif Et'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers?.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Kullanıcı bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
            loadUsers();
          }}
        />
      )}
    </MainLayout>
  );
};

export default AdminUserManagementHub;
