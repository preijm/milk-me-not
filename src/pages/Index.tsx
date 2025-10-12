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
        <div className="flex items-center justify-center min-h-screen pt-16 pb-20 px-4">
          <div className="container max-w-3xl mx-auto relative z-10 w-full">
            <h1 className="text-2xl font-bold mb-6 md:mb-8 text-center text-[#00bf63] md:text-5xl">Moo-ment of Truth</h1>
            <AddMilkTest />
          </div>
        </div>
      </BackgroundPattern>
      <MobileFooter />
    </div>
  );
};
export default Index;