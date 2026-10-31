export type Role = 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id: string;
  email: string;
  preferredName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  type: string;
  expiresIn: number;
  user: User;
}

export type NoteStatus = 'active' | 'archived';

export interface Note {
  uuid: string;
  note: string;
  groupUuid: string;
  groupId: number;
  status: NoteStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesGroup {
  groupUuid: string;
  groupId: number;
  groupName?: string;
  createdAt: string;
  notes: Note[];
}

