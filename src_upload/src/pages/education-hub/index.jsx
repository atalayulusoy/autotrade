import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import Icon from '../../components/AppIcon';
import CourseCard from './components/CourseCard';
import VideoPlayer from './components/VideoPlayer';
import WebinarSchedule from './components/WebinarSchedule';
import ProgressTracker from './components/ProgressTracker';
import useNavigation from '../../hooks/useNavigation';

const EducationHub = () => {
  const { isMobile } = useNavigation();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('courses'); // courses, webinars, progress

  const courses = [
  {
    id: 1,
    title: 'Trading Temelleri',
    description: 'Kripto para ticaretine giriş, temel kavramlar ve piyasa mekaniği',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_179041ded-1768495389442.png",
    duration: '2 saat 30 dakika',
    difficulty: 'Başlangıç',
    lessons: 12,
    completed: 8,
    category: 'fundamentals',
    videos: [
    { id: 1, title: 'Kripto Para Nedir?', duration: '15:30', completed: true },
    { id: 2, title: 'Borsa Nasıl Çalışır?', duration: '18:45', completed: true },
    { id: 3, title: 'Emir Türleri', duration: '12:20', completed: true },
    { id: 4, title: 'Risk Yönetimi Temelleri', duration: '20:15', completed: false }]

  },
  {
    id: 2,
    title: 'Teknik Analiz Ustalığı',
    description: 'Grafik okuma, indikatörler, destek-direnç seviyeleri ve trend analizi',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_182a4c9b0-1768495388274.png",
    duration: '4 saat 15 dakika',
    difficulty: 'Orta',
    lessons: 18,
    completed: 3,
    category: 'technical',
    videos: [
    { id: 1, title: 'Mum Grafikleri', duration: '22:30', completed: true },
    { id: 2, title: 'Destek ve Direnç', duration: '25:45', completed: true },
    { id: 3, title: 'Trend Çizgileri', duration: '18:20', completed: true },
    { id: 4, title: 'RSI İndikatörü', duration: '20:15', completed: false }]

  },
  {
    id: 3,
    title: 'Risk Yönetimi Stratejileri',
    description: 'Portföy yönetimi, pozisyon büyüklüğü hesaplama ve stop-loss stratejileri',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1ee1048c4-1765338815388.png",
    duration: '3 saat 45 dakika',
    difficulty: 'Orta',
    lessons: 15,
    completed: 0,
    category: 'risk',
    videos: [
    { id: 1, title: 'Pozisyon Büyüklüğü', duration: '19:30', completed: false },
    { id: 2, title: 'Stop-Loss Stratejileri', duration: '23:45', completed: false },
    { id: 3, title: 'Risk/Getiri Oranı', duration: '17:20', completed: false }]

  },
  {
    id: 4,
    title: 'Otomatik Bot Yapılandırması',
    description: 'Trading botlarını kurma, strateji oluşturma ve optimizasyon teknikleri',
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_14e6a02b2-1768495387669.png",
    duration: '5 saat 20 dakika',
    difficulty: 'İleri',
    lessons: 22,
    completed: 0,
    category: 'automation',
    videos: [
    { id: 1, title: 'Bot Temelleri', duration: '25:30', completed: false },
    { id: 2, title: 'Strateji Oluşturma', duration: '30:45', completed: false },
    { id: 3, title: 'Backtest Nasıl Yapılır?', duration: '28:20', completed: false },
    { id: 4, title: 'Canlı Bot Yönetimi', duration: '22:15', completed: false }]

  }];


  const upcomingWebinars = [
  {
    id: 1,
    title: 'Bitcoin Halving 2024: Ne Beklemeli?',
    instructor: 'Ahmet Yılmaz',
    date: '2026-01-20',
    time: '19:00',
    duration: '90 dakika',
    registered: true,
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1ba0342b7-1768495387052.png"
  },
  {
    id: 2,
    title: 'Alt Coin Sezonuna Hazırlık',
    instructor: 'Mehmet Demir',
    date: '2026-01-25',
    time: '20:00',
    duration: '60 dakika',
    registered: false,
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_114734841-1768495387607.png"
  },
  {
    id: 3,
    title: 'DeFi Protokolleri ve Yield Farming',
    instructor: 'Ayşe Kaya',
    date: '2026-02-01',
    time: '18:30',
    duration: '75 dakika',
    registered: false,
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_16585e937-1768495387062.png"
  },
  {
    id: 4,
    title: 'Likidite Havuzları ve Risk Yönetimi',
    instructor: 'Selin Arslan',
    date: '2026-02-10',
    time: '20:00',
    duration: '60 dakika',
    registered: false,
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1ba0342b7-1768495387052.png"
  },
  {
    id: 5,
    title: 'Algoritmik Trading Stratejileri',
    instructor: 'Caner Öztürk',
    date: '2026-02-21',
    time: '19:30',
    duration: '90 dakika',
    registered: false,
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_114734841-1768495387607.png"
  }];

  const videoResources = [
    {
      id: 1,
      title: 'Mum Grafikler ve Trend Analizi',
      source: 'YouTube - TradingView Türkiye',
      url: 'https://www.youtube.com/watch?v=K8Q2xgD8QxM'
    },
    {
      id: 2,
      title: 'Risk Yönetimi ve Pozisyon Büyüklüğü',
      source: 'YouTube - Binance Academy',
      url: 'https://www.youtube.com/watch?v=O4y6oC0G6sg'
    },
    {
      id: 3,
      title: 'RSI ve MACD Birlikte Kullanımı',
      source: 'YouTube - Coin Bureau',
      url: 'https://www.youtube.com/watch?v=4qJz2jJ9M1U'
    }
  ];

  const articleResources = [
    {
      id: 1,
      title: 'Teknik Analize Giriş',
      source: 'Binance Academy',
      url: 'https://academy.binance.com/tr/articles/technical-analysis'
    },
    {
      id: 2,
      title: 'Risk Yönetimi Nedir?',
      source: 'Investopedia',
      url: 'https://www.investopedia.com/terms/r/riskmanagement.asp'
    },
    {
      id: 3,
      title: 'Kripto Piyasasında Likidite',
      source: 'CoinMarketCap Alexandria',
      url: 'https://coinmarketcap.com/alexandria/glossary/liquidity'
    }
  ];


  const progress = {
    totalCourses: courses?.length,
    completedCourses: courses?.filter((c) => c?.completed === c?.lessons)?.length,
    totalLessons: courses?.reduce((sum, c) => sum + c?.lessons, 0),
    completedLessons: courses?.reduce((sum, c) => sum + c?.completed, 0)
  };

  const webinars = upcomingWebinars;

  const handleEnroll = (courseId) => {
    console.log('Enrolling in course:', courseId);
  };

  const handleContinue = (courseId) => {
    const course = courses?.find((c) => c?.id === courseId);
    setSelectedCourse(course);
  };

  const handleVideoComplete = (videoId) => {
    console.log('Video completed:', videoId);
  };

  const handleWebinarRegister = (webinarId) => {
    console.log('Registering for webinar:', webinarId);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Başlangıç': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Orta': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'İleri': 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return colors?.[difficulty] || colors?.['Başlangıç'];
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-responsive-h1 font-bold text-foreground mb-2">
              Eğitim Merkezi
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Video kursları ve canlı webinarlar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
              <Icon name="Award" size={18} />
              <span className="text-xs sm:text-sm text-muted-foreground">3 Sertifika</span>
            </div>
          </div>
        </div>

        <ProgressTracker progress={progress} courses={courses} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses?.map((course) =>
          <CourseCard
            key={course?.id}
            course={course}
            onSelect={handleContinue}
            onEnroll={handleEnroll}
            onContinue={handleContinue}
            getDifficultyColor={getDifficultyColor} />

          )}
        </div>

        {selectedCourse &&
        <div className="card-mobile">
            <VideoPlayer
            course={selectedCourse}
            videoUrl={selectedCourse?.videoUrl}
            onComplete={handleVideoComplete}
            onBack={() => setSelectedCourse(null)} />

          </div>
        }

        <div className="card-mobile">
          <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
            Canlı Webinarlar
          </h2>
          <WebinarSchedule webinars={webinars} onRegister={handleWebinarRegister} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-mobile">
            <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
              Video Kaynakları
            </h2>
            <div className="space-y-3">
              {videoResources.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="PlayCircle" size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{video.title}</div>
                    <div className="text-xs text-muted-foreground">{video.source}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="card-mobile">
            <h2 className="text-responsive-h2 font-semibold text-foreground mb-4">
              Makaleler ve Kılavuzlar
            </h2>
            <div className="space-y-3">
              {articleResources.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="FileText" size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{article.title}</div>
                    <div className="text-xs text-muted-foreground">{article.source}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>);


};

export default EducationHub;
