import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy draft for MOEMA Collection.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-24 max-w-4xl">
      <h1 className="text-4xl font-light uppercase tracking-widest mb-12">Privacy Policy</h1>
      
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-8 leading-relaxed">
        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">1. Introduction</h2>
          <p>
            Welcome to MOEMA. We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy will inform you about how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="bg-muted p-8 border border-muted-foreground/10">
          <p className="text-foreground font-bold italic">
            &gt; [!IMPORTANT]
            &gt; This is a placeholder document. Before launch, please update the sections below with your 
            actual Business Name, Contact Email, and specific Data Collection details.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">2. Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data:</strong> includes payment card details.</li>
            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data 
            to perform the contract we are about to enter into or have entered into with you, or where it is necessary 
            for our legitimate interests.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            <br />
            <strong>[INSERT BUSINESS EMAIL HERE - e.g., legal@moemacollection.com]</strong>
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t">
        <Link href="/" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
          Return to Atelier
        </Link>
      </div>
    </div>
  );
}
