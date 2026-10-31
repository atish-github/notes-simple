import React, { useState } from 'react';
import { Note } from '../types';
import { Edit3, Archive, Check, X, Plus, Clock, Hash } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  onStartEdit: (noteUuid: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (noteUuid: string, newText: string) => Promise<void>;
  onArchive: (noteUuid: string) => Promise<void>;
  onAddInSameGroup: (groupUuid: string) => void;
  // Styling props for zig-zag stack positioning if needed
  zIndex?: number;
  rotationDeg?: number;
  offsetY?: number;
  offsetX?: number;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onArchive,
  onAddInSameGroup,
  zIndex = 1,
  rotationDeg = 0,
  offsetY = 0,
  offsetX = 0,
}) => {
  const [editText, setEditText] = useState(note.note);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleStartEdit = () => {
    setEditText(note.note);
    onStartEdit(note.uuid);
  };

  const handleCancel = () => {
    setEditText(note.note);
    onCancelEdit();
  };

  const handleSave = async () => {
    if (!editText.trim()) return;
    try {
      setIsSaving(true);
      await onSaveEdit(note.uuid, editText);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (confirm('Archive this note? It will be hidden from the active notes list.')) {
      try {
        setIsArchiving(true);
        await onArchive(note.uuid);
      } finally {
        setIsArchiving(false);
      }
    }
  };

  const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      className="glass-card-risen animate-fade-in"
      style={{
        position: 'relative',
        zIndex,
        transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotationDeg}deg)`,
        padding: '1.25rem 1.4rem',
        marginBottom: '1rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.90)',
        boxShadow: 'var(--card-shadow-risen)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Top Header Row of Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem',
        paddingBottom: '0.6rem',
        borderBottom: '1px solid rgba(226, 232, 240, 0.7)',
      }}>
        {/* Group / Metadata Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(71, 85, 105, 0.1)',
            color: 'var(--color-primary)',
            letterSpacing: '0.02em',
          }}>
            <Hash size={11} /> Group {note.groupId}
          </span>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '0.72rem',
            color: 'var(--color-text-light)',
          }}>
            <Clock size={11} /> {formattedDate}
          </span>
        </div>

        {/* Card Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Add in same group button */}
          {!isEditing && (
            <button
              onClick={() => onAddInSameGroup(note.groupUuid)}
              title="Add a note to this same group"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                background: 'rgba(241, 245, 249, 0.9)',
                color: 'var(--color-text-secondary)',
                border: '1px solid rgba(203, 213, 225, 0.8)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#334155';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(241, 245, 249, 0.9)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Note Body: Transitions between Italic Read Mode and Editable Textarea */}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={4}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary)',
              background: '#ffffff',
              fontSize: '0.94rem',
              lineHeight: 1.5,
              color: 'var(--color-text-primary)',
              outline: 'none',
              resize: 'vertical',
              boxShadow: '0 0 0 3px rgba(71, 85, 105, 0.15)',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(241, 245, 249, 0.8)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 500,
                border: '1px solid #cbd5e1',
              }}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)',
              }}
            >
              <Check size={14} /> {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        /* Non-editable view in italic styling */
        <div>
          <p className="note-read-text" style={{
            fontSize: '0.95rem',
            minHeight: '44px',
            marginBottom: '1rem',
          }}>
            {note.note}
          </p>

          {/* Action Buttons: Edit and Archive */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.5rem',
            borderTop: '1px dashed rgba(226, 232, 240, 0.8)',
          }}>
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--color-text-light)',
              fontFamily: 'var(--font-family-mono)',
            }}>
              id: {note.uuid.substring(0, 8)}...
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Edit Button */}
              <button
                onClick={handleStartEdit}
                title="Edit this note"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(241, 245, 249, 0.85)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid rgba(203, 213, 225, 0.7)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(241, 245, 249, 0.85)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>

              {/* Archive Button */}
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                title="Archive note (hides from active view)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(254, 242, 242, 0.6)',
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid rgba(254, 202, 202, 0.6)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(254, 242, 242, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(254, 202, 202, 0.6)';
                }}
              >
                <Archive size={13} />
                <span>{isArchiving ? 'Archiving...' : 'Archive'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

