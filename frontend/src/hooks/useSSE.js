import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Custom hook to subscribe to the backend Server-Sent Events (SSE) stream.
 * Automatically manages connection lifecycle and handles event callbacks.
 *
 * @param {Object} callbacks - Event handlers
 * @param {Function} [callbacks.onInitialTables] - Called when initial tables list is received
 * @param {Function} [callbacks.onTableUpdated] - Called when a single table is updated
 * @param {Function} [callbacks.onNotification] - Called when a new push notification is received
 */
export function useSSE(callbacks = {}) {
  const { token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  
  // Use refs to avoid re-triggering useEffect when callbacks change
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!token) {
      setConnected(false);
      return;
    }

    let eventSource = null;
    let reconnectTimeoutId = null;
    let isActive = true;

    const connect = () => {
      if (!isActive) return;

      console.log('🔌 [SSE] Connecting to event stream...');
      // Pass token as query parameter since EventSource does not support Custom Headers
      eventSource = new EventSource(`${API_URL}/api/v1/notifications/stream?token=${token}`);

      eventSource.onopen = () => {
        if (!isActive) return;
        setConnected(true);
        setError(null);
        console.log('✅ [SSE] Connection established.');
      };

      eventSource.onerror = (err) => {
        if (!isActive) return;
        console.error('❌ [SSE] Connection error:', err);
        setConnected(false);
        setError('สัญญาณเชื่อมต่อขัดข้อง กำลังพยายามเชื่อมต่อใหม่...');
        eventSource.close();

        // Auto-reconnect after 5 seconds
        reconnectTimeoutId = window.setTimeout(connect, 5000);
      };

      // Handle event: initial_tables
      eventSource.addEventListener('initial_tables', (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          if (callbacksRef.current.onInitialTables) {
            callbacksRef.current.onInitialTables(data);
          }
        } catch (e) {
          console.error('[SSE] Failed to parse initial_tables data:', e);
        }
      });

      // Handle event: table_updated
      eventSource.addEventListener('table_updated', (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          if (callbacksRef.current.onTableUpdated) {
            callbacksRef.current.onTableUpdated(data);
          }
        } catch (e) {
          console.error('[SSE] Failed to parse table_updated data:', e);
        }
      });

      // Handle event: notification
      eventSource.addEventListener('notification', (event) => {
        if (!isActive) return;
        try {
          const data = JSON.parse(event.data);
          if (callbacksRef.current.onNotification) {
            callbacksRef.current.onNotification(data);
          }
        } catch (e) {
          console.error('[SSE] Failed to parse notification data:', e);
        }
      });
    };

    connect();

    return () => {
      isActive = false;
      if (eventSource) {
        eventSource.close();
        console.log('🔌 [SSE] Connection closed.');
      }
      if (reconnectTimeoutId) {
        window.clearTimeout(reconnectTimeoutId);
      }
    };
  }, [token]);

  return { connected, error };
}
