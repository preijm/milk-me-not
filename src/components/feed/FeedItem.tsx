import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MilkTestResult } from "@/types/milk-test";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Star, Plus, MapPin, DollarSign, Clock, ThumbsUp, ThumbsDown, Edit3, BarChart3 } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { EditMilkTest } from "@/components/milk-test/EditMilkTest";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getScoreBadgeVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";
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
export const FeedItem = ({
  item,
  blurred = false,
  disabled = false
}: FeedItemProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [editingTest, setEditingTest] = useState<MilkTestResult | null>(null);

  // Check if current user is the author of this milk test
  const isOwnPost = user?.id === item.user_id;

  // Fetch likes for this milk test
  const {
    data: likes = []
  } = useQuery({
    queryKey: ['likes', item.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('likes').select('id, user_id').eq('milk_test_id', item.id);
      if (error) throw error;

      // Fetch usernames for likes
      const likesWithUsernames = await Promise.all((data || []).map(async like => {
        const {
          data: profile
        } = await supabase.from('profiles').select('username').eq('id', like.user_id).maybeSingle();
        return {
          ...like,
          username: profile?.username || 'Anonymous'
        };
      }));
      return likesWithUsernames as Like[];
    }
  });

  // Fetch comments for this milk test
  const {
    data: comments = []
  } = useQuery({
    queryKey: ['comments', item.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('comments').select(`
          id,
          user_id,
          content,
          created_at
        `).eq('milk_test_id', item.id).order('created_at', {
        ascending: true
      });
      if (error) throw error;

      // Fetch usernames separately
      const commentsWithUsernames = await Promise.all((data || []).map(async comment => {
        const {
          data: profile
        } = await supabase.from('profiles').select('username').eq('id', comment.user_id).maybeSingle();
        return {
          ...comment,
          username: profile?.username || 'Anonymous'
        };
      }));
      return commentsWithUsernames as Comment[];
    }
  });
  const isLiked = likes.some(like => like.user_id === user?.id);

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (isLiked) {
        const {
          error
        } = await supabase.from('likes').delete().eq('user_id', user.id).eq('milk_test_id', item.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from('likes').insert({
          user_id: user.id,
          milk_test_id: item.id
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['likes', item.id]
      });
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
      const {
        error
      } = await supabase.from('comments').insert({
        user_id: user.id,
        milk_test_id: item.id,
        content: content.trim()
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', item.id]
      });
      setCommentText("");
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
  const handleComment = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive"
      });
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };
  const handleViewAllResults = () => {
    navigate(`/product/${item.product_id}`);
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
    return <Badge variant={getScoreBadgeVariant(Number(rating))}>
        {formatScore(Number(rating))}
      </Badge>;
  };
  return <div className={cn("w-full", disabled && "pointer-events-none")}>
    <Card id={`test-${item.id}`} className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 hover-scale">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <Badge variant="category" className="w-8 h-8 rounded-full flex items-center justify-center p-0 font-medium text-sm flex-shrink-0">
              {item.username?.charAt(0).toUpperCase() || 'U'}
            </Badge>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className={cn("font-semibold text-foreground text-sm", blurred && "blur-sm")} translate="no">{item.username}</span>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true
                  })}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {renderRating(item.rating)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Brand, Product Name and Badges - Above Picture */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-border/50">
          <span className="text-sm font-medium text-foreground">
            <span translate="no">{item.brand_name}</span>
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            • {item.product_name}
          </span>
          {item.is_barista && <Badge variant="barista" className="text-xs font-medium px-1.5 py-0.5">
              Barista
            </Badge>}
          {item.property_names?.slice(0, 2).map(property => <Badge key={property} variant="category" className="text-xs font-medium px-1.5 py-0.5">
              {property.replace(/_/g, ' ')}
            </Badge>)}
          {item.flavor_names?.slice(0, 1).map(flavor => <Badge key={flavor} variant="flavor" className="text-xs font-medium px-1.5 py-0.5">
              {flavor}
            </Badge>)}
        </div>
        {/* Enhanced Photo Display */}
        {item.picture_path ? <div className="rounded-lg overflow-hidden shadow-sm">
            <img src={`https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(item.picture_path)}`} alt={`${item.brand_name} ${item.product_name}`} className={cn("w-full h-64 sm:h-80 object-cover transition-transform duration-300 hover:scale-105", blurred && "blur-md")} onError={e => {
            console.error('Failed to load image:', item.picture_path);
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            // Show fallback
            const fallback = target.parentElement?.nextElementSibling;
            if (fallback) {
              (fallback as HTMLElement).style.display = 'flex';
            }
          }} onLoad={() => {
            console.log('Successfully loaded image:', item.picture_path);
          }} />
          </div> : null}
        
        {/* Enhanced Fallback placeholder */}
        <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 h-64 sm:h-80 flex items-center justify-center border-2 border-dashed border-primary/20" style={{
          display: item.picture_path ? 'none' : 'flex'
        }}>
          <div className="text-center">
            <div className="text-4xl mb-2">🥛</div>
            <p className="text-sm font-medium text-muted-foreground">No photo available</p>
            <p className="text-xs text-muted-foreground">Share a photo of this product!</p>
          </div>
        </div>

        {/* Notes */}
        {item.notes && <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary">
            <p className="text-sm text-foreground font-medium italic">"{item.notes}"</p>
          </div>}

        {/* Enhanced Product Context */}
        

        {/* Enhanced Engagement Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleLike} disabled={likeMutation.isPending} className={cn("flex items-center space-x-1 px-2 py-1.5 rounded-full transition-all duration-200", isLiked ? "text-red-500 bg-red-50 hover:bg-red-100" : "hover:bg-gray-50")}>
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                    <span className="font-semibold text-sm">{likes.length}</span>
                    <span className="text-xs hidden sm:inline">Likes</span>
                  </Button>
                </TooltipTrigger>
                {likes.length > 0 && <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">Liked by:</p>
                      {likes.map(like => <p key={like.id} className="text-sm">{like.username}</p>)}
                    </div>
                  </TooltipContent>}
              </Tooltip>
            </TooltipProvider>
            
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-all duration-200">
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold text-sm">{comments.length}</span>
              <span className="text-xs hidden sm:inline">Comments</span>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleViewAllResults} className="flex items-center space-x-1 px-2 py-1.5 rounded-full hover:bg-gray-50 transition-all duration-200">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">View All</span>
            </Button>
          </div>

          {isOwnPost && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingTest(item)} 
              className="rounded-full h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Comments section */}
        {showComments && <div className="space-y-3 pt-3 border-t border-border/50">
            {comments.map(comment => <div key={comment.id} className="flex space-x-2 p-2 bg-muted/20 rounded-lg">
                <Avatar className="h-8 w-8 ring-1 ring-primary/10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {comment.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-foreground text-sm" translate="no">{comment.username}</span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-2.5 w-2.5 mr-1" />
                      {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true
                  })}
                    </span>
                  </div>
                  <p className="text-foreground text-sm mt-1">{comment.content}</p>
                </div>
              </div>)}

            {/* Add comment */}
            {user && <div className="flex space-x-2 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-8 w-8 ring-1 ring-primary/10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea placeholder="Share your thoughts about this product..." value={commentText} onChange={e => setCommentText(e.target.value)} className="min-h-[80px] resize-none border-2 focus:border-primary" />
                  <Button size="sm" onClick={handleComment} disabled={!commentText.trim() || commentMutation.isPending} className="px-6 py-2 rounded-full">
                    {commentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>}
          </div>}
      </CardContent>

      {/* Edit Modal */}
      {editingTest && <EditMilkTest test={editingTest} open={!!editingTest} onOpenChange={open => !open && setEditingTest(null)} onSuccess={() => {
        // Invalidate queries to refresh the feed
        queryClient.invalidateQueries({
          queryKey: ['feed']
        });
        queryClient.invalidateQueries({
          queryKey: ['userMilkTests']
        });
        setEditingTest(null);
      }} />}
    </Card>
    </div>;
};