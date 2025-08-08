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
import { ShoppingCart, Trash2, Plus, Minus, Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <nav className="bg-background/95 border-border sticky top-0 z-50 border-b bg-gradient-to-br from-10% via-blue-100 to-blue-300 shadow-sm backdrop-blur-sm">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="The Mind Point"
              width={40}
              height={40}
              className="transition-smooth hover:scale-105"
            />
            <span className="hidden text-xl font-bold text-blue-950 text-shadow-black sm:block">
              The Mind Point
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu viewport={false}>
              <NavigationMenuList className="space-x-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="hover:bg-accent/50 data-[state=open]:bg-accent/50 transition-smooth bg-transparent">
                    Home
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/about"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm leading-none font-medium">
                              About Us
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Why Choose The Mind Point?
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/toc"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm leading-none font-medium">
                              Terms and Conditions
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Our refund and payment policies
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/contact"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm leading-none font-medium">
                              Contact Us
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                              Get in touch via phone, email or social media
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="hover:bg-accent/50 data-[state=open]:bg-accent/50 transition-smooth bg-transparent">
                    TMP Academy
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[300px] p-4">
                      <div className="grid gap-2">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/certificate"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">
                              Certificate Courses
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/internship"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">
                              Training-based Internships
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/diploma"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">Diploma</div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/pre-recorded"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">
                              Pre-recorded Courses
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/masterclass"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">
                              MasterClass/Workshops
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="hover:bg-accent/50 data-[state=open]:bg-accent/50 transition-smooth bg-transparent">
                    Therapy & Career
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[280px] p-4">
                      <div className="grid gap-2">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/therapy"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">
                              Therapy/Counselling Sessions
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/supervised"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">
                              TMP Supervised Sessions
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/courses/resume-studio"
                            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                          >
                            <div className="text-sm font-medium">
                              TMP Resume Studio
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="transition-smooth hover:bg-accent/50 relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Cart</span>
                  {isHydrated && totalItems > 0 && (
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-4 sm:w-[400px]">
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-left">Shopping Cart</SheetTitle>
                </SheetHeader>
                <div className="flex h-full flex-col">
                  {isEmpty ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-12">
                      <ShoppingCart className="text-muted-foreground mb-4 h-16 w-16" />
                      <h2 className="mb-2 text-xl font-semibold">
                        Your cart is empty
                      </h2>
                      <p className="text-muted-foreground mb-4 text-center">
                        Add some courses to get started!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 space-y-4 overflow-y-auto py-4">
                        {items.map((item) => (
                          <Card key={item.id} className="card-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 pr-4">
                                  <h3 className="mb-1 text-sm font-semibold">
                                    {item.name}
                                  </h3>
                                  <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
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
                                      className="transition-smooth h-8 w-8 p-0"
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
                                      className="transition-smooth h-8 w-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {showRupees(item.price)}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-smooth h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Total ({totalItems} items)</span>
                          <span className="text-primary">
                            {showRupees(cartTotal)}
                          </span>
                        </div>
                        <Button className="transition-smooth w-full" asChild>
                          <Link href="/cart">Proceed to Checkout</Link>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <ModeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <Authenticated>
                <UserButton />
              </Authenticated>
              <Unauthenticated>
                <SignInButton />
              </Unauthenticated>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-border bg-background/95 border-t backdrop-blur-sm lg:hidden">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="text-muted-foreground px-4 text-sm font-semibold tracking-wider uppercase">
                  Home
                </h3>
                <Link
                  href="/about"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/toc"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Terms and Conditions
                </Link>
                <Link
                  href="/contact"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground px-4 text-sm font-semibold tracking-wider uppercase">
                  TMP Academy
                </h3>
                <Link
                  href="/courses/certificate"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Certificate Courses
                </Link>
                <Link
                  href="/courses/internship"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Training-based Internships
                </Link>
                <Link
                  href="/courses/diploma"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Diploma
                </Link>
                <Link
                  href="/courses/pre-recorded"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pre-recorded Courses
                </Link>
                <Link
                  href="/courses/masterclass"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  MasterClass/Workshops
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground px-4 text-sm font-semibold tracking-wider uppercase">
                  Therapy & Career
                </h3>
                <Link
                  href="/courses/therapy"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Therapy/Counselling Sessions
                </Link>
                <Link
                  href="/courses/supervised"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  TMP Supervised Sessions
                </Link>
                <Link
                  href="/courses/resume-studio"
                  className="hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  TMP Resume Studio
                </Link>
              </div>

              <div className="border-border flex items-center justify-center gap-4 border-t pt-4 sm:hidden">
                <Authenticated>
                  <UserButton />
                </Authenticated>
                <Unauthenticated>
                  <SignInButton />
                </Unauthenticated>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
