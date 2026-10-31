import React, { useState } from 'react';
import { api, ApiError } from '../services/api';
import { User } from '../types';
import { Lock, Mail, ArrowRight, Shield, Sparkles, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (user: User) => void;
}

// Regex for initial email validation as specified
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.login(trimmedEmail, password);
      onSuccess(res.user);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please verify backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDefaultUser = () => {
    setEmail('atishsharma11@gmail.com');
    setPassword('qwerty@123');
    setError(null);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '440px',
      margin: '2.5rem auto',
      padding: '0 1rem',
    }}>
      <div className="glass-card-risen animate-pop-in" style={{
        padding: '2.25rem 2rem',
        borderRadius: 'var(--radius-xl)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: '0 8px 18px rgba(30, 41, 59, 0.25)',
          }}>
            <Lock size={26} />
          </div>
          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '0.4rem',
          }}>
            Welcome Back
          </h2>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.4,
          }}>
            Sign in to access your secure notes & stacks
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="animate-fade-in" style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--color-danger)',
            fontSize: '0.86rem',
            marginBottom: '1.25rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Email / Username field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '0.4rem',
            }}>
              Email (Username)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus-border)';
                  e.target.style.boxShadow = '0 0 0 3px var(--input-focus-ring)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '0.4rem',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--input-focus-border)';
                  e.target.style.boxShadow = '0 0 0 3px var(--input-focus-ring)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--input-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Lock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-light)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(30, 41, 59, 0.25)',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.transform = 'none';
            }}
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Pre-fill Button */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(203, 213, 225, 0.6)',
          textAlign: 'center',
        }}>
          <button
            type="button"
            onClick={handleUseDefaultUser}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px dashed #94a3b8',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#475569';
              e.currentTarget.style.color = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)';
              e.currentTarget.style.borderColor = '#94a3b8';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>Fill default user (Atish)</span>
          </button>

          <div style={{
            marginTop: '0.6rem',
            fontSize: '0.74rem',
            color: 'var(--color-text-light)',
          }}>
            Email: <code>atishsharma11@gmail.com</code> | Pass: <code>qwerty@123</code>
          </div>
        </div>

        {/* Security badge */}
        <div style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.74rem',
          color: 'var(--color-text-muted)',
        }}>
          <Shield size={14} color="#10b981" />
          <span>Stateless 24h JWT & BCrypt Encryption</span>
        </div>
      </div>
    </div>
  );
};

