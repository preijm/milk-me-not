import { useEffect, useState } from "react";
import { AddMilkTest } from "@/components/AddMilkTest";
import MenuBar from "@/components/MenuBar";
import MobileFooter from "@/components/MobileFooter";
import BackgroundPattern from "@/components/BackgroundPattern";

// Note: This page is now protected by ProtectedRoute in App.tsx
const Index = () => {
  return (
    <div className="min-h-screen">
      <MenuBar />
      <BackgroundPattern>
        <div className="container max-w-3xl mx-auto px-4 py-6 md:py-8 pt-24 md:pt-32 pb-20 sm:pb-6 md:pb-8 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center md:text-left">Moo-ment of Truth</h1>
          <AddMilkTest />
        </div>
      </BackgroundPattern>
      
      <MobileFooter />
    </div>
  );
};

export default Index;