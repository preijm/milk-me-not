import { Link } from "react-router-dom";
import { Milk, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartJourney: () => void;
}

export const HeroSection = ({ onStartJourney }: HeroSectionProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center relative z-10">
      {/* Enhanced hero title with responsive scaling */}
      <div className="mb-4 md:mb-6 relative">
        <h1 className="text-[clamp(1.75rem,6vw,5rem)] md:text-7xl lg:text-8xl font-bold mb-3 md:mb-4 max-w-4xl animate-fade-in relative text-brand-primary leading-tight">
          Ditch the Moo.
          <br />
          <span className="flex items-center justify-center gap-4">
            Find Your New!
          </span>
        </h1>
      </div>

      {/* Enhanced description with better spacing */}
      <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl animate-fade-in leading-relaxed">
        Tired of tasteless plant milks? Rate, discover, and share your faves
        with a community that{"'"}s just as obsessed. Whether it{"'"}s for
        coffee, cereal, or cooking—find the dairy-free match that actually
        delivers.
      </p>

      {/* Enhanced CTA button with better animation */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-fade-in mb-8 md:mb-12">
        <Button
          onClick={onStartJourney}
          size="lg"
          className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 text-white shadow-lg hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300 group bg-brand-secondary hover:bg-brand-secondary/90"
        >
          <Milk className="mr-2 h-6 w-6 md:group-hover:rotate-12 transition-transform duration-300" />
          Start Your Taste Journey
          <ArrowRight className="ml-2 h-5 w-5 md:group-hover:translate-x-1 transition-transform duration-300" />
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 border-2 md:hover:bg-primary/5 transition-all duration-300"
        >
          <Link to="/results">Explore Results</Link>
        </Button>
      </div>
    </div>
  );
};
