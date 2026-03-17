"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("moema_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("moema_cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("moema_cookie_consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-white border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-500">
      <div className="container max-w-7xl mx-auto px-6 py-6 md:py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs md:text-sm font-sans tracking-wide leading-relaxed opacity-90">
              We use essential cookies to ensure our website works properly and to provide you with the best shopping experience. 
              {" "}
              <Link 
                href="/cookie-policy" 
                className="underline underline-offset-4 hover:text-moema-dark transition-colors"
              >
                Learn more in our Cookie Policy.
              </Link>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleAccept}
              className="w-full sm:w-auto px-10 py-3 bg-moema-dark text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-moema-dark/90 active:scale-95"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="w-full sm:w-auto px-10 py-3 bg-transparent border border-white/30 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black active:scale-95"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
      
      {/* Optional close button for a cleaner dismissal if they don't want to choose */}
      <button 
        onClick={() => setShowBanner(false)}
        className="absolute top-4 right-4 md:top-1/2 md:-translate-y-1/2 md:right-6 opacity-40 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
