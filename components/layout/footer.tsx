import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container">
        
        {/* Top Section: Brand Promise & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16 border-b border-gray-800 pb-16">
            <div className="max-w-md">
                <div className="mb-6">
                    <Image 
                        src="/MOEMA-Logo.png" 
                        alt="MOEMA" 
                        width={140} 
                        height={40} 
                        className="w-36 h-auto object-contain brightness-0 invert"
                    />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Dedicated to the art of modern leather craftsmanship. 
                    Each piece is a testament to timeless elegance and functional luxury, 
                    designed for the contemporary woman.
                </p>
                <div className="flex gap-4">
                    <Link href="#" className="hover:text-[#89801D] transition-colors"><Instagram className="w-5 h-5" /></Link>
                    <Link href="#" className="hover:text-[#89801D] transition-colors"><Facebook className="w-5 h-5" /></Link>
                    <Link href="#" className="hover:text-[#89801D] transition-colors"><Youtube className="w-5 h-5" /></Link>
                    <Link href="#" className="hover:text-[#89801D] transition-colors"><Twitter className="w-5 h-5" /></Link>
                </div>
            </div>

            <div className="max-w-md w-full">
                <h3 className="text-lg font-medium uppercase tracking-widest mb-4">Newsletter</h3>
                <p className="text-gray-400 text-sm mb-4">
                    Subscribe to receive updates, access to exclusive deals, and more.
                </p>
                <form className="flex gap-2 border-b border-gray-600 pb-2">
                    <input 
                        type="email" 
                        placeholder="ENTER YOUR EMAIL ADDRESS" 
                        className="bg-transparent w-full outline-none text-sm placeholder:text-gray-500 uppercase tracking-wide text-white"
                    />
                    <button type="submit" className="text-xs font-bold uppercase tracking-widest hover:text-[#89801D] transition-colors">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          
          {/* Column 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-300">Customer Care</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Track My Order</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Payment Methods</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-300">The Brand</h4>
             <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Store Locator</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-300">Services</h4>
             <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Bag Care Guide</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Repair Services</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Personalization</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-300">Legal area</h4>
             <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
           <p>&copy; {new Date().getFullYear()} MOEMA. All Rights Reserved.</p>
           <div className="flex gap-4 mt-4 md:mt-0">
              <span>Indonesia (IDR)</span>
              <span>English</span>
           </div>
        </div>

      </div>
    </footer>
  );
}