"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { productsAPI } from "@/lib/api";
import Link from "next/link";

interface Product {
  _id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  availability: boolean;
  slug: string;
  description: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsAPI.getById(params.id as string);
      
      if (response.success) {
        setProduct(response.data);
        // Fetch related products
        fetchRelatedProducts(response.data.category, response.data._id);
      } else {
        throw new Error(response.error || 'Failed to fetch product');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError(error.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category: string, excludeId: string) => {
    try {
      const response = await productsAPI.getAll({ category, limit: 4 });
      if (response.success) {
        // Filter out current product and limit to 3-4 items
        const related = response.data
          .filter((p: Product) => p._id !== excludeId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await productsAPI.delete(product._id);
      
      if (response.success) {
        router.push('/');
      } else {
        throw new Error(response.error || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
          <Button onClick={() => router.push('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-700">{product.category}</span>
      </div>

      {/* Back Button */}
      <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      {/* Product Details */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        {/* Product Image */}
        <div className="col-span-5">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-96 object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="col-span-7">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              product.availability 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.availability ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Category</p>
            <p className="font-medium">{product.category}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={() => router.push(`/products/${product._id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Product
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Product
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div 
                key={p._id} 
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/products/${p._id}`)}
              >
                <img src={p.image} alt={p.title} className="w-full h-40 object-contain mb-3" />
                <h4 className="font-semibold text-lg mb-1">{p.title}</h4>
                <p className="text-gray-600">${p.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

