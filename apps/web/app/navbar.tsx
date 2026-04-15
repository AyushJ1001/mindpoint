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
import { AuthNavbarActions } from "@/components/AuthNavbarActions";
import { useCart } from "react-use-cart";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { showRupees, getOfferDetails, type OfferDetails } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useNow } from "@/hooks/use-now";
import { useMemo } from "react";
import { ModeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const {
    totalItems,
    items,
    removeItem,
    updateItemQuantity,
    cartTotal,
    isEmpty,
    emptyCart,
  } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  const pathname = usePathname();
  const now = useNow();

  // Update offer details for cart items using shared time
  // Use now to create a minute-based key that changes every minute, forcing recalculation
  const minuteKey = Math.floor(now / 60000);
  const itemOfferDetails = useMemo(() => {
    const newOfferDetails: Record<string, OfferDetails> = {};
    // minuteKey ensures recalculation every minute when time updates
    // Reference minuteKey to satisfy eslint dependency check
    if (minuteKey < 0) {
      // This will never execute, but ensures minuteKey is used
      return {};
    }
    items.forEach((item) => {
      if (item.offer || item.bogo) {
        const offerPrice = Math.round(item.price || 0);
        const discountPercentage = item.offer?.discount ?? 0;

        // Use stored originalPrice if available, otherwise calculate it
        let originalPrice = item.originalPrice || offerPrice;
        if (
          !item.originalPrice &&
          discountPercentage > 0 &&
          discountPercentage < 100
        ) {
          const denominator = 1 - discountPercentage / 100;
          if (Math.abs(denominator) > 1e-6) {
            originalPrice = offerPrice / denominator;
          }
        }

        originalPrice = Math.round(originalPrice);

        const offerDetails = getOfferDetails({
          price: originalPrice,
          offer: item.offer ?? null,
          bogo: item.bogo ?? null,
        });
        if (offerDetails) {
          newOfferDetails[item.id] = offerDetails;
        }
      }
    });
    return newOfferDetails;
  }, [items, minuteKey]);

  const hasBogoItems = items.some((item) => itemOfferDetails[item.id]?.hasBogo);

  const handleClearCart = () => {
    emptyCart();
    setShowClearCartDialog(false);
    toast.success("Cart cleared successfully");
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Ensure cart sheet closes when route changes so destination pages stay visible.
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      data-app-navbar
      className="bg-background/95 border-border sticky top-0 z-50 border-b shadow-sm backdrop-blur-sm"
      role="navigation"
      aria-label="Primary"
    >
      <div className="container">
        <div className="flex items-center justify-between py-2.5 sm:py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Home"
          >
            <Image
              src="/logo.png"
              alt="The Mind Point"
              width={36}
              height={36}
              className="transition-smooth ring-border h-8 w-8 rounded-xl ring-1 hover:scale-105 sm:h-9 sm:w-9"
              priority
            />
            <span className="text-foreground font-display text-base font-bold tracking-tight sm:text-xl">
              The Mind Point
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu viewport={false} aria-label="Site sections">
              <NavigationMenuList className="space-x-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="transition-smooth hover:border-border hover:bg-accent data-[state=open]:border-border data-[state=open]:bg-accent rounded-full border border-transparent bg-transparent px-4">
                    Home
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-4">
                      <div className="grid gap-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/about"
                            className={`hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none ${
                              isActive("/about") ? "bg-accent" : ""
                            }`}
                            aria-current={
                              isActive("/about") ? "page" : undefined
                            }
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
                            className={`hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none ${
                              isActive("/toc") ? "bg-accent" : ""
                            }`}
                            aria-current={isActive("/toc") ? "page" : undefined}
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
                            className={`hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none ${
                              isActive("/contact") ? "bg-accent" : ""
                            }`}
                            aria-current={
                              isActive("/contact") ? "page" : undefined
                            }
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
                  <NavigationMenuTrigger className="transition-smooth hover:border-border hover:bg-accent data-[state=open]:border-border data-[state=open]:bg-accent rounded-full border border-transparent bg-transparent px-4">
                    TMP Academy
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[300px] p-4">
                      <div className="grid gap-2">
                        {[
                          {
                            name: "Certificate Courses",
                            link: "/courses/certificate",
                          },
                          {
                            name: "Training based Internship",
                            link: "/courses/internship",
                          },
                          {
                            name: "Prerecorded Courses",
                            link: "/courses/pre-recorded",
                          },
                          {
                            name: "Diploma Programs",
                            link: "/courses/diploma",
                          },
                          {
                            name: "Masterclass/Workshop",
                            link: "/courses/masterclass",
                          },
                          {
                            name: "Worksheets",
                            link: "/courses/worksheet",
                          },
                        ].map(({ name, link }) => (
                          <NavigationMenuLink asChild key={link}>
                            <Link
                              href={link}
                              className={`hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none ${
                                isActive(link) ? "bg-accent" : ""
                              }`}
                              aria-current={isActive(link) ? "page" : undefined}
                            >
                              <div className="text-sm font-medium">{name}</div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="transition-smooth hover:border-border hover:bg-accent data-[state=open]:border-border data-[state=open]:bg-accent rounded-full border border-transparent bg-transparent px-4">
                    Therapy & Career
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[280px] p-4">
                      <div className="grid gap-2">
                        {[
                          {
                            name: "Therapy/Counselling",
                            link: "/courses/therapy",
                          },
                          {
                            name: "Supervised Sessions",
                            link: "/courses/supervised",
                          },
                          {
                            name: "Resume Studio",
                            link: "/courses/resume-studio",
                          },
                        ].map(({ name, link }) => (
                          <NavigationMenuLink asChild key={link}>
                            <Link
                              href={link}
                              className={`hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block rounded-md p-3 leading-none no-underline transition-colors outline-none select-none ${
                                isActive(link) ? "bg-accent" : ""
                              }`}
                              aria-current={isActive(link) ? "page" : undefined}
                            >
                              <div className="text-sm font-medium">{name}</div>
                            </Link>
                          </NavigationMenuLink>
                        ))}
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
              className="hover:border-border hover:bg-accent rounded-xl border border-transparent p-2"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <ModeToggle />
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="transition-smooth hover:border-border hover:bg-accent relative rounded-xl border border-transparent"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Cart</span>
                  {isHydrated && totalItems > 0 && (
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                      aria-label={`${totalItems} items in cart`}
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="border-border bg-background/98 w-[min(24rem,calc(100vw-1rem))] rounded-l-2xl border-l p-3 sm:p-4"
                aria-label="Shopping cart panel"
              >
                <SheetHeader className="pb-4">
                  <SheetTitle>Shopping Cart</SheetTitle>
                  <p className="text-muted-foreground text-xs">
                    Continue browsing while this panel stays open.
                  </p>
                  {!isEmpty && (
                    <div className="flex justify-end">
                      <Dialog
                        open={showClearCartDialog}
                        onOpenChange={setShowClearCartDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Clear
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Clear Cart</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to remove all items from
                              your cart? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowClearCartDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleClearCart}
                            >
                              Clear Cart
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </SheetHeader>
                <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden">
                  {isEmpty ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-12">
                      <ShoppingCart
                        className="text-muted-foreground mb-4 h-16 w-16"
                        aria-hidden="true"
                      />
                      <h2 className="mb-2 text-xl font-semibold">
                        Your cart is empty
                      </h2>
                      <p className="text-muted-foreground mb-4 text-center">
                        Add some courses to get started!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-3 pb-28">
                        {items.map((item) => {
                          const offerDetails = itemOfferDetails[item.id];
                          const itemTotal = Math.round(
                            (item.price || 0) * (item.quantity || 1),
                          );

                          return (
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
                                    {offerDetails && (
                                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                                        {offerDetails.hasDiscount && (
                                          <span className="bg-terracotta-light text-destructive rounded px-2 py-1 text-[11px] font-semibold">
                                            {offerDetails.discountPercentage}%
                                            OFF
                                          </span>
                                        )}
                                        <span
                                          className={`font-medium ${offerDetails.hasBogo ? "text-primary" : "text-muted-foreground"}`}
                                        >
                                          {offerDetails.timeLeft.days > 0 &&
                                            `${offerDetails.timeLeft.days}d `}
                                          {offerDetails.timeLeft.hours > 0 &&
                                            `${offerDetails.timeLeft.hours}h `}
                                          {offerDetails.timeLeft.minutes > 0 &&
                                            `${offerDetails.timeLeft.minutes}m`}{" "}
                                          left
                                        </span>
                                      </div>
                                    )}
                                    {offerDetails?.hasBogo && (
                                      <div className="text-primary mb-2 flex items-center gap-1 text-xs font-semibold">
                                        <Sparkles className="h-3 w-3" />
                                        {"Bonus enrollment included"}
                                      </div>
                                    )}
                                    <div
                                      className="flex items-center gap-2"
                                      aria-label={`Quantity controls for ${item.name}`}
                                    >
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
                                        aria-label={`Decrease quantity of ${item.name}`}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span
                                        className="w-8 text-center text-sm font-medium"
                                        aria-live="polite"
                                      >
                                        {item.quantity || 1}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const currentQuantity =
                                            item.quantity || 1;
                                          const maxQuantity =
                                            item.capacity || 1;
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
                                        aria-label={`Increase quantity of ${item.name}`}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {showRupees(itemTotal)}
                                      </Badge>
                                      {offerDetails?.hasDiscount && (
                                        <div className="text-muted-foreground text-xs">
                                          <span className="line-through">
                                            {showRupees(
                                              (offerDetails.originalPrice ||
                                                0) * (item.quantity || 1),
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(item.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-smooth h-8 w-8 p-0"
                                      aria-label={`Remove ${item.name} from cart`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                      <div className="bg-background/95 sticky right-0 bottom-0 left-0 space-y-4 border-t pt-4 backdrop-blur">
                        {hasBogoItems && (
                          <div className="border-primary/30 bg-lavender-50 text-primary flex items-start gap-2 rounded-md border px-3 py-2 text-[11px] font-medium">
                            <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              BOGO applied: bonus enrollments are added during
                              checkout.
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between font-semibold">
                          <span>Total ({totalItems} items)</span>
                          <span className="text-primary">
                            {showRupees(Math.round(cartTotal))}
                          </span>
                        </div>
                        <Button className="transition-smooth w-full" asChild>
                          <Link
                            href="/cart"
                            onClick={() => setIsCartOpen(false)}
                          >
                            Proceed to Checkout
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <AuthNavbarActions />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="border-border bg-background/92 border-t shadow-inner backdrop-blur-md lg:hidden"
            id="mobile-menu"
          >
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <h3 className="text-muted-foreground px-4 text-sm font-semibold tracking-wider uppercase">
                  Home
                </h3>
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/toc", label: "Terms and Conditions" },
                  { href: "/contact", label: "Contact Us" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm ${
                      isActive(link.href) ? "bg-accent" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground px-4 text-sm font-semibold tracking-wider uppercase">
                  TMP Academy
                </h3>
                {[
                  "/courses/certificate",
                  "/courses/internship",
                  "/courses/diploma",
                  "/courses/pre-recorded",
                  "/courses/masterclass",
                  "/courses/worksheet",
                ].map((href) => (
                  <Link
                    key={href}
                    href={href}
                    className={`hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm ${
                      isActive(href) ? "bg-accent" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive(href) ? "page" : undefined}
                  >
                    {href
                      .split("/")
                      .pop()
                      ?.replace("-", " ")
                      ?.replace(/^\w/, (c) => c.toUpperCase())}
                  </Link>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground px-4 text-sm font-semibold tracking-wider uppercase">
                  Therapy & Career
                </h3>
                {[
                  "/courses/therapy",
                  "/courses/supervised",
                  "/courses/resume-studio",
                ].map((href) => (
                  <Link
                    key={href}
                    href={href}
                    className={`hover:bg-accent transition-smooth mx-2 block rounded-md px-4 py-2 text-sm ${
                      isActive(href) ? "bg-accent" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive(href) ? "page" : undefined}
                  >
                    {href
                      .split("/")
                      .pop()
                      ?.replace("-", " ")
                      ?.replace(/^\w/, (c) => c.toUpperCase())}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
