import React, { useState } from 'react';
import { NotesGroup } from '../types';
import { NoteCard } from './NoteCard';
import { Plus, ChevronLeft, ChevronRight, Layers, Eye, Folder } from 'lucide-react';

interface NoteStackProps {
  group: NotesGroup;
  editingNoteUuid: string | null;
  onStartEdit: (noteUuid: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (noteUuid: string, newText: string) => Promise<void>;
  onArchive: (noteUuid: string) => Promise<void>;
  onAddInGroup: (groupUuid: string) => void;
}

export const NoteStack: React.FC<NoteStackProps> = ({
  group,
  editingNoteUuid,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onArchive,
  onAddInGroup,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'stack' | 'expanded'>('stack');

  const notes = group.notes;
  const count = notes.length;

  const handleNext = () => {
    if (count > 0) {
      setActiveIndex((prev) => (prev + 1) % count);
    }
  };

  const handlePrev = () => {
    if (count > 0) {
      setActiveIndex((prev) => (prev - 1 + count) % count);
    }
  };

  // If a note in this group is currently being edited, bring that note to front
  React.useEffect(() => {
    if (editingNoteUuid) {
      const idx = notes.findIndex((n) => n.uuid === editingNoteUuid);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [editingNoteUuid, notes]);

  // Generate subtle zig-zag angles and offsets for notes lying on desk
  const getZigZagStyle = (index: number, activeIdx: number) => {
    if (index === activeIdx) {
      return { rotation: 0, offsetX: 0, offsetY: 0, zIndex: 10 };
    }
    const diff = (index - activeIdx + count) % count;
    // Zig-zag slight rotations: alternating left and right
    const rotation = diff % 2 === 1 ? (diff * 2.2) : -(diff * 2.0);
    const offsetX = (diff % 2 === 1 ? 1 : -1) * Math.min(diff * 5, 14);
    const offsetY = Math.min(diff * 6, 16);
    const zIndex = Math.max(1, 10 - diff);

    return { rotation, offsetX, offsetY, zIndex };
  };

  if (count === 0) return null;

  return (
    <section className="glass-panel" style={{
      padding: '1.25rem 1.4rem',
      borderRadius: 'var(--radius-xl)',
      marginBottom: '2rem',
      position: 'relative',
    }}>
      {/* Group Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(51, 65, 85, 0.12)',
            color: 'var(--color-primary)',
          }}>
            <Folder size={16} />
          </div>
          <h2 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}>
            Group {group.groupId}
          </h2>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.7)',
            color: 'var(--color-text-muted)',
            fontWeight: 600,
          }}>
            {count} {count === 1 ? 'note' : 'notes'}
          </span>
        </div>

        {/* View Mode & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Toggle between Stack and Expanded view */}
          {count > 1 && (
            <button
              onClick={() => setViewMode(viewMode === 'stack' ? 'expanded' : 'stack')}
              title={viewMode === 'stack' ? 'Expand all notes' : 'Stack notes in zig-zag pile'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(203, 213, 225, 0.7)',
                fontSize: '0.76rem',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
              }}
            >
              {viewMode === 'stack' ? <Eye size={13} /> : <Layers size={13} />}
              <span>{viewMode === 'stack' ? 'Spread out' : 'Zig-zag stack'}</span>
            </button>
          )}

          {/* Add note to this group */}
          <button
            onClick={() => onAddInGroup(group.groupUuid)}
            title="Add a new note to this group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 600,
              boxShadow: '0 2px 5px rgba(15, 23, 42, 0.15)',
            }}
          >
            <Plus size={14} />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* STACK VIEW (Zig-zag physical layered notes lying on desk) */}
      {viewMode === 'stack' ? (
        <div>
          {/* Relative Container for zig-zag stack */}
          <div style={{
            position: 'relative',
            minHeight: '220px',
            paddingTop: '8px',
            paddingBottom: '16px',
          }}>
            {notes.map((note, idx) => {
              const { rotation, offsetX, offsetY, zIndex } = getZigZagStyle(idx, activeIndex);
              const isActive = idx === activeIndex;

              return (
                <div
                  key={note.uuid}
                  style={{
                    position: isActive ? 'relative' : 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    cursor: isActive ? 'default' : 'pointer',
                    opacity: isActive ? 1 : Math.max(0.7 - (idx * 0.15), 0.4),
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onClick={() => {
                    if (!isActive && !editingNoteUuid) {
                      setActiveIndex(idx);
                    }
                  }}
                >
                  <NoteCard
                    note={note}
                    isEditing={editingNoteUuid === note.uuid}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                    onSaveEdit={onSaveEdit}
                    onArchive={onArchive}
                    onAddInSameGroup={onAddInGroup}
                    rotationDeg={rotation}
                    offsetX={offsetX}
                    offsetY={offsetY}
                    zIndex={zIndex}
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Controls for Swiping / Paging in Stack */}
          {count > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              marginTop: '0.5rem',
            }}>
              <button
                onClick={handlePrev}
                title="Previous note in stack"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(203, 213, 225, 0.8)',
                  color: 'var(--color-text-secondary)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Dots / Paging indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {notes.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveIndex(dotIdx)}
                    style={{
                      width: dotIdx === activeIndex ? '18px' : '7px',
                      height: '7px',
                      borderRadius: '4px',
                      background: dotIdx === activeIndex ? 'var(--color-primary)' : 'rgba(148, 163, 184, 0.5)',
                      transition: 'all var(--transition-fast)',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                title="Next note in stack"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(203, 213, 225, 0.8)',
                  color: 'var(--color-text-secondary)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* EXPANDED DESK VIEW */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {notes.map((note) => (
            <div key={note.uuid}>
              <NoteCard
                note={note}
                isEditing={editingNoteUuid === note.uuid}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onArchive={onArchive}
                onAddInSameGroup={onAddInGroup}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

