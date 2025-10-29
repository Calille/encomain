import React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface ProductCardProps {
  id?: string;
  name?: string;
  price?: number;
  oldPrice?: number;
  image?: string;
  onAddToCart?: (id: string) => void;
}

const ProductCard = ({
  id = "product-1",
  name = "Premium Product",
  price = 99.99,
  oldPrice,
  image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1399&q=80",
  onAddToCart = () => console.log("Added to cart"),
}: ProductCardProps) => {
  return (
    <Card className="w-[280px] h-[380px] overflow-hidden flex flex-col bg-white">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg font-medium">{name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xl font-bold text-primary">£{price.toFixed(2)}</p>
            {oldPrice && (
              <p className="text-sm text-gray-500 line-through">
                £{oldPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          High-quality product with premium features and excellent durability.
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(id)}
          className="w-full flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
