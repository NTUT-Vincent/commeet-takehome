'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';

interface UserIdentificationModalProps {
  isOpen: boolean;
}

export const UserIdentificationModal = ({ isOpen }: UserIdentificationModalProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const setCurrentUserName = useUserStore(state => state.setCurrentUserName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('請輸入您的姓名');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('姓名至少需要2個字符');
      return;
    }
    
    setCurrentUserName(name.trim());
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">歡迎使用協作用戶管理系統</h2>
        <p className="text-gray-600 mb-6">請輸入您的姓名以繼續：</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="您的姓名"
              className="element w-full"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              disabled={!name.trim()}
            >
              確認
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
