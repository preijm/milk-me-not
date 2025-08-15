import { useWishlist } from "@/hooks/useWishlist";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageCarousel } from "@/components/wishlist/ImageCarousel";

export const WishlistGrid = () => {
  const { wishlistItems, isLoading, removeFromWishlist, isItemLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your wishlist...</span>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent>
          <div className="text-6xl mb-4">💝</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-4">
            Discover new milk alternatives by browsing the feed and saving products you'd like to try!
          </p>
          <Link to="/feed">
            <Button>Browse Feed</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistItems.map((item) => {
        const productDetails = item.product_details;
        if (!productDetails) return null;

        return (
          <Card 
            key={`wishlist-${item.id}-${item.product_id}`} 
            className="hover:shadow-lg transition-all duration-200 animate-fade-in"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    <span translate="no">{productDetails.brand_name}</span> {productDetails.product_name}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {productDetails.property_names?.slice(0, 2).map((property) => (
                      <Badge key={property} variant="secondary" className="text-xs">
                        {property.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {productDetails.is_barista && (
                      <Badge variant="default" className="text-xs">
                        Barista
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromWishlist(item.product_id)}
                  disabled={isItemLoading(item.product_id)}
                  className="text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  <Bookmark className="h-4 w-4 fill-current transition-transform duration-200 hover:scale-110" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="mb-3">
                <ImageCarousel
                  images={productDetails.all_pictures || (productDetails.picture_path ? [productDetails.picture_path] : [])}
                  brandName={productDetails.brand_name}
                  productName={productDetails.product_name}
                />
              </div>
              
              {productDetails.flavor_names && productDetails.flavor_names.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {productDetails.flavor_names.slice(0, 3).map((flavor) => (
                    <Badge key={flavor} variant="outline" className="text-xs">
                      {flavor}
                    </Badge>
                  ))}
                  {productDetails.flavor_names.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{productDetails.flavor_names.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};