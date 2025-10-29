import { useState } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Calculator, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { sendToGoogleSheets } from "../../utils/googleSheets";

type BusinessType = "small" | "medium" | "ecommerce" | "professional";
type PageCount = "5" | "10" | "15" | "20+";
type Feature =
  | "seo"
  | "booking"
  | "ecommerce"
  | "blog"
  | "animations"
  | "multilingual";

const businessTypeOptions = [
  { value: "small", label: "Small Business", basePrice: 1199 },
  { value: "medium", label: "Medium Business", basePrice: 1999 },
  { value: "ecommerce", label: "E-commerce", basePrice: 2499 },
  { value: "professional", label: "Professional Services", basePrice: 2299 },
];

const pageCountOptions = [
  { value: "5", label: "5 Pages", priceModifier: 0 },
  { value: "10", label: "10 Pages", priceModifier: 400 },
  { value: "15", label: "15 Pages", priceModifier: 800 },
  { value: "20+", label: "20+ Pages", priceModifier: 1200 },
];

const featureOptions = [
  { value: "seo", label: "Advanced SEO Optimization", price: 399 },
  { value: "booking", label: "Booking/Scheduling System", price: 549 },
  { value: "ecommerce", label: "E-commerce Functionality", price: 799 },
  { value: "blog", label: "Blog/News Section", price: 299 },
  { value: "animations", label: "Custom Animations", price: 449 },
  { value: "multilingual", label: "Multilingual Support", price: 649 },
];

export function CostCalculator() {
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [pageCount, setPageCount] = useState<PageCount | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    businessType: "",
    pageCount: "",
    features: "",
    estimatedCost: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleFeature = (feature: Feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const calculatePrice = () => {
    if (!businessType || !pageCount) return 0;

    const businessTypeOption = businessTypeOptions.find(
      (option) => option.value === businessType,
    );
    const pageCountOption = pageCountOptions.find(
      (option) => option.value === pageCount,
    );

    if (!businessTypeOption || !pageCountOption) return 0;

    let totalPrice =
      businessTypeOption.basePrice + pageCountOption.priceModifier;

    // Add feature prices
    selectedFeatures.forEach((feature) => {
      const featureOption = featureOptions.find(
        (option) => option.value === feature,
      );
      if (featureOption) {
        totalPrice += featureOption.price;
      }
    });

    return totalPrice;
  };

  const handleCalculate = () => {
    if (businessType && pageCount) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setBusinessType(null);
    setPageCount(null);
    setSelectedFeatures([]);
    setShowResults(false);
    setShowContactForm(false);
    setIsSubmitted(false);
    setError("");
  };

  const handleContactFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Prepare form data for Google Sheets
    const totalPrice = calculatePrice();
    const sheetFormData = {
      ...formData,
      businessType: businessType || "",
      pageCount: pageCount || "",
      features: selectedFeatures.join(", "),
      estimatedCost: `£${totalPrice.toLocaleString()}`,
      source: "Cost Calculator",
      timestamp: new Date().toISOString(),
    };

    try {
      // Send to Google Sheets
      const result = await sendToGoogleSheets(sheetFormData);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(
        "There was an issue submitting your form. We've saved your data and will try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const totalPrice = calculatePrice();
  const recommendedPackage =
    totalPrice <= 1599 ? "Basic" : totalPrice <= 2499 ? "Standard" : "Premium";

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-[#1A4D2E] p-4 text-white flex items-center justify-between">
        <div className="flex items-center">
          <Calculator className="mr-2" />
          <h3 className="font-semibold text-lg">Website Cost Calculator</h3>
        </div>
        {(showResults || showContactForm) && (
          <button onClick={handleReset} className="text-sm underline">
            Start Over
          </button>
        )}
      </div>

      <div className="p-6">
        {!showResults && !showContactForm && !isSubmitted && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">
                1. What type of business do you have?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businessTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setBusinessType(option.value as BusinessType)
                    }
                    className={`p-3 border rounded-lg text-left transition-all ${businessType === option.value ? "border-[#1A4D2E] bg-[#1A4D2E]/5 ring-1 ring-[#1A4D2E]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">
                      Starting at £{option.basePrice}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">
                2. How many pages do you need?
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pageCountOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPageCount(option.value as PageCount)}
                    className={`p-3 border rounded-lg text-center transition-all ${pageCount === option.value ? "border-[#1A4D2E] bg-[#1A4D2E]/5 ring-1 ring-[#1A4D2E]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">
                3. Select additional features (optional)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featureOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleFeature(option.value as Feature)}
                    className={`p-3 border rounded-lg text-left transition-all flex justify-between items-center ${selectedFeatures.includes(option.value as Feature) ? "border-[#1A4D2E] bg-[#1A4D2E]/5 ring-1 ring-[#1A4D2E]" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">
                        +£{option.price}
                      </div>
                    </div>
                    {selectedFeatures.includes(option.value as Feature) && (
                      <Check className="h-5 w-5 text-[#1A4D2E]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!businessType || !pageCount}
              className="w-full bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white font-medium py-6 text-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              Calculate Estimate
            </Button>
          </div>
        )}

        {showResults && !showContactForm && !isSubmitted && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-[#1A4D2E] mb-2">
                Your Estimated Cost
              </h4>
              <div className="text-4xl font-bold text-[#2D5F3F]">
                £{totalPrice.toLocaleString()}
              </div>
              <p className="mt-2 text-gray-600">
                Based on your selections, we recommend our{" "}
                <span className="font-semibold">
                  {recommendedPackage} Package
                </span>
              </p>
            </div>

            <div className="bg-[#F8FAF9] p-4 rounded-lg">
              <h5 className="font-medium mb-2">Your Selections:</h5>
              <ul className="space-y-1 text-sm">
                <li>
                  <span className="text-gray-600">Business Type:</span>{" "}
                  {
                    businessTypeOptions.find(
                      (option) => option.value === businessType,
                    )?.label
                  }
                </li>
                <li>
                  <span className="text-gray-600">Page Count:</span>{" "}
                  {
                    pageCountOptions.find(
                      (option) => option.value === pageCount,
                    )?.label
                  }
                </li>
                {selectedFeatures.length > 0 && (
                  <li>
                    <span className="text-gray-600">Additional Features:</span>{" "}
                    {selectedFeatures
                      .map(
                        (feature) =>
                          featureOptions.find(
                            (option) => option.value === feature,
                          )?.label,
                      )
                      .join(", ")}
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setShowContactForm(true)}
                className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white font-medium py-6 text-lg transition-transform hover:scale-105"
              >
                Request a Free Consultation
              </Button>
              <p className="text-center text-sm text-gray-500">
                This is an estimate. Get an accurate quote by scheduling a free
                consultation.
              </p>
            </div>
          </div>
        )}

        {showContactForm && !isSubmitted && (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-xl font-bold text-[#1A4D2E] mb-2">
                Request Your Free Consultation
              </h4>
              <p className="text-gray-600">
                Fill out the form below and one of our experts will contact you
                shortly.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleContactFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Tell us more about your project requirements..."
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white font-medium py-6 text-lg transition-transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </div>
        )}

        {isSubmitted && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-[#1A4D2E]">Thank You!</h4>
            <p className="text-gray-600">
              Your consultation request has been submitted. One of our experts
              will contact you shortly at {formData.email}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button
                onClick={handleReset}
                className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white font-medium transition-transform hover:scale-105"
              >
                Start New Calculation
              </Button>
              <Link to="/contact">
                <Button className="bg-[#2D5F3F] hover:bg-[#2D5F3F]/90 text-white font-medium transition-transform hover:scale-105 w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
