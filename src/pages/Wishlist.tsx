import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPatternWithOverlay from "@/components/BackgroundPatternWithOverlay";
import { WishlistGrid } from "@/components/WishlistGrid";

const Wishlist = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPatternWithOverlay>
        <div className="pt-24 pb-8 min-h-screen">
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <h1 className="text-3xl font-bold text-[#00bf63] mb-8">My Wishlist</h1>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 animate-fade-up">
              <WishlistGrid />
            </div>
          </div>
        </div>
      </BackgroundPatternWithOverlay>
      <MobileFooter />
    </div>
  );
};

export default Wishlist;