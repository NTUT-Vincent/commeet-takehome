'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { UserIdentificationModal } from '@/components/UserIdentificationModal';
import { UserList } from '@/components/UserList';
import { ToastLayer } from '@/components/ToastLayer';

export default function Home() {
  const currentUserName = useUserStore(state => state.currentUserName);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if user name is already in sessionStorage
    const savedUserName = sessionStorage.getItem('currentUserName');
    if (savedUserName) {
      useUserStore.getState().setCurrentUserName(savedUserName);
    } else {
      setIsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    // Show modal if no current user name
    if (!currentUserName) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [currentUserName]);

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastLayer />
      
      <UserIdentificationModal 
        isOpen={isModalOpen} 
      />
      
      {currentUserName && (
        <>
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  協作用戶管理系統
                </h1>
                <div className="text-sm text-gray-600">
                  歡迎, <span className="font-medium">{currentUserName}</span>!
                </div>
              </div>
            </div>
          </header>
          
          <main className="py-8">
            <UserList />
          </main>
        </>
      )}
    </div>
  );
}
