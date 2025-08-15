import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Get product details for each wishlist item
      const wishlistWithProducts = await Promise.all(
        data.map(async (wishlistItem) => {
          const { data: productData } = await supabase
            .from('milk_tests_view')
            .select(`
              product_id,
              brand_name,
              product_name,
              property_names,
              flavor_names,
              is_barista,
              picture_path
            `)
            .eq('product_id', wishlistItem.product_id)
            .limit(1)
            .maybeSingle();

          return {
            ...wishlistItem,
            product_details: productData
          };
        })
      );

      return wishlistWithProducts;
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      setLoadingItems(prev => new Set(prev).add(productId));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success("Added to wishlist!");
    },
    onError: (error: any, productId) => {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      if (error.code === '23505') {
        toast.error("Already in your wishlist!");
      } else {
        toast.error("Failed to add to wishlist");
      }
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      return productId;
    },
    onMutate: async (productId: string) => {
      setLoadingItems(prev => new Set(prev).add(productId));
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      // Optimistically update to remove the item
      const newWishlist = (previousWishlist as any)?.filter((item: any) => item.product_id !== productId) || [];
      
      queryClient.setQueryData(['wishlist'], newWishlist);

      // Return a context object with the snapshotted value
      return { previousWishlist };
    },
    onSuccess: (productId) => {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      toast.success("Removed from wishlist");
    },
    onError: (err, productId, context: any) => {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      // Rollback on error
      queryClient.setQueryData(['wishlist'], context?.previousWishlist);
      // Refetch to ensure consistency after error
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.error("Failed to remove from wishlist");
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const isItemLoading = (productId: string) => {
    return loadingItems.has(productId);
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isInWishlist,
    isItemLoading,
  };
};