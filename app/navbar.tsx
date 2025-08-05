"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { ModeToggle } from "@/components/theme-toggle";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useCart } from "react-use-cart";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { showRupees } from "@/lib/utils";

export default function Navbar() {
  const {
    totalItems,
    items,
    removeItem,
    updateItemQuantity,
    cartTotal,
    isEmpty,
  } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <nav className="bg-background sticky top-0 z-50 border-b border-black">
      <div className="flex items-center justify-between p-4">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" className="flex items-center">
                <span className="sr-only">The Mind Point</span>
                <Image
                  src="/logo.png"
                  alt="The Mind Point"
                  width={48}
                  height={48}
                />
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/about">
                        <div className="font-medium">About Us</div>
                        <div className="text-muted-foreground">
                          Why Choose The Mind Point?
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/toc">
                        <div className="font-medium">Terms and Conditions</div>
                        <div className="text-muted-foreground">
                          By registering or making a purchase, you acknowledge
                          and agree to the terms of The Mind Point's Refund and
                          Payment Policy.
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="/contact">
                        <div className="font-medium">Contact Us</div>
                        <div className="text-muted-foreground">
                          Contact Us Via Phone, Email or Social Media
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>TMP Academy</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="#">Certificate Courses</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">Training-based Internships</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">Diploma</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">Pre-recorded Courses</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">MasterClass/Workshops</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Therapy and Career Support
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="#">Therapy/Counselling Sessions</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">TMP Supervised Sessions</Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link href="#">TMP Resume Studio</Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {isHydrated && totalItems > 0 && (
                  <Badge
                    variant="outline"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 p-2 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-2">
              <SheetHeader>
                <SheetTitle>Shopping Cart</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                {isEmpty ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-12">
                    <ShoppingCart className="mb-4 h-16 w-16 text-gray-400" />
                    <h2 className="mb-2 text-xl font-semibold">
                      Your cart is empty
                    </h2>
                    <p className="mb-4 text-gray-600">
                      Add some courses to get started!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-4 overflow-y-auto py-4">
                      {items.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="mb-1 font-semibold">
                                  {item.name}
                                </h3>
                                <p className="mb-2 text-sm text-gray-600">
                                  {item.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newQuantity =
                                        (item.quantity || 1) - 1;
                                      if (newQuantity <= 0) {
                                        removeItem(item.id);
                                      } else {
                                        updateItemQuantity(
                                          item.id,
                                          newQuantity,
                                        );
                                      }
                                    }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity || 1}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const currentQuantity =
                                        item.quantity || 1;
                                      const maxQuantity = item.capacity || 1;
                                      if (currentQuantity < maxQuantity) {
                                        updateItemQuantity(
                                          item.id,
                                          currentQuantity + 1,
                                        );
                                      }
                                    }}
                                    disabled={
                                      (item.quantity || 1) >=
                                      (item.capacity || 1)
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="secondary">
                                  {showRupees(item.price)}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="bg-background sticky bottom-0 space-y-4 border-t p-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total ({totalItems} items)</span>
                        <span>{showRupees(cartTotal)}</span>
                      </div>
                      <Button className="w-full" asChild>
                        <Link href="/cart">Proceed to Checkout</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <ModeToggle />
          <Authenticated>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton></SignInButton>
          </Unauthenticated>
        </div>
      </div>
    </nav>
  );
}
