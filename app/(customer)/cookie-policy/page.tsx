import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how MOEMA uses cookies to provide a luxury shopping experience.",
  alternates: {
    canonical: "https://www.moemacollection.com/cookie-policy",
  },
};

export default function CookiePolicyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="container py-24 max-w-4xl">
      <h1 className="text-4xl font-light uppercase tracking-widest mb-12 font-serif">Cookie Policy</h1>
      
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-8 leading-relaxed font-sans">
        <section>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-8">
            Last Updated: {lastUpdated}
          </p>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">1. What are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
            They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
            At MOEMA, we use cookies sparingly and only to ensure you have a seamless experience while browsing our collection.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">2. Types of Cookies We Use</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-foreground font-semibold uppercase tracking-wide text-sm mb-2">Essential Cookies</h3>
              <p>
                These cookies are necessary for the website to function and cannot be switched off in our systems. 
                They are usually only set in response to actions made by you which amount to a request for services, 
                such as setting your privacy preferences, logging in, or adding items to your shopping bag.
              </p>
            </div>
            <div>
              <h3 className="text-foreground font-semibold uppercase tracking-wide text-sm mb-2">Preference Cookies</h3>
              <p>
                These cookies allow the website to remember choices you make (such as your region or currency settings) 
                and provide enhanced, more personal features.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 p-8 border border-neutral-100">
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">3. No Tracking or Marketing Cookies</h2>
          <p className="text-foreground font-medium">
            MOEMA does not use any third-party analytics, tracking, or marketing cookies. 
            We do not use Google Analytics, Meta Pixel, or any other scripts that track your behavior across other websites. 
            Your privacy and focus on our atelier products are our only priorities.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">4. Managing Cookies</h2>
          <p>
            You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. 
            Detailed instructions on how to manage cookies in different browsers can usually be found in the browser&apos;s 
            &quot;Help&quot; or &quot;Settings&quot; menu.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">5. More Information</h2>
          <p>
            For more information on how we handle your data, please visit our{" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-4 hover:text-moema-dark transition-colors">
              Privacy Policy
            </Link>.
          </p>
          <p className="mt-4">
            If you have any questions regarding our use of cookies, please contact us at:
            <br />
            <span className="text-foreground font-bold">[legal@moemacollection.com]</span>
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t">
        <Link href="/" className="text-xs font-bold uppercase tracking-widest hover:text-moema-dark transition-colors">
          Return to Moema Collection
        </Link>
      </div>
    </div>
  );
}
