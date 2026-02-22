import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Notification, NotificationPreferences } from '@/hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  preferences: NotificationPreferences | null;
  preferencesLoading: boolean;
  updatePreferences: (updates: Partial<Pick<NotificationPreferences, 'likes_enabled' | 'comments_enabled' | 'newsletter_enabled'>>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error: unknown) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPreferencesLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setPreferences(data);
    } catch (error: unknown) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  }, [notifications]);

  const updatePreferences = useCallback(async (updates: Partial<Pick<NotificationPreferences, 'likes_enabled' | 'comments_enabled' | 'newsletter_enabled'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existing) {
        result = await supabase
          .from('notification_preferences')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id, ...updates })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setPreferences(result.data);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error: unknown) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtimeChannel = () => {
      // Remove any existing channel before creating a new one
      if (channel) {
        supabase.removeChannel(channel);
      }
      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast({
              title: newNotification.title,
              description: newNotification.message.split('|')[0],
            });
          }
        )
        .subscribe();
    };

    // Check initial session before subscribing
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchNotifications();
        fetchPreferences();
        setupRealtimeChannel();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchNotifications();
        fetchPreferences();
        setupRealtimeChannel();
      } else if (event === 'SIGNED_OUT') {
        setNotifications([]);
        setUnreadCount(0);
        setPreferences(null);
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchNotifications, fetchPreferences]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        preferences,
        preferencesLoading,
        updatePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Default values for when context is used outside provider (e.g., during initial render)
const defaultContextValue: NotificationContextType = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  preferences: null,
  preferencesLoading: false,
  updatePreferences: async () => {},
};

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  // Return default values instead of throwing if outside provider
  // This prevents crashes during initial render before providers are mounted
  if (context === undefined) {
    return defaultContextValue;
  }
  return context;
}
