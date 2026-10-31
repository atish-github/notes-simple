import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { User, NotesGroup } from './types';
import { Navbar } from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { NoteStack } from './components/NoteStack';
import { CreateNoteModal } from './components/CreateNoteModal';
import { FloatingAddButton } from './components/FloatingAddButton';
import { Plus, RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getStoredUser());
  const [groups, setGroups] = useState<NotesGroup[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  // Global editing state: tracks which note is currently being edited.
  // If null, all are in read mode and the '+' button is visible.
  // If any note is being edited, '+' button hides!
  const [editingNoteUuid, setEditingNoteUuid] = useState<string | null>(null);

  // Modal for creating a new note
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalTargetGroupUuid, setModalTargetGroupUuid] = useState<string | null>(null);

  // Load notes from authenticated API
  const loadNotes = useCallback(async () => {
    if (!api.getToken()) return;
    try {
      setIsLoadingNotes(true);
      setNotesError(null);
      const data = await api.fetchNotes();
      setGroups(data);
    } catch (err: unknown) {
      setNotesError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  // Check current session on mount
  useEffect(() => {
    const handleAuthExpired = () => {
      setCurrentUser(null);
      setGroups([]);
    };
    window.addEventListener('auth-expired', handleAuthExpired);

    if (api.getToken()) {
      // Validate session with backend
      api.getCurrentUser()
        .then((user) => {
          setCurrentUser(user);
          api.setStoredUser(user);
          loadNotes();
        })
        .catch(() => {
          api.clearSession();
          setCurrentUser(null);
        });
    }

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, [loadNotes]);

  // Handle successful login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    loadNotes();
  };

  // Handle logout
  const handleLogout = () => {
    api.clearSession();
    setCurrentUser(null);
    setGroups([]);
    setEditingNoteUuid(null);
  };

  // Note edit actions
  const handleStartEdit = (noteUuid: string) => {
    setEditingNoteUuid(noteUuid);
  };

  const handleCancelEdit = () => {
    setEditingNoteUuid(null);
  };

  const handleSaveEdit = async (noteUuid: string, newText: string) => {
    try {
      await api.updateNote(noteUuid, newText);
      setEditingNoteUuid(null);
      await loadNotes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  const handleArchive = async (noteUuid: string) => {
    try {
      await api.archiveNote(noteUuid);
      // Immediately remove from UI
      setGroups((prevGroups) =>
        prevGroups
          .map((g) => ({
            ...g,
            notes: g.notes.filter((n) => n.uuid !== noteUuid),
          }))
          .filter((g) => g.notes.length > 0)
      );
      if (editingNoteUuid === noteUuid) {
        setEditingNoteUuid(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive note');
    }
  };

  // Open create note modal
  const handleOpenCreateModal = (targetGroupUuid: string | null = null) => {
    setModalTargetGroupUuid(targetGroupUuid);
    setIsCreateModalOpen(true);
  };

  const handleCreateNote = async (noteText: string, groupUuid?: string) => {
    await api.createNote(noteText, groupUuid);
    await loadNotes();
  };

  const totalActiveNotes = groups.reduce((acc, g) => acc + g.notes.length, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar user={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1.5rem 0 4rem' }}>
        <div className="container">
          {!currentUser ? (
            /* Login View */
            <LoginForm onSuccess={handleLoginSuccess} />
          ) : (
            /* Authenticated Notes Dashboard */
            <div>
              {/* Dashboard Greeting & Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em',
                  }}>
                    Welcome back, {currentUser.preferredName}
                  </h2>
                  <p style={{
                    fontSize: '0.86rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '2px',
                  }}>
                    {totalActiveNotes} active {totalActiveNotes === 1 ? 'note' : 'notes'} across {groups.length} {groups.length === 1 ? 'stack' : 'stacks'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Refresh Button */}
                  <button
                    onClick={loadNotes}
                    disabled={isLoadingNotes}
                    title="Reload notes"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(203, 213, 225, 0.8)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                    }}
                  >
                    <RefreshCw size={14} className={isLoadingNotes ? 'animate-spin' : ''} />
                    <span>Sync</span>
                  </button>

                  {/* Top Add Note Button (also hides if editing as required) */}
                  {editingNoteUuid === null && (
                    <button
                      onClick={() => handleOpenCreateModal(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                      }}
                    >
                      <Plus size={16} />
                      <span>New Note</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Error message */}
              {notesError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem',
                }}>
                  <AlertCircle size={18} />
                  <span>{notesError}</span>
                </div>
              )}

              {/* Notes Content */}
              {isLoadingNotes && groups.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  color: 'var(--color-text-muted)',
                }}>
                  <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
                  <p>Fetching your secure notes...</p>
                </div>
              ) : groups.length === 0 ? (
                /* Empty State */
                <div className="glass-panel" style={{
                  textAlign: 'center',
                  padding: '3.5rem 1.5rem',
                  borderRadius: 'var(--radius-xl)',
                  maxWidth: '520px',
                  margin: '2rem auto',
                }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    color: 'var(--color-text-muted)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}>
                    <FileSpreadsheet size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
                    No active notes
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                    Your desk is clean. Create your first note stack using the button below.
                  </p>
                  <button
                    onClick={() => handleOpenCreateModal(null)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #334155, #1e293b)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    <Plus size={18} />
                    <span>Create First Note</span>
                  </button>
                </div>
              ) : (
                /* Stacks of Groups of Notes */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {groups.map((group) => (
                    <NoteStack
                      key={group.groupUuid}
                      group={group}
                      editingNoteUuid={editingNoteUuid}
                      onStartEdit={handleStartEdit}
                      onCancelEdit={handleCancelEdit}
                      onSaveEdit={handleSaveEdit}
                      onArchive={handleArchive}
                      onAddInGroup={(groupUuid) => handleOpenCreateModal(groupUuid)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating '+' Button: always there on read view, hides if ANY card switches to edit */}
      {currentUser && (
        <FloatingAddButton
          isVisible={editingNoteUuid === null}
          onClick={() => handleOpenCreateModal(null)}
        />
      )}

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        groups={groups}
        defaultGroupUuid={modalTargetGroupUuid}
        onCreated={handleCreateNote}
      />
    </div>
  );
};

