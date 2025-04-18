"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  User,
  LogOut,
  ShoppingBag,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CartSheet from "@/components/cart-sheet";
import { useWishlist } from "@/components/wishlist-provider";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/app/i18n/client";

export default function Navbar({ lng }: { lng: string }) {
  const { t } = useTranslation(lng);

  const pathname = usePathname();
  const { wishlist } = useWishlist();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="mx-4 hidden md:flex">
          <Link href="/" className="mx-6 flex items-center space-x-2">
            <Image
              src="/assets/joulaa-logo.svg"
              alt="GLAMOUR"
              width={220}
              height={30}
              className="h-28 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              {t("navbar.home")}
            </Link>
            <Link
              href="/shop"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/shop") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              {t("navbar.shop")}
            </Link>
            <Link
              href="/new-arrivals"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/new-arrivals")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {t("navbar.newArrivals")}
            </Link>
            <Link
              href="/trending"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/trending") ? "text-foreground" : "text-foreground/60"
              }`}
            >
              {t("navbar.trending")}
            </Link>
            <Link
              href="/collections"
              className={`transition-colors hover:text-foreground/80 ${
                isActive("/collections")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {t("navbar.collections")}
            </Link>
          </nav>
        </div>

        <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
          <Image
            src="/joulaa-logo.svg"
            alt="GLAMOUR"
            width={200}
            height={60}
            className="h-24 w-auto"
          />
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">{t("navbar.search")}</span>
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
                <span className="sr-only">{t("navbar.wishlist")}</span>
              </Button>
            </Link>
            <CartSheet />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                  >
                    <UserCircle className="h-6 w-6" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{t("navbar.userMenu.myAccount")}</span>
                      <span className="text-xs font-normal text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/account">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("navbar.userMenu.profile")}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/account?tab=orders">
                    <DropdownMenuItem className="cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>{t("navbar.userMenu.orders")}</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("navbar.userMenu.signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/sign-in">
                  <Button variant="ghost" size="sm">
                    {t("navbar.auth.signIn")}
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">{t("navbar.auth.signUp")}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
