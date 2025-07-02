import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useToast } from '@/hooks/use-toast';

export function useAdminSecurity() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Admin session timeout - 30 minutes
    const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000;
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        toast({
          title: "Session Expired",
          description: "Your admin session has expired for security.",
          variant: "destructive",
        });
        signOut();
      }, ADMIN_SESSION_TIMEOUT);
    };

    // Reset timeout on user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start the timeout
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, isAdmin, signOut, toast]);

  // Log admin actions
  const logAdminAction = (action: string, details?: Record<string, any>) => {
    if (isAdmin && user) {
      console.log(`Admin Action: ${action}`, {
        userId: user.id,
        timestamp: new Date().toISOString(),
        ...details
      });
      // In a real app, you'd send this to a secure logging service
    }
  };

  return { logAdminAction };
}