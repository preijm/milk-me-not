import React from "react";
import { Shield, Users, TrendingUp, Coffee, Leaf, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Trusted Reviews",
    description: "Real ratings from real people who've actually tried these products.",
    gradient: "from-blue-500/10 to-blue-600/5"
  },
  {
    icon: Users,
    title: "Growing Community",
    description: "Join thousands of plant-milk enthusiasts sharing their discoveries.",
    gradient: "from-purple-500/10 to-purple-600/5"
  },
  {
    icon: TrendingUp,
    title: "Personal Insights",
    description: "Track your preferences and get personalized recommendations.",
    gradient: "from-green-500/10 to-green-600/5"
  },
  {
    icon: Coffee,
    title: "Every Use Case",
    description: "Find the perfect milk for coffee, cereal, baking, or drinking straight.",
    gradient: "from-amber-500/10 to-amber-600/5"
  },
  {
    icon: Leaf,
    title: "Eco-Conscious",
    description: "Make sustainable choices with our environmental impact insights.",
    gradient: "from-emerald-500/10 to-emerald-600/5"
  },
  {
    icon: Heart,
    title: "Health Focused",
    description: "Filter by nutritional content, allergens, and dietary preferences.",
    gradient: "from-red-500/10 to-red-600/5"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most comprehensive plant-based milk discovery platform built by the community, for the community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
              <CardContent className="p-8">
                <div className={`w-14 h-14 mb-6 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;