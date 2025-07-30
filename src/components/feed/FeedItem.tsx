import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MilkTestResult } from "@/types/milk-test";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FeedItemProps {
  item: MilkTestResult;
}

interface Like {
  id: string;
  user_id: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
}

export const FeedItem = ({ item }: FeedItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Fetch likes for this milk test
  const { data: likes = [] } = useQuery({
    queryKey: ['likes', item.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('id, user_id')
        .eq('milk_test_id', item.id);
      
      if (error) throw error;
      return data as Like[];
    }
  });

  // Fetch comments for this milk test
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', item.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          user_id,
          content,
          created_at
        `)
        .eq('milk_test_id', item.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Fetch usernames separately
      const commentsWithUsernames = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', comment.user_id)
            .maybeSingle();
          
          return {
            ...comment,
            username: profile?.username || 'Anonymous'
          };
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
        variant: "destructive",
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
      setCommentText("");
      setShowComments(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold">{rating}/10</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {item.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-foreground">{item.username}</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              tried {item.brand_name} {item.product_name}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Product info and rating */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{item.brand_name}</Badge>
            {item.property_names?.map((property) => (
              <Badge key={property} variant="outline" className="text-xs">
                {property}
              </Badge>
            ))}
            {item.flavor_names?.map((flavor) => (
              <Badge key={flavor} variant="flavor" className="text-xs">
                {flavor}
              </Badge>
            ))}
          </div>
          {renderRating(item.rating)}
        </div>

        {/* Photo */}
        {item.picture_path ? (
          <div className="rounded-lg overflow-hidden">
            <img
              src={`https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/Milk%20Product%20Pictures/${encodeURIComponent(item.picture_path)}`}
              alt={`${item.brand_name} ${item.product_name}`}
              className="w-full h-64 object-cover"
              onError={(e) => {
                console.error('Failed to load image:', item.picture_path);
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                // Show fallback
                const fallback = target.parentElement?.nextElementSibling;
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'flex';
                }
              }}
              onLoad={() => {
                console.log('Successfully loaded image:', item.picture_path);
              }}
            />
          </div>
        ) : null}
        
        {/* Fallback placeholder - always rendered but hidden unless image fails */}
        <div 
          className="rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 h-64 flex items-center justify-center"
          style={{ display: item.picture_path ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🥛</div>
            <p className="text-sm text-gray-600">No photo available</p>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-foreground">{item.notes}</p>
        )}

        {/* Additional details */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {item.drink_preference && (
            <span>🥛 {item.drink_preference}</span>
          )}
          {item.shop_name && (
            <span>📍 {item.shop_name}</span>
          )}
          {item.price_quality_ratio && (
            <span>💰 {item.price_quality_ratio}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              "flex items-center space-x-2",
              isLiked && "text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span>{likes.length}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length}</span>
          </Button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="space-y-3 pt-2 border-t">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {comment.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              </div>
            ))}

            {/* Add comment */}
            {user && (
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim() || commentMutation.isPending}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};