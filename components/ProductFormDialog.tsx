"use client";

import { useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setTitle,
  setImage,
  setCategory,
  setPrice,
  setAvailability,
  setDescription,
  resetForm,
} from "@/lib/slices/formSlice";
import { productsAPI, uploadAPI } from "@/lib/api";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductFormDialog({ open, onOpenChange, onSuccess }: ProductFormDialogProps) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const formState = useAppSelector((state) => state.form);

  // Auto-generate slug from title
  const slug = useMemo(() => {
    if (!formState.title) return "";
    return formState.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [formState.title]);

  // Handle image file upload
  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      setErrorMessage(null);

      const response = await uploadAPI.uploadImage(file);
      
      if (response.success) {
        dispatch(setImage(response.data.url));
      } else {
        throw new Error(response.error || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setErrorMessage(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB');
        return;
      }
      handleImageUpload(file);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formState.title || !formState.image || !formState.category || !formState.price || !formState.description) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const productData = {
        title: formState.title,
        image: formState.image,
        category: formState.category,
        price: parseFloat(formState.price),
        availability: formState.availability,
        description: formState.description,
      };

      // Check if we're editing or creating
      if (formState.editingProductId) {
        // Update existing product
        const response = await productsAPI.update(formState.editingProductId, productData);

        if (response.success) {
          // Reset form and close dialog
          dispatch(resetForm());
          onOpenChange(false);
          setErrorMessage(null);
          
          // Call onSuccess callback to refresh data
          if (onSuccess) {
            onSuccess();
          }
        } else {
          throw new Error(response.error || 'Failed to update product');
        }
      } else {
        // Create new product
        const response = await productsAPI.create(productData);

        if (response.success) {
          // Reset form and close dialog
          dispatch(resetForm());
          onOpenChange(false);
          setErrorMessage(null);
          
          // Call onSuccess callback to refresh data
          if (onSuccess) {
            onSuccess();
          }
        } else {
          throw new Error(response.error || 'Failed to create product');
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      setErrorMessage(error.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    dispatch(resetForm());
    setErrorMessage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle>{formState.editingProductId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {formState.editingProductId 
              ? 'Update the product details below.'
              : 'Fill in the details to add a new product to your store.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(e) => dispatch(setTitle(e.target.value))}
              placeholder="Enter product title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              readOnly
              className="bg-muted cursor-not-allowed"
              placeholder="Auto-generated from title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image *</Label>
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
                <Input
                  id="image"
                  type="url"
                  value={formState.image}
                  onChange={(e) => dispatch(setImage(e.target.value))}
                  placeholder="Or enter image URL"
                  required
                  className="w-full"
                />
              </div>
              {formState.image && (
                <div className="mt-2">
                  <img 
                    src={formState.image} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formState.category} onValueChange={(value) => dispatch(setCategory(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Shoes">Shoes</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formState.price}
              onChange={(e) => dispatch(setPrice(e.target.value))}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="availability"
              checked={formState.availability}
              onCheckedChange={(checked) => dispatch(setAvailability(checked as boolean))}
            />
            <Label htmlFor="availability" className="cursor-pointer">
              Available
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={(e) => dispatch(setDescription(e.target.value))}
              placeholder="Enter product description"
              rows={4}
              required
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || uploading} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {formState.editingProductId ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                formState.editingProductId ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

