import { cn } from "@/lib/utils";

interface FeedImageProps {
  picturePath?: string;
  brandName: string;
  productName: string;
  blurred?: boolean;
}

export const FeedImage = ({ picturePath, brandName, productName, blurred }: FeedImageProps) => {
  if (!picturePath) {
    return (
      <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 h-64 sm:h-80 flex items-center justify-center border-2 border-dashed border-primary/20">
        <div className="text-center">
          <div className="text-4xl mb-2">🥛</div>
          <p className="text-sm font-medium text-muted-foreground">No photo available</p>
          <p className="text-xs text-muted-foreground">Share a photo of this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-sm">
      <img 
        src={`https://jtabjndnietpewvknjrm.supabase.co/storage/v1/object/public/milk-pictures/${encodeURIComponent(picturePath)}`}
        alt={`${brandName} ${productName}`}
        className={cn(
          "w-full h-64 sm:h-80 object-cover transition-transform duration-300 hover:scale-105",
          blurred && "blur-md"
        )}
        onError={(e) => {
          console.error('Failed to load image:', picturePath);
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = 'none';
        }}
        onLoad={() => {
          console.log('Successfully loaded image:', picturePath);
        }}
      />
    </div>
  );
};
