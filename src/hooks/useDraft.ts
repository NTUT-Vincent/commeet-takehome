import { useEffect, useRef, useCallback } from 'react';
import { UserDraft } from '@/types';

const DEBOUNCE_DELAY = 3000;

export const useDraft = () => {
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const getDraftKey = useCallback((id: number) => `user_draft_${id}`, []);
  
  const loadDraft = useCallback((id: number): UserDraft | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const draftData = localStorage.getItem(getDraftKey(id));
      return draftData ? JSON.parse(draftData) : null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }, [getDraftKey]);
  
  const saveDraft = useCallback((id: number, data: UserDraft) => {
    if (typeof window === 'undefined') return;
    
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(getDraftKey(id), JSON.stringify(data));
      } catch (error) {
        console.error('Error saving draft:', error);
      }
    }, DEBOUNCE_DELAY);
  }, [getDraftKey]);
  
  const removeDraft = useCallback((id: number) => {
    if (typeof window === 'undefined') return;
    
    // Clear any pending debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    try {
      localStorage.removeItem(getDraftKey(id));
    } catch (error) {
      console.error('Error removing draft:', error);
    }
  }, [getDraftKey]);
  
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    loadDraft,
    saveDraft,
    removeDraft
  };
};
