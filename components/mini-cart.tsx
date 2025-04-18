"use client";

import { X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";

interface MiniCartProps {
  onClose: () => void;
}

export default function MiniCart({ onClose }: MiniCartProps) {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  // Helper function to ensure we have a valid number
  const calculateItemTotal = (
    price: number,
    discount: number,
    quantity: number,
  ) => {
    const discountedPrice = price * (1 - discount);
    return (discountedPrice * quantity).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Your Cart ({cart.length})
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-muted-foreground text-center mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto p-4">
                <ul className="space-y-4">
                  {cart.map((item) => {
                    return (
                      <li
                        key={`${item.id}-${item.selectedColor || ""}-${item.selectedShade || ""}`}
                        className="flex border rounded-lg overflow-hidden"
                      >
                        <div className="relative h-24 w-24 flex-shrink-0">
                          <Image
                            src={
                              item.image_urls && item.image_urls.length > 0
                                ? item.image_urls[0]
                                : "/placeholder.svg"
                            }
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
                                $
                                {calculateItemTotal(
                                  item.price,
                                  item.discount || 0,
                                  item.quantity,
                                )}
                              </div>
                              {item.discount > 0 && (
                                <div className="text-sm text-muted-foreground line-through">
                                  ${(item.price * item.quantity).toFixed(2)}
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

              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <Link href="/checkout" onClick={onClose}>
                    <Button className="w-full">Proceed to Checkout</Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
