import React from 'react';
import { User } from '../types';
import { LogOut, Layers, ShieldCheck, Clock } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(235, 240, 245, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        {/* Logo / Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 10px rgba(30, 41, 59, 0.25)',
          }}>
            <Layers size={20} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
            }}>
              Notes Simple
            </h1>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}>
              Glassmorphic Workspace
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Preferred Name & Role */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              fontSize: '0.85rem',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {user.preferredName}
              </span>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: user.role === 'ROLE_ADMIN' ? 'rgba(51, 65, 85, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                color: 'var(--color-primary)',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}>
                {user.role}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                fontSize: '0.85rem',
                transition: 'all var(--transition-fast)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.borderColor = 'rgba(203, 213, 225, 0.8)';
              }}
            >
              <LogOut size={16} />
              <span className="hidden-mobile" style={{ display: 'inline' }}>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

