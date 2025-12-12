"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setDialogOpen,
} from "@/lib/slices/formSlice";
import {
  setSearchQuery,
  toggleCategory,
  setPriceRange,
  setSortBy,
} from "@/lib/slices/filtersSlice";
import { setProducts, setLoading, setError } from "@/lib/slices/productsSlice";
import { productsAPI } from "@/lib/api";

const page = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
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


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Products</h1>
        <div>
          <Button 
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => dispatch(setDialogOpen(true))}
          >
            <Plus size={16} /> Add Product
          </Button>
          <ProductFormDialog
            open={formState.dialogOpen}
            onOpenChange={(open) => dispatch(setDialogOpen(open))}
            onSuccess={fetchProducts}
          />
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* FILTER SIDEBAR */}
        <aside className="lg:col-span-3 bg-white p-4 rounded-2xl shadow-sm">
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
        <div className="lg:col-span-9 relative">
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
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 transition-opacity ${loading && !isInitialLoad ? 'opacity-60' : 'opacity-100'}`}>
          {products.map((p) => (
                  <div 
                    key={p.id || p._id} 
                    className="bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/products/${p._id || p.id}`)}
                  >
                    <img src={p.image} alt={p.title || p.name} className="w-full h-32 sm:h-40 object-contain mb-2 sm:mb-3" />
                    <h4 className="font-semibold text-base sm:text-lg mb-1">{p.title || p.name}</h4>
              <p className="text-gray-600 text-sm sm:text-base">${p.price.toFixed(2)}</p>
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