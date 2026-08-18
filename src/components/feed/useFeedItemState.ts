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

      const likesWithUsernames = await Promise.all(
        (data || []).map(async (like) => {
          const { data: profile } = await supabase
            .rpc('get_public_profile', { _user_id: like.user_id })
            .maybeSingle();


          return { ...like, username: profile?.username || 'Anonymous' };
        })
      );

      return likesWithUsernames as FeedLike[];
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

      const commentsWithUsernames = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .rpc('get_public_profile', { _user_id: comment.user_id })
            .maybeSingle();


          return { ...comment, username: profile?.username || 'Anonymous' };
        })
      );

      return commentsWithUsernames as FeedComment[];
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

  const handleViewAllResults = () => {
    navigate(`/product/${item.product_id}`);
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
    handleViewAllResults,
    handleEdit,
  };
};
