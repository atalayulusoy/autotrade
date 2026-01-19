import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import jsPDF from 'jspdf';

const AdminContractManagement = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadContracts();
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

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        ?.from('contracts')
        ?.select(`
          *,
          user_profiles (
            full_name,
            email
          )
        `)
        ?.order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const downloadContractPDF = (contract) => {
    const doc = new jsPDF();
    
    doc?.setFontSize(18);
    doc?.text('Trading Hizmet Sözleşmesi', 20, 20);
    
    doc?.setFontSize(12);
    doc?.text(`Sözleşme Başlığı: ${contract?.contract_title}`, 20, 40);
    doc?.text(`Kullanıcı: ${contract?.user_profiles?.full_name}`, 20, 50);
    doc?.text(`Email: ${contract?.user_profiles?.email}`, 20, 60);
    doc?.text(`Tarih: ${new Date(contract?.created_at)?.toLocaleDateString('tr-TR')}`, 20, 70);
    doc?.text(`Durum: ${contract?.is_accepted ? 'Kabul Edildi' : 'Bekliyor'}`, 20, 80);
    
    doc?.setFontSize(10);
    const splitText = doc?.splitTextToSize(contract?.contract_content, 170);
    doc?.text(splitText, 20, 100);
    
    doc?.save(`sozlesme-${contract?.user_profiles?.full_name}-${new Date()?.getTime()}.pdf`);
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
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-lg">
              <Icon name="FileText" size={24} color="#ffffff" />
            </div>
            <div>
              <h1 className="text-responsive-h1 font-bold text-foreground">Sözleşme Yönetimi</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Kullanıcı sözleşmelerini yönet</p>
            </div>
          </div>
        </div>

        <div className="card-mobile">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Tüm Sözleşmeler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kullanıcı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Sözleşme Başlığı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Durum</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Tarih</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {contracts?.map((contract) => (
                  <tr key={contract?.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{contract?.user_profiles?.full_name}</p>
                        <p className="text-xs text-slate-400">{contract?.user_profiles?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white">{contract?.contract_title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contract?.is_accepted
                            ? 'bg-green-500/20 text-green-400' :'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {contract?.is_accepted ? 'Kabul Edildi' : 'Bekliyor'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 text-sm">
                        {new Date(contract?.created_at)?.toLocaleDateString('tr-TR')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => downloadContractPDF(contract)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                      >
                        PDF İndir
                      </Button>
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

export default AdminContractManagement;