import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ShopSelect } from "./milk-test/ShopSelect";
import { CountrySelect } from "./milk-test/CountrySelect";
import { RatingSelect } from "./milk-test/RatingSelect";
import { ProductInformation } from "./milk-test/ProductInformation";
import { DrinkPreference } from "./milk-test/DrinkPreference";
import { PriceInput } from "./milk-test/PriceInput";
import { ResponsiveNotesArea } from "./milk-test/ResponsiveNotesArea";
import { useMilkTestForm } from "@/hooks/useMilkTestForm";
import { useLocation } from "react-router-dom";
import { Trash2, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const AddMilkTest = () => {
  const location = useLocation();
  const editTest = location.state?.editTest;
  const isEditMode = !!editTest;
  
  const {
    formState,
    formSetters,
    handleSubmit,
    handleDelete
  } = useMilkTestForm(editTest);
  const isFormValid = formState.productId && formState.rating > 0 && formState.country && formState.country.trim() !== '';

  return (
    <Card className="bg-white/80 backdrop-blur-sm lg:rounded-2xl lg:shadow-lg lg:border lg:border-white/20 animate-fade-in rounded-none shadow-none border-0">
      <CardHeader className="pb-2">
        <h1 className="hidden lg:block text-2xl font-bold text-gray-900">
          {isEditMode ? "Update Test" : "Add Test"}
        </h1>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pb-8">
        <form onSubmit={e => {
          e.preventDefault();
          if (isFormValid) {
            handleSubmit(e);
          }
        }} className="space-y-6 md:space-y-8">
          {/* Product Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">Product</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <ProductInformation 
                brandId={formState.brandId} 
                setBrandId={formSetters.setBrandId} 
                productId={formState.productId} 
                setProductId={formSetters.setProductId} 
              />
            </div>
          </div>

          {/* Rating Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">Rating</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <RatingSelect rating={formState.rating} setRating={formSetters.setRating} />
              <div className="mt-4">
                <ResponsiveNotesArea 
                  notes={formState.notes} 
                  setNotes={formSetters.setNotes} 
                  picture={formState.picture} 
                  picturePreview={formState.picturePreview} 
                  setPicture={formSetters.setPicture} 
                  setPicturePreview={formSetters.setPicturePreview} 
                />
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">Price-to-Quality Ratio</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <PriceInput 
                price={formState.price} 
                setPrice={formSetters.setPrice} 
                hasChanged={formState.priceHasChanged} 
                setHasChanged={formSetters.setPriceHasChanged} 
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">Buying Location</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <CountrySelect 
                  country={formState.country} 
                  setCountry={formSetters.setCountry} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop (optional)
                </label>
                <ShopSelect 
                  shop={formState.shop} 
                  setShop={formSetters.setShop}
                  selectedCountry={formState.country}
                />
              </div>
            </div>
          </div>

          {/* Drinking Style Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">Drinking Style</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <DrinkPreference 
                preference={formState.drinkPreference} 
                setPreference={formSetters.setDrinkPreference} 
              />
            </div>
          </div>

          {/* Privacy Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 whitespace-nowrap">Privacy</h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="hide-from-feed" className="text-sm font-medium cursor-pointer">
                    Hide from feed
                  </Label>
                </div>
                <Switch
                  id="hide-from-feed"
                  checked={formState.isHiddenFromFeed}
                  onCheckedChange={formSetters.setIsHiddenFromFeed}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                When enabled, this test won't appear in the public feed but will still be visible in your personal results.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {isEditMode && (
              <Button 
                type="button"
                onClick={handleDelete}
                disabled={formState.isSubmitting}
                variant="destructive"
                className="flex-1"
              >
                {formState.isSubmitting ? "Deleting..." : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={formState.isSubmitting || !isFormValid} 
              variant="brand"
              className={isEditMode ? "flex-1" : "w-full"}
            >
              {formState.isSubmitting 
                ? (isEditMode ? "Updating..." : "Adding...") 
                : (isEditMode ? "Save Results" : "Add Result")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
