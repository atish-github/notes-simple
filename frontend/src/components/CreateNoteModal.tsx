import React, { useState } from 'react';
import { NotesGroup } from '../types';
import { X, Plus, Layers, FileText } from 'lucide-react';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: NotesGroup[];
  defaultGroupUuid?: string | null;
  onCreated: (noteText: string, groupUuid?: string) => Promise<void>;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  groups,
  defaultGroupUuid,
  onCreated,
}) => {
  const [noteText, setNoteText] = useState('');
  const [selectedGroupUuid, setSelectedGroupUuid] = useState<string>(defaultGroupUuid || 'NEW');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setNoteText('');
      setError(null);
      setSelectedGroupUuid(defaultGroupUuid || 'NEW');
    }
  }, [isOpen, defaultGroupUuid]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setError('Please enter note text');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const groupUuidToUse = selectedGroupUuid === 'NEW' ? undefined : selectedGroupUuid;
      await onCreated(noteText, groupUuidToUse);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div className="glass-card-risen animate-pop-in" style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '1.75rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #334155, #1e293b)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Create New Note
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px',
            marginBottom: '1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.84rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Target Group Selector */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '0.35rem',
            }}>
              Stack Group
            </label>
            <select
              value={selectedGroupUuid}
              onChange={(e) => setSelectedGroupUuid(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            >
              <option value="NEW">+ Create in a New Group</option>
              {groups.map((g) => (
                <option key={g.groupUuid} value={g.groupUuid}>
                  Add to Group #{g.groupId} ({g.notes.length} notes)
                </option>
              ))}
            </select>
          </div>

          {/* Note Content */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '0.35rem',
            }}>
              Note Content
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Jot down your note here..."
              rows={5}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                border: '1px solid var(--input-border)',
                fontSize: '0.94rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--input-focus-ring)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(241, 245, 249, 0.8)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.86rem',
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #334155, #1e293b)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 600,
                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Add Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

