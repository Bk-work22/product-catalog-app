"use client";

import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setDialogOpen,
  setTitle,
  setImage,
  setCategory,
  setPrice,
  setAvailability,
  setDescription,
  resetForm,
} from "@/lib/slices/formSlice";
import {
  setSearchQuery,
  toggleCategory,
  setPriceRange,
  setSortBy,
} from "@/lib/slices/filtersSlice";
import { addProduct, setProducts, setLoading, setError } from "@/lib/slices/productsSlice";
import { productsAPI, uploadAPI } from "@/lib/api";

const page = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Redux state
  const { items: products, loading } = useAppSelector((state) => state.products);
  const formState = useAppSelector((state) => state.form);
  const { searchQuery, selectedCategories, priceRange, sortBy } = useAppSelector((state) => state.filters);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
      // Price range: slider value is max price (0 means no limit)
      if (priceRange[0] > 0 && priceRange[0] < 1000) {
        params.maxPrice = priceRange[0];
      }
      if (sortBy) params.sortBy = sortBy;

      const response = await productsAPI.getAll(params);
      
      if (response.success) {
        dispatch(setProducts(response.data));
        setIsInitialLoad(false);
      } else {
        throw new Error(response.error || 'Failed to fetch products');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      dispatch(setError(error.message));
      setIsInitialLoad(false);
    } finally {
      dispatch(setLoading(false));
    }
  }, [searchQuery, selectedCategories, priceRange, sortBy, dispatch]);

  // Initial load on mount
  useEffect(() => {
    if (isInitialLoad) {
      fetchProducts();
    }
  }, []);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!isInitialLoad) {
      const timer = setTimeout(() => {
        fetchProducts();
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timer);
    }
  }, [searchQuery, fetchProducts, isInitialLoad]);

  // Fetch products when other filters change (not search - that's debounced)
  useEffect(() => {
    if (!isInitialLoad) {
      fetchProducts();
    }
  }, [selectedCategories, priceRange, sortBy, fetchProducts, isInitialLoad]);

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

      const response = await productsAPI.create(productData);

      if (response.success) {
        // Add to Redux store
        dispatch(addProduct({
          ...response.data,
          id: response.data._id || response.data.id,
        }));
        
        // Reset form and close dialog
        dispatch(resetForm());
        dispatch(setDialogOpen(false));
        
        // Refresh products list
        await fetchProducts();
      } else {
        throw new Error(response.error || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      setErrorMessage(error.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Dialog open={formState.dialogOpen} onOpenChange={(open: boolean) => dispatch(setDialogOpen(open))}>
          <DialogTrigger asChild>
        <Button className="flex items-center gap-2"><Plus size={16} /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new product to your store.
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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2"
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

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    dispatch(setDialogOpen(false));
                    setErrorMessage(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      <div className="grid grid-cols-12 gap-6">
        {/* FILTER SIDEBAR */}
        <aside className="col-span-3 bg-white p-4 rounded-2xl shadow-sm">
          <Input 
            placeholder="Search" 
            className="mb-4" 
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />


          <h3 className="font-semibold mb-2">Category</h3>
          <div className="space-y-2 mb-4">
            {['Clothing', 'Shoes', 'Accessories', 'Electronics'].map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox 
                  id={cat} 
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() => dispatch(toggleCategory(cat))}
                />
                <label htmlFor={cat} className="cursor-pointer">{cat}</label>
              </div>
            ))}
          </div>


          <h3 className="font-semibold mb-2">Max Price</h3>
          <Slider 
            value={priceRange} 
            onValueChange={(value) => dispatch(setPriceRange(value))} 
            max={1000} 
            min={0}
            step={10}
            className="mb-4" 
          />
          <div className="text-sm text-gray-500">
            {priceRange[0] === 0 ? 'No limit' : `Up to $${priceRange[0]}`}
          </div>


          <h3 className="font-semibold mt-4 mb-2">Sort By</h3>
          <Select value={sortBy || undefined} onValueChange={(value) => dispatch(setSortBy(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low to High</SelectItem>
              <SelectItem value="high">High to Low</SelectItem>
            </SelectContent>
          </Select>
        </aside>


        {/* PRODUCT GRID */}
        <div className="col-span-9 relative">
          {/* Show full loading only on initial load */}
          {loading && isInitialLoad && products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No products found
            </div>
          ) : (
            <div className="relative">
              {/* Subtle loading overlay when filtering (doesn't hide products) */}
              {loading && !isInitialLoad && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
              <div className={`grid grid-cols-4 gap-6 transition-opacity ${loading && !isInitialLoad ? 'opacity-60' : 'opacity-100'}`}>
          {products.map((p) => (
                  <div 
                    key={p.id || p._id} 
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/products/${p._id || p.id}`)}
                  >
                    <img src={p.image} alt={p.title || p.name} className="w-full h-40 object-contain mb-3" />
                    <h4 className="font-semibold text-lg">{p.title || p.name}</h4>
              <p className="text-gray-600">${p.price.toFixed(2)}</p>
            </div>
          ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default page