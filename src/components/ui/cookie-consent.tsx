import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
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
      className={`fixed bottom-4 left-4 right-4 z-[9997] flex max-w-[calc(100vw-2rem)] flex-col items-start justify-between gap-3 rounded-lg border border-marketing-border bg-white p-4 shadow-lg transition-all duration-300 ease-in-out sm:left-5 sm:right-auto sm:w-[280px] sm:max-w-none sm:gap-4 sm:p-5 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <button
        onClick={handleClose}
        className="absolute right-3 top-3 flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center border-none bg-transparent text-marketing-muted transition-colors hover:text-marketing-ink sm:right-4 sm:top-4"
        aria-label="Close cookie banner"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
      </button>

      <h4 className="m-0 text-marketing-base font-bold text-marketing-ink">
        We use cookies
      </h4>

      <p className="m-0 text-marketing-xs font-normal leading-relaxed text-marketing-muted">
        We use cookies to enhance your browsing experience, serve personalised
        content, and analyse our traffic. You can accept or reject optional
        cookies below.
      </p>

      <div className="flex w-full justify-between gap-3">
        <button
          className="flex w-1/2 min-h-[44px] cursor-pointer items-center justify-center rounded-md border-none bg-marketing-border px-3 py-3 text-marketing-sm font-medium text-marketing-ink transition-colors hover:bg-marketing-muted/20"
          onClick={handleReject}
        >
          Reject
        </button>
        <button
          className="flex w-1/2 min-h-[44px] cursor-pointer items-center justify-center rounded-md border-none bg-marketing-blue-deep px-3 py-3 text-marketing-sm font-medium text-white transition-colors hover:bg-marketing-blue"
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
