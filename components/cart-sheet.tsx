"use client";

import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from "@/components/cart-provider";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/data";

export default function CartSheet() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Helper function to ensure we have a valid number
  const calculateItemTotal = (
    price: number,
    discount: number,
    quantity: number,
  ) => {
    const discountedPrice = price * (1 - discount);
    return (discountedPrice * quantity).toFixed(2);
  };

  // Helper function to get a valid image URL
  const getImageUrl = (item: any) => {
    // Check for image_urls array first
    if (
      item.image_urls &&
      Array.isArray(item.image_urls) &&
      item.image_urls.length > 0
    ) {
      return item.image_urls[0];
    }
    // Then check for direct image property
    if (item.image) {
      return item.image;
    }
    return "/placeholder.svg";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center text-lg">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Your Cart ({cart.length})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 h-[80vh]">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-muted-foreground text-center mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <SheetClose asChild>
              <Button>Continue Shopping</Button>
            </SheetClose>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 overflow-auto py-6">
              <ul className="space-y-4">
                {cart.map((item) => {
                  const imageUrl = getImageUrl(item);

                  return (
                    <li
                      key={`${item.id}-${item.selectedColor || ""}-${item.selectedShade || ""}`}
                      className="flex border rounded-lg overflow-hidden"
                    >
                      <div className="relative h-24 w-24 flex-shrink-0">
                        <Image
                          src={imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                        {item.selectedColor && (
                          <p className="text-sm text-muted-foreground">
                            Color: {item.selectedColor}
                          </p>
                        )}
                        {item.selectedShade && (
                          <p className="text-sm text-muted-foreground">
                            Shade: {item.selectedShade}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <span>-</span>
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <span>+</span>
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(
                                item.price *
                                  (1 - (item.discount || 0)) *
                                  item.quantity,
                              )}
                            </div>
                            {item.discount > 0 && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="pt-2">
                <SheetClose asChild>
                  <Button className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </SheetClose>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
