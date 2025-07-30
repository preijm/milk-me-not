import { useWishlist } from "@/hooks/useWishlist";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export const WishlistGrid = () => {
  const { wishlistItems, isLoading, removeFromWishlist, isRemovingFromWishlist } = useWishlist();

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
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {productDetails.brand_name} {productDetails.product_name}
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
                  disabled={isRemovingFromWishlist}
                  className="text-red-500 hover:text-red-600"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {productDetails.picture_path ? (
                <div className="aspect-square rounded-lg overflow-hidden mb-3">
                  <img
                    src={`https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(productDetails.picture_path)}`}
                    alt={`${productDetails.brand_name} ${productDetails.product_name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center mb-3">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🥛</div>
                    <p className="text-sm text-muted-foreground">No photo</p>
                  </div>
                </div>
              )}
              
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