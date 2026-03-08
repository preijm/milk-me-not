import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MilkTestResult } from "@/types/milk-test";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FeedHeader } from "./FeedHeader";
import { FeedProductInfo } from "./FeedProductInfo";
import { FeedImage } from "./FeedImage";
import { FeedEngagement } from "./FeedEngagement";
import { FeedComments } from "./FeedComments";

interface FeedItemProps {
  item: MilkTestResult;
  blurred?: boolean;
  disabled?: boolean;
}

interface Like {
  id: string;
  user_id: string;
  username?: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
}

export const FeedItem = ({ item, blurred = false, disabled = false }: FeedItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  const isOwnPost = user?.id === item.user_id;

  // Fetch likes
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
            .from('profiles_public')
            .select('username')
            .eq('id', like.user_id)
            .maybeSingle();
          
          return { ...like, username: profile?.username || 'Anonymous' };
        })
      );
      
      return likesWithUsernames as Like[];
    }
  });

  // Fetch comments
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
            .from('profiles_public')
            .select('username')
            .eq('id', comment.user_id)
            .maybeSingle();
          
          return { ...comment, username: profile?.username || 'Anonymous' };
        })
      );
      
      return commentsWithUsernames as Comment[];
    }
  });

  const isLiked = likes.some(like => like.user_id === user?.id);

  // Like/unlike mutation
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

  // Add comment mutation
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

  return (
    <div className={cn("w-full", disabled && "pointer-events-none")}>
      <Card id={`test-${item.id}`} className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 hover-scale">
        <CardHeader className="pb-2 pt-3 px-4">
          <FeedHeader
            username={item.username}
            createdAt={item.created_at}
            rating={item.rating}
            blurred={blurred}
          />
        </CardHeader>

        <CardContent className="space-y-3 pt-0 px-4 pb-3">
          <FeedProductInfo
            brandName={item.brand_name}
            productName={item.product_name}
            isBarista={item.is_barista}
            propertyNames={item.property_names}
            flavorNames={item.flavor_names}
          />

          <FeedImage
            picturePath={item.picture_path}
            brandName={item.brand_name}
            productName={item.product_name}
            blurred={blurred}
          />

          {item.notes && (
            <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary">
              <p className="text-sm text-foreground font-medium italic whitespace-pre-wrap">"{item.notes}"</p>
            </div>
          )}

          <FeedEngagement
            likes={likes}
            commentsCount={comments.length}
            isLiked={isLiked}
            isOwnPost={isOwnPost}
            isLikePending={likeMutation.isPending}
            showComments={showComments}
            onLike={handleLike}
            onToggleComments={() => setShowComments(!showComments)}
            onViewAllResults={handleViewAllResults}
            onEdit={handleEdit}
          />

          {showComments && (
            <FeedComments
              comments={comments}
              userEmail={user?.email}
              isCommentPending={commentMutation.isPending}
              onAddComment={handleComment}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
