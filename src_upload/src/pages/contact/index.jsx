import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.name?.trim()) newErrors.name = 'İsim gereklidir';
    if (!formData?.email?.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    if (!formData?.message?.trim()) newErrors.message = 'Mesaj gereklidir';
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { data, error } = await supabase?.functions?.invoke('send-support-email', {
        body: {
          name: formData?.name,
          email: formData?.email,
          subject: formData?.subject || 'İletişim Formu Mesajı',
          message: formData?.message,
          type: 'contact'
        }
      });

      if (error) throw error;

      setSubmitStatus({ type: 'success', message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact email error:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: error?.message || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>İletişim - Atalay Ulusoy Kripto İşlem Botu</title>
        <meta 
          name="description" 
          content="Atalay Ulusoy kripto işlem botu ile ilgili sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşın." 
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          {/* Header */}
          <div className="max-w-5xl mx-auto mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <Icon name="ArrowLeft" size={20} />
              <span>Geri Dön</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary">
                <Icon name="Mail" size={32} color="#ffffff" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  İletişim
                </h1>
                <p className="text-muted-foreground mt-1">
                  Bize ulaşın, yardımcı olmaktan mutluluk duyarız
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="p-6 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <Icon name="MessageCircle" size={24} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">İletişim Bilgileri</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Mail" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">E-posta</p>
                      <p className="text-sm text-muted-foreground">support@atalayulusoy.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Clock" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Çalışma Saatleri</p>
                      <p className="text-sm text-muted-foreground">Pazartesi - Cuma: 09:00 - 18:00</p>
                      <p className="text-sm text-muted-foreground">Hafta Sonu: Kapalı</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="MapPin" size={20} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Konum</p>
                      <p className="text-sm text-muted-foreground">İstanbul, Türkiye</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <Icon name="Zap" size={24} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Hızlı Erişim</h2>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/support-center')}
                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <Icon name="Headphones" size={16} />
                    <span>Destek Merkezi</span>
                  </button>
                  <button
                    onClick={() => navigate('/faq')}
                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <Icon name="BookOpen" size={16} />
                    <span>Sık Sorulan Sorular</span>
                  </button>
                  <button
                    onClick={() => navigate('/about-us')}
                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <Icon name="Info" size={16} />
                    <span>Hakkımızda</span>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Icon name="MessageSquare" size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Telegram Topluluğu</p>
                    <p className="text-sm text-muted-foreground">
                      Telegram kanalımıza katılarak diğer kullanıcılarla etkileşime geçin ve güncellemelerden haberdar olun.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="p-6 md:p-8 rounded-lg bg-card border border-border">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Bize Mesaj Gönderin
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sorularınız, önerileriniz veya iş birliği teklifleriniz için formu doldurun.
                  </p>
                </div>

                {submitStatus && (
                  <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
                    submitStatus?.type === 'success' ?'bg-success/10 border border-success/20' :'bg-error/10 border border-error/20'
                  }`}>
                    <Icon 
                      name={submitStatus?.type === 'success' ? 'CheckCircle' : 'AlertCircle'} 
                      size={20} 
                      className={submitStatus?.type === 'success' ? 'text-success' : 'text-error'}
                    />
                    <p className={`text-sm ${
                      submitStatus?.type === 'success' ? 'text-success' : 'text-error'
                    }`}>
                      {submitStatus?.message}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Adınız Soyadınız"
                      type="text"
                      placeholder="Adınız ve soyadınız"
                      value={formData?.name}
                      onChange={(e) => handleInputChange('name', e?.target?.value)}
                      error={errors?.name}
                      required
                    />
                    <Input
                      label="E-posta Adresiniz"
                      type="email"
                      placeholder="ornek@email.com"
                      value={formData?.email}
                      onChange={(e) => handleInputChange('email', e?.target?.value)}
                      error={errors?.email}
                      required
                    />
                  </div>

                  <Input
                    label="Konu"
                    type="text"
                    placeholder="Mesajınızın konusu"
                    value={formData?.subject}
                    onChange={(e) => handleInputChange('subject', e?.target?.value)}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Mesajınız <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      className="flex min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Mesajınızı buraya yazın..."
                      value={formData?.message}
                      onChange={(e) => handleInputChange('message', e?.target?.value)}
                    />
                    {errors?.message && (
                      <p className="text-sm text-destructive">{errors?.message}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Icon name="Shield" size={20} className="text-primary mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Gizlilik ve Güvenlik</p>
                      <p>
                        Gönderdiğiniz tüm bilgiler güvenli bir şekilde saklanır ve üçüncü taraflarla paylaşılmaz. 
                        Sadece ilgili ekip üyelerimiz mesajınızı görüntüleyebilir.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    iconName="Send"
                    iconPosition="left"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </Button>
                </form>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-card border border-border text-center">
                  <Icon name="Clock" size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">Hızlı Yanıt</p>
                  <p className="text-xs text-muted-foreground">24 saat içinde</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border text-center">
                  <Icon name="Users" size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">Uzman Ekip</p>
                  <p className="text-xs text-muted-foreground">7/24 destek</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border text-center">
                  <Icon name="Shield" size={24} className="text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">Güvenli İletişim</p>
                  <p className="text-xs text-muted-foreground">Şifreli kanal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button onClick={() => navigate('/about-us')} className="hover:text-foreground transition-colors">
                  Hakkımızda
                </button>
                <button onClick={() => navigate('/support-center')} className="hover:text-foreground transition-colors">
                  Destek
                </button>
                <button onClick={() => navigate('/faq')} className="hover:text-foreground transition-colors">
                  SSS
                </button>
                <button onClick={() => navigate('/contact')} className="hover:text-foreground transition-colors">
                  İletişim
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date()?.getFullYear()} Atalay Ulusoy. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;