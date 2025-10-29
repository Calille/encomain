import React, { useState } from "react";
import { ShoppingCart, Filter, X } from "lucide-react";
import { Container } from "../components/ui/container";
import Header from "../components/header";
import ProductGrid from "../components/shop/ProductGrid";
import FilterSidebar from "../components/shop/FilterSidebar";
import { Button } from "../components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  brand?: string;
}

const ShopPage = () => {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Sample products data
  const products: Product[] = [
    {
      id: "product-1",
      name: "Premium Headphones",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      category: "Electronics",
      brand: "Sony",
    },
    {
      id: "product-2",
      name: "Smart Watch",
      price: 249.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1399&q=80",
      category: "Electronics",
      brand: "Apple",
    },
    {
      id: "product-3",
      name: "Leather Wallet",
      price: 59.99,
      image:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Accessories",
      brand: "Nike",
    },
    {
      id: "product-4",
      name: "Wireless Earbuds",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Electronics",
      brand: "Samsung",
    },
    {
      id: "product-5",
      name: "Minimalist Backpack",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Accessories",
      brand: "Adidas",
    },
    {
      id: "product-6",
      name: "Fitness Tracker",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Electronics",
      brand: "Samsung",
    },
    {
      id: "product-7",
      name: "Portable Speaker",
      price: 149.99,
      image:
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      category: "Electronics",
      brand: "Sony",
    },
    {
      id: "product-8",
      name: "Designer Sunglasses",
      price: 119.99,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
      category: "Accessories",
      brand: "Nike",
    },
  ];

  // Function to handle adding items to cart
  const handleAddToCart = (productId: string) => {
    setCartItems((prevItems) => [...prevItems, productId]);
    // In a real app, you would likely have more complex cart logic
    console.log(`Added product ${productId} to cart`);
  };

  // Function to handle filter changes
  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    // In a real app, you would filter products based on these filters
    console.log("Filters applied:", filters);
  };

  // Get unique categories and brands for filter options
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  );
  const brands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean)),
  );

  return <></>;
};

export default ShopPage;
