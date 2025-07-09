export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  description: string;
}

export interface UserDraft {
  name: string;
  email: string;
  isActive: boolean;
  description: string;
}

export interface WebSocketMessage {
  type: 'start_editing' | 'stop_editing' | 'editing_status_update';
  payload: {
    recordId: number;
    userName?: string;
    users?: string[];
  };
}

export interface UserStore {
  users: User[];
  currentUserName: string | null;
  currentlyEditingUserId: number | null;
  setCurrentUserName: (name: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: number, user: Partial<User>) => void;
  deleteUser: (id: number) => void;
  setCurrentlyEditingUserId: (userId: number | null) => void;
}
