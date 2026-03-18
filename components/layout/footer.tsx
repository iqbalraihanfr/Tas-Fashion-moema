import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container">

        {/* Top Section: Brand */}
        <div className="mb-16 border-b border-gray-800 pb-16">
          <div className="mb-6">
            <Image
              src="/MOEMA-Logo.png"
              alt="MOEMA"
              width={140}
              height={40}
              className="w-36 h-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            Dedicated to the art of modern leather craftsmanship.
            Each piece is a testament to timeless elegance and functional luxury,
            designed for the contemporary woman.
          </p>
        </div>

        {/* Middle Section: Legal Links Only */}
        <div className="mb-16">
          <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-300">Legal</h4>
          <ul className="flex flex-wrap gap-6 text-sm text-gray-400">
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} MOEMA. All Rights Reserved.</p>
          <span className="mt-4 md:mt-0">Indonesia (IDR)</span>
        </div>

      </div>
    </footer>
  );
}
