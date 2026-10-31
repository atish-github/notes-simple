import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ isVisible, onClick }) => {
  // If any card is in edit mode, hide as strictly required by specification
  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      title="Create a new note"
      className="animate-pop-in"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 35,
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.4), 0 4px 6px -2px rgba(15, 23, 42, 0.2)',
        border: '2px solid rgba(255, 255, 255, 0.6)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
      }}
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
};

