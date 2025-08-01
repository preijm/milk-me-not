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
import { Heart, MessageCircle, Star, Plus, MapPin, DollarSign, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";

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

  // Helper function to get badge color based on sentiment
  const getBadgeVariant = (property: string) => {
    const positiveSentiments = ['delicious', 'creamy', 'smooth', 'rich', 'worth_it', 'recommended'];
    const negativeSentiments = ['bitter', 'watery', 'thin', 'not_worth_it', 'disappointing'];
    
    if (positiveSentiments.some(p => property.toLowerCase().includes(p))) {
      return "default"; // Green for positive
    }
    if (negativeSentiments.some(p => property.toLowerCase().includes(p))) {
      return "destructive"; // Red for negative
    }
    return "secondary"; // Neutral gray
  };

  const getBadgeIcon = (property: string) => {
    if (property.toLowerCase().includes('not_worth_it') || property.toLowerCase().includes('disappointing')) {
      return <ThumbsDown className="h-3 w-3 mr-1" />;
    }
    if (property.toLowerCase().includes('worth_it') || property.toLowerCase().includes('recommended')) {
      return <ThumbsUp className="h-3 w-3 mr-1" />;
    }
    return null;
  };

  const renderRating = (rating: number) => {
    return (
      <Badge variant={getScoreBadgeVariant(Number(rating))}>
        {formatScore(Number(rating))}
      </Badge>
    );
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 hover-scale">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge 
              variant="category" 
              className="w-12 h-12 rounded-full flex items-center justify-center p-0 font-medium text-lg"
            >
              {item.username?.charAt(0).toUpperCase() || 'U'}
            </Badge>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-foreground text-lg">{item.username}</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-base font-medium text-foreground">
                  {item.brand_name}
                </span>
                <span className="text-base font-medium text-muted-foreground">
                  {item.product_name}
                </span>
                {item.is_barista && (
                  <Badge 
                    variant="barista"
                    className="text-xs font-medium"
                  >
                    Barista
                  </Badge>
                )}
                {item.property_names?.map((property) => (
                  <Badge 
                    key={property} 
                    variant="category"
                    className="text-xs font-medium"
                  >
                    {property.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {item.flavor_names?.map((flavor) => (
                  <Badge 
                    key={flavor} 
                    variant="flavor"
                    className="text-xs font-medium"
                  >
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {renderRating(item.rating)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enhanced Photo Display */}
        {item.picture_path ? (
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={`https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(item.picture_path)}`}
              alt={`${item.brand_name} ${item.product_name}`}
              className="w-full h-96 object-cover transition-transform duration-300 hover:scale-105"
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
        
        {/* Enhanced Fallback placeholder */}
        <div 
          className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 h-96 flex items-center justify-center border-2 border-dashed border-primary/20"
          style={{ display: item.picture_path ? 'none' : 'flex' }}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🥛</div>
            <p className="text-lg font-medium text-muted-foreground">No photo available</p>
            <p className="text-sm text-muted-foreground">Share a photo of this product!</p>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
            <p className="text-foreground font-medium italic">"{item.notes}"</p>
          </div>
        )}

        {/* Enhanced Product Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
          {item.drink_preference && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-2xl">🥛</span>
              <div>
                <div className="font-medium text-foreground">Preference</div>
                <div className="text-muted-foreground">{item.drink_preference}</div>
              </div>
            </div>
          )}
          {item.shop_name && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium text-foreground">Available at</div>
                <div className="text-muted-foreground">{item.shop_name}</div>
              </div>
            </div>
          )}
          {item.price_quality_ratio && (
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium text-foreground">Value</div>
                <div className="text-muted-foreground">{item.price_quality_ratio}</div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Engagement Actions */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-border/50">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200",
                isLiked 
                  ? "text-red-500 bg-red-50 hover:bg-red-100" 
                  : "hover:bg-gray-50"
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              <span className="font-semibold text-lg">{likes.length}</span>
              <span className="text-sm">Likes</span>
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-50 transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold text-lg">{comments.length}</span>
              <span className="text-sm">Comments</span>
            </Button>
          </div>

          <WishlistButton
            productId={item.product_id || ''}
            variant="outline"
            size="sm"
            className="rounded-full"
            showText={false}
          />
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 p-3 bg-muted/20 rounded-lg">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {comment.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-foreground">{comment.username}</span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground mt-1">{comment.content}</p>
                </div>
              </div>
            ))}

            {/* Add comment */}
            {user && (
              <div className="flex space-x-3 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts about this product..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none border-2 focus:border-primary"
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim() || commentMutation.isPending}
                    className="px-6 py-2 rounded-full"
                  >
                    {commentMutation.isPending ? "Posting..." : "Post Comment"}
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