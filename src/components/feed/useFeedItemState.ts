import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MilkTestResult } from "@/types/milk-test";

export interface FeedLike {
  id: string;
  user_id: string;
  username?: string;
}

export interface FeedComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
}

/**
 * All the data-fetching, mutation and navigation logic a single verdict
 * needs — likes, comments, edit/view routing, the sign-in-required toasts.
 * The desktop card and the mobile card present this completely differently
 * (the brief wants two deliberate layouts, not one reflowed), but they must
 * never drift apart on *behaviour*, so that behaviour lives here once.
 */
/**
 * Resolve display names for a set of user ids, asking once per distinct user.
 *
 * Both queries below used to fetch a name per row — a request per like and per
 * comment, multiplied by every card in the feed. They were also pointed at
 * `profiles_public`, which is not exposed by the API at all, so every name
 * rendered as "Anonymous".
 *
 * get_public_profile is the working path and takes one id at a time, so this
 * cannot collapse to a single request without a batch function to call. What
 * it can do is not ask twice about the same person, which is the common case
 * on a post with several reactions.
 */
const fetchUsernames = async (userIds: string[]): Promise<Map<string, string>> => {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const entries = await Promise.all(
    unique.map(async (id) => {
      const { data } = await supabase.rpc('get_public_profile', { _user_id: id }).maybeSingle();
      return [id, (data as { username?: string } | null)?.username || 'Anonymous'] as const;
    }),
  );

  return new Map(entries);
};

export const useFeedItemState = (item: MilkTestResult) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  const isOwnPost = user?.id === item.user_id;

  const { data: likes = [] } = useQuery({
    queryKey: ['likes', item.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('id, user_id')
        .eq('milk_test_id', item.id);

      if (error) throw error;

      const names = await fetchUsernames((data || []).map((like) => like.user_id));

      return (data || []).map((like) => ({
        ...like,
        username: names.get(like.user_id) || 'Anonymous',
      })) as FeedLike[];
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', item.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, user_id, content, created_at')
        .eq('milk_test_id', item.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const names = await fetchUsernames((data || []).map((comment) => comment.user_id));

      return (data || []).map((comment) => ({
        ...comment,
        username: names.get(comment.user_id) || 'Anonymous',
      })) as FeedComment[];
    }
  });

  const isLiked = likes.some((like) => like.user_id === user?.id);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('milk_test_id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, milk_test_id: item.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', item.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          milk_test_id: item.id,
          content: content.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', item.id] });
      setShowComments(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = (content: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive"
      });
      return;
    }
    commentMutation.mutate(content);
  };

  const handleEdit = () => {
    navigate('/add', { state: { editTest: item } });
  };

  return {
    user,
    isOwnPost,
    likes,
    comments,
    isLiked,
    showComments,
    setShowComments,
    likeMutation,
    commentMutation,
    handleLike,
    handleComment,
    handleEdit,
  };
};
