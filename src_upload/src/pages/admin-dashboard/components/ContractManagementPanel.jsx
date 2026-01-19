import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import jsPDF from 'jspdf';

const ContractManagementPanel = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase?.from('contracts')?.select(`
          *,
          user_profiles (full_name, email)
        `)?.order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      setError(err?.message || 'Sözleşmeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const viewContract = (contractUrl) => {
    if (contractUrl) {
      window.open(contractUrl, '_blank');
    } else {
      alert('Sözleşme URL bulunamadı');
    }
  };

  const downloadContractPDF = (contract) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf?.internal?.pageSize?.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Title
      pdf?.setFontSize(18);
      pdf?.setTextColor(37, 99, 235);
      pdf?.text(contract?.contract_title || 'Sözleşme', margin, 20);

      // User info
      pdf?.setFontSize(11);
      pdf?.setTextColor(100, 100, 100);
      pdf?.text(`Kullanıcı: ${contract?.user_profiles?.full_name || 'N/A'}`, margin, 35);
      pdf?.text(`E-posta: ${contract?.user_profiles?.email || 'N/A'}`, margin, 42);
      pdf?.text(`Tarih: ${new Date(contract?.created_at)?.toLocaleDateString('tr-TR')}`, margin, 49);
      
      if (contract?.is_accepted) {
        pdf?.setTextColor(34, 197, 94);
        pdf?.text(`Kabul Tarihi: ${new Date(contract?.accepted_at)?.toLocaleDateString('tr-TR')}`, margin, 56);
      }

      // Content
      pdf?.setFontSize(10);
      pdf?.setTextColor(0, 0, 0);
      const contentLines = pdf?.splitTextToSize(contract?.contract_content || '', maxWidth);
      pdf?.text(contentLines, margin, 70);

      // Footer
      const pageHeight = pdf?.internal?.pageSize?.getHeight();
      pdf?.setFontSize(8);
      pdf?.setTextColor(150, 150, 150);
      pdf?.text('Bu belge otomatik olarak oluşturulmuştur.', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save PDF
      const fileName = `sozlesme_${contract?.user_profiles?.full_name?.replace(/\s+/g, '_')}_${new Date(contract?.created_at)?.toISOString()?.split('T')?.[0]}.pdf`;
      pdf?.save(fileName);
    } catch (err) {
      console.error('PDF oluşturma hatası:', err);
      alert('PDF oluşturulamadı: ' + err?.message);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Sözleşme Yönetimi</h2>
        <Button onClick={loadContracts} variant="outline" size="sm">
          <Icon name="RefreshCw" size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        {contracts?.map((contract) => (
          <div
            key={contract?.id}
            className="bg-slate-700/50 p-4 rounded-lg border border-slate-600"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {contract?.contract_title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Icon name="User" size={14} />
                    <span>{contract?.user_profiles?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Mail" size={14} />
                    <span>{contract?.user_profiles?.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Calendar" size={14} />
                    <span>{new Date(contract?.created_at)?.toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {contract?.is_accepted ? (
                  <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
                    <Icon name="CheckCircle" size={14} />
                    Kabul Edildi
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-900/50 text-yellow-300 rounded-full text-xs font-medium flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    Bekliyor
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded mb-3">
              <p className="text-slate-300 text-sm line-clamp-3">
                {contract?.contract_content}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {contract?.is_accepted && contract?.accepted_at && (
                  <span>
                    Kabul tarihi: {new Date(contract?.accepted_at)?.toLocaleDateString('tr-TR')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => downloadContractPDF(contract)}
                  variant="default"
                  size="sm"
                >
                  <Icon name="Download" size={14} className="mr-1" />
                  PDF İndir
                </Button>
                {contract?.contract_url && (
                  <Button
                    onClick={() => viewContract(contract?.contract_url)}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="ExternalLink" size={14} className="mr-1" />
                    GitHub'da Görüntüle
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {contracts?.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          Henüz sözleşme bulunmuyor
        </div>
      )}
    </div>
  );
};

export default ContractManagementPanel;