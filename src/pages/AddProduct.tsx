import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductRegistrationProvider } from "@/components/milk-test/registration-ui/ProductRegistrationContext";
import { ProductForm } from "@/components/milk-test/registration-ui/FormSections";
import { useToast } from "@/hooks/use-toast";
import { useProductRegistration } from "@/components/milk-test/registration-ui/ProductRegistrationContext";
import { handleProductSubmit } from "@/components/milk-test/hooks/product-registration";

const AddProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    brandId,
    productName,
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

  const handleCancel = () => {
    navigate('/add');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {editProductId ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>
      
      <div className="p-4">
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
    </div>
  );
};

export default AddProduct;
