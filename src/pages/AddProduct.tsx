import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { rememberBarcode, scannedBarcodeFrom } from "@/lib/rememberBarcode";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";
import { ProductRegistrationProvider } from "@/components/milk-test/registration-ui/ProductRegistrationContext";
import { ProductForm } from "@/components/milk-test/registration-ui/FormSections";
import { useToast } from "@/hooks/use-toast";
import { useProductRegistration } from "@/components/milk-test/registration-ui/ProductRegistrationContext";


const AddProductForm = ({ editing }: { editing: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const {
    originalHandleSubmit,
    setIsSubmitting
  } = useProductRegistration();

  /**
   * The barcode that brought the reader here, if a scan did.
   *
   * Every scan the board had not seen before and that ended in this form used
   * to save the product and drop the barcode, so the next person scanning the
   * same carton went through the same search and the same form. Read once at
   * render rather than at submit: navigating away replaces router state.
   */
  const scannedBarcode = editing ? null : scannedBarcodeFrom(location.state);

  const handleSuccess = (productId: string, brandId: string) => {
    navigate('/add', { 
      state: { 
        selectedProductId: productId, 
        selectedBrandId: brandId 
      } 
    });
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/add');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSubmitting(true);

    try {
      // `true` skips the provider's own onSuccess, which navigated before this
      // function got the result back — so the barcode below would have been
      // recorded from a page already gone, and the reader navigated twice.
      const result = await originalHandleSubmit(e, true);

      if (result?.productId && result?.brandId) {
        // A duplicate is the same carton described the same way, so the
        // barcode belongs to it just as surely as to a product made just now.
        if (scannedBarcode) await rememberBarcode(scannedBarcode, result.productId);

        // A duplicate used to come back without its brand and fall through
        // here silently: Save did nothing and said nothing. It is now the
        // likeliest outcome for a reader sent from the scan's "not here"
        // button whose carton was on the board after all, so it goes to the
        // existing product instead.
        toast(
          result.isDuplicate
            ? { title: "Already on the board", description: "We took you to the one that is there." }
            : { title: "Success", description: "Product registered successfully" },
        );
        handleSuccess(result.productId, result.brandId);
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast({
        title: "Error",
        description: "Failed to register product",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProductId = searchParams.get('edit');

  return (
    <StoryAppLayout
      kicker="New to the board"
      title={editProductId ? "Fix this" : "Add a"}
      accent={editProductId ? "carton." : "carton."}
      lede="Not on the board yet? Put it there, then rate it."
      back={{ to: "/add", label: "Back to rating" }}
    >
      <div className="story-hairline rounded-3xl bg-white p-5 md:p-7">
        <ProductRegistrationProvider
          formProps={{
            open: true,
            onOpenChange: () => {},
            onSuccess: (productId: string, brandId: string) => {
              navigate('/add', {
                state: {
                  selectedProductId: productId,
                  selectedBrandId: brandId
                }
              });
            },
            editProductId: editProductId || undefined
          }}
        >
          <AddProductForm editing={Boolean(editProductId)} />
        </ProductRegistrationProvider>
      </div>
    </StoryAppLayout>
  );
};

export default AddProduct;
