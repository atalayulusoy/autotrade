import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import MobileMenu from '../components/ui/MobileMenu';
import MobileMenuButton from '../components/ui/MobileMenuButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import useNavigation from '../hooks/useNavigation';
import MobileNotificationBanner from '../components/MobileNotificationBanner';

const MainLayout = ({ children }) => {
  const { isMobileMenuOpen, isMobile, toggleMobileMenu, closeMobileMenu } = useNavigation();

  return (
    <div className="min-h-screen bg-background">
      <MobileNotificationBanner />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <MobileMenuButton
          onClick={toggleMobileMenu}
          isOpen={isMobileMenuOpen}
        />

        <span className="text-lg font-semibold text-foreground font-heading">Crypto Trading Bot</span>
        <ThemeToggle />
      </div>

      {isMobile ? (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
        />
      ) : (
        <Sidebar />
      )}

      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0">
          <div className="hidden lg:block fixed top-4 right-8 z-10">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;