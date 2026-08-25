import { cn } from "@/lib/utils";
import { ProductIdentity } from "@/components/story/ProductIdentity";

interface FeedProductInfoProps {
  brandName: string;
  productName: string;
  isBarista?: boolean;
  propertyNames?: string[];
  flavorNames?: string[];
  className?: string;
}

/**
 * The product line of a verdict card.
 *
 * This used to build its own mark straight from `inferPlantBase`, so the feed
 * showed a three-letter plant-base tile even for the brands we have a logo for
 * — a carton that appeared as the Alpro roundel on the board turned into a
 * green "OAT" square here. It also joined brand and product with " - " in the
 * serif face, which no other surface did. Both now come from ProductIdentity,
 * which prefers a real logo and falls back to the base tile.
 */
export const FeedProductInfo = ({
  brandName,
  productName,
  isBarista,
  propertyNames,
  flavorNames,
  className,
}: FeedProductInfoProps) => (
  <ProductIdentity
    brand={brandName}
    product={productName}
    properties={propertyNames}
    flavors={flavorNames}
    isBarista={isBarista}
    size="md"
    className={cn("items-start", className)}
  />
);

export default FeedProductInfo;
