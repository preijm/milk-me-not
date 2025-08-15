import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export const WishlistButton = ({ 
  productId, 
  variant = "ghost", 
  size = "sm",
  className,
  showText = false
}: WishlistButtonProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(productId);
  const isLoading = isAddingToWishlist || isRemovingFromWishlist;

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn(
        "transition-colors",
        inWishlist && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "transition-all",
          inWishlist ? "fill-current" : "fill-none",
          showText ? "mr-2" : ""
        )} 
      />
      {showText && (inWishlist ? "Remove from Wishlist" : "Save for Later")}
    </Button>
  );
};