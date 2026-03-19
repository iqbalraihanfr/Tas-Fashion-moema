import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-10 pb-6 border-t border-gray-800">
      <div className="container">

        {/* Top Section: Brand */}
        <div className="mb-8 border-b border-gray-800 pb-8">
          <div className="mb-3">
            <Image
              src="/MOEMA-Logo.png"
              alt="MOEMA"
              width={100}
              height={30}
              className="w-20 h-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
            Dedicated to the art of modern leather craftsmanship.
            Each piece is a testament to timeless elegance and functional luxury,
            designed for the contemporary woman.
          </p>
        </div>

        {/* Middle Section: Legal Links Only */}
        <div className="mb-8">
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
        </div>

      </div>
    </footer>
  );
}
