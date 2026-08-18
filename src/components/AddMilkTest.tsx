import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StoryButton, ArrowRight } from "@/components/story/primitives";
import { ShopSelect } from "./milk-test/ShopSelect";
import { CountrySelect } from "./milk-test/CountrySelect";
import { RatingSelect } from "./milk-test/RatingSelect";
import { ProductInformation } from "./milk-test/ProductInformation";
import { DrinkPreference } from "./milk-test/DrinkPreference";
import { PriceInput } from "./milk-test/PriceInput";
import { ResponsiveNotesArea } from "./milk-test/ResponsiveNotesArea";
import { useMilkTestForm } from "@/hooks/useMilkTestForm";
import { useLocation } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AddMilkTest = () => {
  const location = useLocation();
  const editTest = location.state?.editTest;
  const isEditMode = !!editTest;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    formState,
    formSetters,
    handleSubmit,
    handleDelete
  } = useMilkTestForm(editTest);
  const isFormValid = formState.productId && formState.rating > 0 && formState.country && formState.country.trim() !== '';

  // Three critics in a row read the greyed-out submit button as broken rather
  // than as "not filled in yet". It is behaving correctly; what was missing is
  // any statement of what it is still waiting for.
  const missing = [
    !formState.productId && "pick a product",
    !(formState.rating > 0) && "give it a score",
    !(formState.country && formState.country.trim() !== "") && "say where you bought it",
  ].filter(Boolean) as string[];

  return (
    <Card className="story-hairline rounded-3xl border-0 bg-white shadow-none">
      <CardContent className="p-5 md:p-7 md:pb-9">
        <form onSubmit={e => {
          e.preventDefault();
          if (isFormValid) {
            handleSubmit(e);
          }
        }} className="space-y-6 md:space-y-8">
          {/* Product Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="relative flex items-center gap-3">
              <h2 className="story-serif whitespace-nowrap text-[1.15rem] font-bold text-story-ink">Product</h2>
              <div className="h-px flex-1 bg-story-ink/[0.09]"></div>
            </div>
            <div className="rounded-2xl bg-story-cream p-4">
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
              <h2 className="story-serif whitespace-nowrap text-[1.15rem] font-bold text-story-ink">Rating</h2>
              <div className="h-px flex-1 bg-story-ink/[0.09]"></div>
            </div>
            <div className="rounded-2xl bg-story-cream p-4">
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
              <h2 className="story-serif whitespace-nowrap text-[1.15rem] font-bold text-story-ink">Price-to-Quality Ratio</h2>
              <div className="h-px flex-1 bg-story-ink/[0.09]"></div>
            </div>
            <div className="rounded-2xl bg-story-cream p-4">
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
              <h2 className="story-serif whitespace-nowrap text-[1.15rem] font-bold text-story-ink">Buying Location</h2>
              <div className="h-px flex-1 bg-story-ink/[0.09]"></div>
            </div>
            <div className="space-y-3 rounded-2xl bg-story-cream p-4">
              <div>
                <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
                  Country <span className="text-story-amber-dark">*</span>
                </label>
                <CountrySelect 
                  country={formState.country} 
                  setCountry={formSetters.setCountry} 
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.8125rem] font-bold text-story-ink-2">
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
              <h2 className="story-serif whitespace-nowrap text-[1.15rem] font-bold text-story-ink">Drinking Style</h2>
              <div className="h-px flex-1 bg-story-ink/[0.09]"></div>
            </div>
            <div className="rounded-2xl bg-story-cream p-4">
              <DrinkPreference 
                preference={formState.drinkPreference} 
                setPreference={formSetters.setDrinkPreference} 
              />
            </div>
          </div>

          <div className="flex gap-3">
            {isEditMode && (
              <StoryButton
                type="button"
                tone="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={formState.isDeleting || formState.isSubmitting}
                className="flex-1"
              >
                {formState.isDeleting ? "Deleting..." : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </StoryButton>
            )}
            <StoryButton
              type="submit"
              disabled={formState.isSubmitting || formState.isDeleting || !isFormValid}
              className={isEditMode ? "flex-1" : "w-full"}
            >
              {formState.isSubmitting
                ? (isEditMode ? "Updating..." : "Adding...")
                : (isEditMode ? "Save your rating" : "Post my rating")}
              {!formState.isSubmitting && <ArrowRight />}
            </StoryButton>
          </div>

          {missing.length > 0 && (
            <p className="-mt-3 text-center text-[0.8125rem] text-story-muted">
              Still need to {missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`}.
            </p>
          )}
        </form>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Test Record</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this test? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
