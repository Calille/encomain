import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
      // Delay to trigger fade-in animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    fadeOutAndClose();
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    fadeOutAndClose();
  };

  const handleClose = () => {
    fadeOutAndClose();
  };

  const fadeOutAndClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:right-auto sm:left-5 sm:w-[280px] max-w-[calc(100vw-2rem)] sm:max-w-none bg-white rounded-lg border border-gray-300 flex flex-col items-start justify-between p-4 sm:p-5 gap-3 sm:gap-4 shadow-lg z-[9997] transition-all duration-300 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-transparent border-none cursor-pointer text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Close cookie banner"
      >
        <X className="h-4 w-4 sm:w-5 sm:h-5" />
      </button>

      <h4 className="text-[#1a1f1c] font-bold text-base m-0">
        We use cookies
      </h4>

      <p className="text-xs font-normal text-gray-700 m-0 leading-relaxed">
        We use cookies to enhance your browsing experience, serve personalized
        content, and analyze our traffic. You can accept or reject optional
        cookies below.
      </p>

      <div className="w-full flex justify-between gap-3">
        <button
          className="w-1/2 py-3 px-3 border-none rounded-md cursor-pointer bg-gray-200 text-[#1a1f1c] font-medium text-sm transition-colors hover:bg-gray-300 active:bg-gray-400 min-h-[44px] flex items-center justify-center"
          onClick={handleReject}
        >
          Reject
        </button>
        <button
          className="w-1/2 py-3 px-3 border-none rounded-md cursor-pointer bg-[#1f4d36] text-white font-medium text-sm transition-colors hover:bg-[#2a6248] active:bg-[#0b3b25] min-h-[44px] flex items-center justify-center"
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

