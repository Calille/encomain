import React, { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import { Button } from "../ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

interface ProductGridProps {
  products?: Product[];
  onAddToCart?: (id: string) => void;
  showFilters?: boolean;
}

const ProductGrid = ({
  products = [
    {
      id: "product-1",
      name: "Premium Headphones",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "Electronics",
    },
    {
      id: "product-2",
      name: "Smart Watch",
      price: 249.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1399&q=80",
      category: "Electronics",
    },
    {
      id: "product-3",
      name: "Leather Wallet",
      price: 59.99,
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Accessories",
    },
    {
      id: "product-4",
      name: "Wireless Earbuds",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Electronics",
    },
    {
      id: "product-5",
      name: "Minimalist Backpack",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Accessories",
    },
    {
      id: "product-6",
      name: "Fitness Tracker",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Electronics",
    },
    {
      id: "product-7",
      name: "Portable Speaker",
      price: 149.99,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Electronics",
    },
    {
      id: "product-8",
      name: "Designer Sunglasses",
      price: 119.99,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      category: "Accessories",
    },
  ],
  onAddToCart = (id) => console.log(`Added product ${id} to cart`),
  showFilters = true,
}: ProductGridProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState("featured");

  // Sorting logic (basic implementation)
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "price-low") return a.price - b.price;
    if (sortOption === "price-high") return b.price - a.price;
    // Default to featured/original order
    return 0;
  });

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-gray-50 p-4">
      {/* Mobile filter button */}
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Sort options */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Mobile filters (conditionally rendered) */}
      {mobileFiltersOpen && (
        <div className="lg:hidden mb-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-medium mb-3">Categories</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" id="electronics-mobile" className="mr-2" />
              <label htmlFor="electronics-mobile">Electronics</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="accessories-mobile" className="mr-2" />
              <label htmlFor="accessories-mobile">Accessories</label>
            </div>
          </div>

          <h3 className="font-medium mt-4 mb-3">Price Range</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="under100-mobile"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                onChange={() => {}}
              />
              <label htmlFor="under100-mobile">Under £100</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="100to200-mobile"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                onChange={() => {}}
              />
              <label htmlFor="100to200-mobile">£100 - £200</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="over200-mobile"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                onChange={() => {}}
              />
              <label htmlFor="over200-mobile">Over £200</label>
            </div>
          </div>
        </div>
      )}

      {/* Main content area with grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <div key={product.id} className="flex justify-center">
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your filters or search criteria
          </p>
          <Button onClick={() => window.location.reload()}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
