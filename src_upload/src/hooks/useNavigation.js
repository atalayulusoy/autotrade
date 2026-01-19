import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useNavigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location?.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return {
    isMobileMenuOpen,
    isMobile,
    toggleMobileMenu,
    closeMobileMenu,
    currentPath: location?.pathname
  };
};

export default useNavigation;