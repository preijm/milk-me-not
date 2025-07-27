import React from "react";
import { Search, Star, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Discover",
    description: "Find plant-based milks that match your taste preferences and needs.",
    color: "text-blue-600"
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Share your honest ratings and help the community make better choices.",
    color: "text-yellow-600"
  },
  {
    icon: Users,
    title: "Connect",
    description: "Join a community of like-minded people passionate about plant-based alternatives.",
    color: "text-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Improve",
    description: "Track your taste journey and discover new favorites based on your ratings.",
    color: "text-green-600"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of plant-milk enthusiasts in discovering your perfect dairy-free match
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;