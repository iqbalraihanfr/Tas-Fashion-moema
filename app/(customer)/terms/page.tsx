import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <div className="container py-24 max-w-4xl">
      <h1 className="text-4xl font-light uppercase tracking-widest mb-12">Terms & Conditions</h1>
      
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-8 leading-relaxed">
        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">1. Terms of Use</h2>
          <p>
            By accessing this website, we assume you accept these terms and conditions. 
            Do not continue to use MOEMA if you do not agree to take all of the terms and conditions stated on this page.
          </p>
        </section>

        <section className="bg-muted p-8 border border-muted-foreground/10">
          <p className="text-foreground font-bold italic">
            &gt; [!IMPORTANT]
            &gt; This is a placeholder document. Before launch, please update with your 
            actual Business Entity Name, Governing Law, and Refund Policy details.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">2. Intellectual Property</h2>
          <p>
            Unless otherwise stated, MOEMA and/or its licensors own the intellectual property rights for all material on MOEMA. 
            All intellectual property rights are reserved. You may access this from MOEMA for your own personal use subjected 
            to restrictions set in these terms and conditions.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">3. Shipping & Delivery</h2>
          <p>
            Orders are processed within [X] business days. Shipping times vary depending on your location. 
            [INSERT SPECIFIC SHIPPING DETAILS FOR INDONESIA/INTERNATIONAL HERE].
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold uppercase tracking-wide text-lg mb-4">4. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of Indonesia 
            and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
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
