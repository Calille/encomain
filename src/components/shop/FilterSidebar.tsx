import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  categories?: string[];
  brands?: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

interface FilterState {
  search: string;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
}

const FilterSidebar = ({
  onFilterChange = () => {},
  categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Toys"],
  brands = ["Apple", "Samsung", "Nike", "Adidas", "Sony", "Amazon Basics"],
  isOpen = true,
  onClose = () => {},
}: FilterSidebarProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categories: [],
    brands: [],
    priceRange: [0, 1000],
    inStock: false,
    onSale: false,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { 
      ...filters, 
      search: e.target.value 
    } as FilterState;
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    const newFilters = { 
      ...filters, 
      categories: newCategories 
    } as FilterState;
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];

    const newFilters = { 
      ...filters, 
      brands: newBrands 
    } as FilterState;
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      priceRange: [value[0] || 0, value[1] || 1000] as [number, number],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCheckboxChange = (key: "inStock" | "onSale") => {
    const newFilters = { 
      ...filters, 
      [key]: !filters[key] 
    } as FilterState;
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters: FilterState = {
      search: "",
      categories: [],
      brands: [],
      priceRange: [0, 1000] as [number, number],
      inStock: false,
      onSale: false,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0);

  return (
    <div
      className={`w-[250px] h-full bg-white border-r border-gray-200 p-4 flex flex-col overflow-auto ${isOpen ? "block" : "hidden md:block"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          className="pl-8"
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>

      {activeFilterCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {filters.categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCategoryChange(category)}
              />
            </Badge>
          ))}
          {filters.brands.map((brand) => (
            <Badge
              key={brand}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {brand}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleBrandChange(brand)}
              />
            </Badge>
          ))}
          {filters.inStock && (
            <Badge variant="secondary" className="flex items-center gap-1">
              In Stock
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCheckboxChange("inStock")}
              />
            </Badge>
          )}
          {filters.onSale && (
            <Badge variant="secondary" className="flex items-center gap-1">
              On Sale
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleCheckboxChange("onSale")}
              />
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              £{filters.priceRange[0]} - £{filters.priceRange[1]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handlePriceChange([0, 1000])}
              />
            </Badge>
          )}
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={["categories", "price", "brands"]}
        className="w-full"
      >
        <AccordionItem value="categories">
          <AccordionTrigger className="py-2">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger className="py-2">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                defaultValue={[0, 1000]}
                value={[filters.priceRange[0], filters.priceRange[1]]}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
              />
              <div className="text-sm mb-1 flex justify-between">
                <span className="text-sm">£{filters.priceRange[0]}</span>
                <span className="text-sm">£{filters.priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brands">
          <AccordionTrigger className="py-2">Brands</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => handleBrandChange(brand)}
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-sm cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger className="py-2">Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.inStock}
                  onCheckedChange={() => handleCheckboxChange("inStock")}
                />
                <Label htmlFor="in-stock" className="text-sm cursor-pointer">
                  In Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="on-sale"
                  checked={filters.onSale}
                  onCheckedChange={() => handleCheckboxChange("onSale")}
                />
                <Label htmlFor="on-sale" className="text-sm cursor-pointer">
                  On Sale
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-auto pt-4">
        <Button className="w-full" onClick={() => onFilterChange(filters)}>
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
