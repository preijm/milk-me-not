import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoryAppLayout } from "@/components/story/StoryAppLayout";
import { ProductRegistrationProvider } from "@/components/milk-test/registration-ui/ProductRegistrationContext";
import { ProductForm } from "@/components/milk-test/registration-ui/FormSections";
import { useToast } from "@/hooks/use-toast";
import { useProductRegistration } from "@/components/milk-test/registration-ui/ProductRegistrationContext";


const AddProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    originalHandleSubmit,
    setIsSubmitting
  } = useProductRegistration();

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
      const result = await originalHandleSubmit(e);
      
      if (result?.productId && result?.brandId) {
        toast({
          title: "Success",
          description: "Product registered successfully",
        });
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
      title={editProductId ? "Edit product" : "Add a product"}
      lede="Not on the shelf yet? Add it here, then rate it."
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
          <AddProductForm />
        </ProductRegistrationProvider>
      </div>
    </StoryAppLayout>
  );
};

export default AddProduct;
