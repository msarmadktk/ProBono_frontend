// pages/index.js
'use client'
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ShoppingBag } from "lucide-react";
import Image from 'next/image';

export default function DigitalProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/digital-products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getInitials = (name) => {
    if (!name) return "NA";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700">{error}</p>
        <p className="mt-4 text-gray-600">Please make sure your API server is running at http://localhost:5000</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-[2rem] py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Products</h1>
        <p className="text-gray-600">Discover premium digital products from top-rated freelancers</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-gray-200">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4">
                <div className="mb-3">
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                    {product.product_name.includes("React") ? "React" : "UI/UX"}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.product_name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                <div className="flex items-center mt-3">
                  <ShoppingBag size={16} className="text-gray-500 mr-1" />
                  <span className="text-gray-500 text-sm">Digital Download</span>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage 
                      src="/api/placeholder/40/40"
                      alt={`Avatar for ${product.freelancer_email}`} 
                    />
                    <AvatarFallback>{getInitials(product.freelancer_email.split('@')[0])}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{product.freelancer_email.split('@')[0]}</p>
                    <p className="text-sm text-gray-600">Top rated</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-semibold text-gray-900">
                    ${typeof product.price === "number" ? product.price.toFixed(2) : "20"}
                  </div>
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium ml-1">
                      {typeof product.average_rating === "number" ? product.average_rating.toFixed(1) : "4.6"}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
