'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/types';
import { userSchema, UserFormData } from '@/lib/validations';
import { useUserStore } from '@/store/userStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDraft } from '@/hooks/useDraft';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

export const UserModal = ({ isOpen, onClose, user }: UserModalProps) => {
  const { addUser, updateUser, setCurrentlyEditingUserId } = useUserStore();
  const { startEditing, stopEditing } = useWebSocket();
  const { loadDraft, saveDraft, removeDraft } = useDraft();
  
  const isEditMode = !!user;
  const userId = user?.id || 0;
  
  const initialData = useMemo(() => {
    if (isEditMode && user) {
      // Try to load draft first
      const draft = loadDraft(userId);
      if (draft) {
        return draft;
      }
      // Fall back to original user data
      return {
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        description: user.description
      };
    }
    
    // New user defaults
    return {
      name: '',
      email: '',
      isActive: true,
      description: ''
    };
  }, [isEditMode, user, userId, loadDraft]);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });
  
  const watchedValues = watch();
  
  // Save draft when form values change (with debounce)
  useEffect(() => {
    if (isEditMode && userId && isOpen) {
      saveDraft(userId, watchedValues);
    }
  }, [watchedValues, isEditMode, userId, isOpen, saveDraft]);
  
  // WebSocket editing notifications
  useEffect(() => {
    if (isOpen && isEditMode && userId) {
      setCurrentlyEditingUserId(userId);
      startEditing(userId);
      
      return () => {
        stopEditing(userId);
      };
    } else if (isOpen && !isEditMode) {
      setCurrentlyEditingUserId(null);
    }
  }, [isOpen, isEditMode, userId, startEditing, stopEditing, setCurrentlyEditingUserId]);
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, reset, initialData]);
  
  const onSubmit = (data: UserFormData) => {
    if (isEditMode && user) {
      updateUser(user.id, data);
      removeDraft(user.id);
    } else {
      addUser(data);
    }
    onClose();
  };
  
  const handleClose = () => {
    if (isEditMode && userId) {
      stopEditing(userId);
    }
    setCurrentlyEditingUserId(null);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditMode ? '編輯用戶' : '新增用戶'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className="element w-full"
              placeholder="請輸入姓名"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電子郵件 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              className="element w-full"
              placeholder="請輸入電子郵件"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              狀態 <span className="text-red-500">*</span>
            </label>
            <select
              {...register('isActive', { 
                setValueAs: (value) => value === 'true' 
              })}
              className="element w-full"
            >
              <option value="true">啟用</option>
              <option value="false">停用</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              className="element w-full"
              rows={3}
              placeholder="請輸入描述"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isEditMode ? '更新' : '新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
