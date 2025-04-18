import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Elegance</h3>
            <p className="text-sm mb-4">
              Discover premium makeup and cosmetics products for your beauty
              routine.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/lips"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Lips
                </Link>
              </li>
              <li>
                <Link
                  href="/category/face"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Face
                </Link>
              </li>
              <li>
                <Link
                  href="/category/eyes"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Eyes
                </Link>
              </li>
              <li>
                <Link
                  href="/new-arrivals"
                  className="text-sm hover:text-primary transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/best-sellers"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Subscribe</h3>
            <p className="text-sm mb-4">
              Subscribe to our newsletter for exclusive offers and beauty tips.
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/80"
              />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-accent-foreground/10 mt-12 pt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Elegance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
