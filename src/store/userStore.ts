import { create } from 'zustand';
import { User, UserStore } from '@/types';

const initialUsers: User[] = [
  {
    id: 1,
    name: "陳大文",
    email: "andy.chen@commeet.co",
    isActive: true,
    description: "前端工程師"
  },
  {
    id: 2,
    name: "Zack Lin",
    email: "z.lin@commeet.co",
    isActive: false,
    description: "後端工程師"
  }
];

export const useUserStore = create<UserStore>((set, get) => ({
  users: initialUsers,
  currentUserName: null,
  currentlyEditingUserId: null,
  
  setCurrentUserName: (name: string) => {
    set({ currentUserName: name });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentUserName', name);
    }
  },
  
  addUser: (user: Omit<User, 'id'>) => {
    const users = get().users;
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    const newUser: User = { ...user, id: newId };
    set({ users: [...users, newUser] });
  },
  
  updateUser: (id: number, updatedUser: Partial<User>) => {
    const users = get().users;
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, ...updatedUser } : user
    );
    set({ users: updatedUsers });
  },
  
  deleteUser: (id: number) => {
    const users = get().users;
    const updatedUsers = users.filter(user => user.id !== id);
    set({ users: updatedUsers });
  },
  
  setCurrentlyEditingUserId: (userId: number | null) => {
    set({ currentlyEditingUserId: userId });
  }
}));

// Initialize user name from sessionStorage
if (typeof window !== 'undefined') {
  const savedUserName = sessionStorage.getItem('currentUserName');
  if (savedUserName) {
    useUserStore.getState().setCurrentUserName(savedUserName);
  }
}
