import React from 'react';
import Icon from '../AppIcon';

const MobileMenuButton = ({ onClick, isOpen = false }) => {
  return (
    <button
      onClick={onClick}
      className="mobile-menu-button"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <Icon name={isOpen ? 'X' : 'Menu'} size={24} />
    </button>
  );
};

export default MobileMenuButton;