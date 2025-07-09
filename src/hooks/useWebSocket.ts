import { useEffect, useRef, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import { WebSocketMessage } from '@/types';
import { toast } from 'sonner';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const currentUserName = useUserStore(state => state.currentUserName);
  const currentlyEditingUserId = useUserStore(state => state.currentlyEditingUserId);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (retryCountRef.current >= maxRetries) {
      console.warn('Max WebSocket connection retries reached. WebSocket functionality disabled.');
      return;
    }

    try {
      console.log(`Attempting to connect to WebSocket... (attempt ${retryCountRef.current + 1}/${maxRetries})`);
      wsRef.current = new WebSocket('wss://fe-ws.commeet.co/ws');
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        retryCountRef.current = 0; // Reset retry count on successful connection
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'start_editing' || message.type === 'stop_editing') {
            const { recordId, userName } = message.payload;
            console.log(`${message.type}: recordId: ${recordId}, userName: ${userName}`);
            // These are just notifications, the server will send editing_status_update with current users
            
          } else if (message.type === 'editing_status_update') {
            const { recordId, users } = message.payload;
            console.log(`editing_status_update: recordId: ${recordId}, users: ${users}`);
            
            // Only show toast if this is the user currently being edited
            if (currentlyEditingUserId === recordId) {
              if (users && users.length > 0) {
                // Filter out current user from the list
                const otherUsers = users.filter(user => user !== currentUserName);
                if (otherUsers.length > 0) {
                  toast(`正在編輯的使用者：${otherUsers.join(', ')}`, {
                    id: `editing-${recordId}`,
                    duration: Infinity,
                    position: 'top-right'
                  });
                } else {
                  toast.dismiss(`editing-${recordId}`);
                }
              } else {
                toast.dismiss(`editing-${recordId}`);
              }
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Only retry if we haven't exceeded max retries
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        } else {
          console.warn('WebSocket connection failed after maximum retries. Real-time features disabled.');
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        console.log('WebSocket readyState:', wsRef.current?.readyState);
        console.log('Note: The application will continue to work without real-time collaborative features.');
        
        // Increment retry count on error
        retryCountRef.current++;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      retryCountRef.current++;
    }
  }, [currentlyEditingUserId, currentUserName]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.log('WebSocket not connected. Message not sent:', message);
    }
  }, []);

  const startEditing = useCallback((recordId: number) => {
    if (currentUserName) {
      sendMessage({
        type: 'start_editing',
        payload: { recordId, userName: currentUserName }
      });
    }
  }, [currentUserName, sendMessage]);

  const stopEditing = useCallback((recordId: number) => {
    if (currentUserName) {
      sendMessage({
        type: 'stop_editing',
        payload: { recordId, userName: currentUserName }
      });
    }
  }, [currentUserName, sendMessage]);

  useEffect(() => {
    if (currentUserName) {
      connect();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentUserName, connect]);

  return {
    startEditing,
    stopEditing,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
};
