"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;

    const consent = localStorage.getItem("moema_cookie_consent");
    if (!consent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowBanner(true);
    }
  }, [isAdminRoute]);

  useEffect(() => {
    const root = document.documentElement;

    if (!showBanner || isAdminRoute || !bannerRef.current) {
      root.style.setProperty("--mobile-consent-offset", "0px");
      return;
    }

    const updateOffset = () => {
      const height = bannerRef.current?.offsetHeight ?? 0;
      root.style.setProperty("--mobile-consent-offset", `${height}px`);
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(() => updateOffset());
    resizeObserver.observe(bannerRef.current);

    return () => {
      resizeObserver.disconnect();
      root.style.setProperty("--mobile-consent-offset", "0px");
    };
  }, [showBanner, isAdminRoute]);

  const handleAccept = () => {
    localStorage.setItem("moema_cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("moema_cookie_consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner || isAdminRoute) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed inset-x-0 bottom-0 z-[var(--z-cookie-consent)] animate-in slide-in-from-bottom duration-500 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] md:px-0 md:pb-0"
    >
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-primary text-white shadow-2xl md:rounded-none md:border-x-0 md:border-b-0 md:border-t">
        <div className="container max-w-7xl mx-auto px-6 py-5 md:py-4">
          <div className="flex flex-col items-start gap-5 pr-10 md:flex-row md:items-center md:justify-between md:gap-8 md:pr-0">
            <div className="flex-1 text-left">
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
          
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center md:w-auto">
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
      </div>
      
      {/* Optional close button for a cleaner dismissal if they don't want to choose */}
      <button 
        onClick={() => setShowBanner(false)}
        className="absolute right-7 top-4 opacity-40 transition-opacity hover:opacity-100 md:right-6 md:top-1/2 md:-translate-y-1/2"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
