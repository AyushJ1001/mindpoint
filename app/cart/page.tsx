"use client";

import { useCart } from "react-use-cart";
import { Suspense } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShoppingCart, CreditCard, Plus, Minus } from "lucide-react";
import { showRupees } from "@/lib/utils";

const CartContent = () => {
  const { items, removeItem, updateItemQuantity, cartTotal, isEmpty } = useCart();
  const courses = useQuery(api.courses.listCourses, { count: undefined });
  const [isProcessing, setIsProcessing] = useState(false);
  const { Razorpay, error, isLoading } = useRazorpay();

  const handlePayment = async () => {
    if (isEmpty) return;
    
    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }) // API will convert to paise
      });
      
      const data = await response.json();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "The Mind Point",
        description: `Payment for ${items.length} course(s)`,
        order_id: data.id,
        handler: function (response: any) {
          console.log("Payment successful", response);
          // Clear cart after successful payment
          // You might want to add a clearCart function from react-use-cart
        },
        prefill: {
          name: "John Doe",
          email: "john.doe@example.com",
          contact: "+919876543210",
        },
        notes: "Course purchase from The Mind Point",
        theme: {
          color: "#F37254",
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error("Error processing payment", error);
    } finally {
      setIsProcessing(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading payment gateway...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">Error loading payment gateway: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingCart className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some courses to get started!</p>
            <Button onClick={() => window.history.back()}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Quantity:</label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newQuantity = (item.quantity || 1) - 1;
                              if (newQuantity <= 0) {
                                removeItem(item.id);
                              } else {
                                updateItemQuantity(item.id, newQuantity);
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
                              const currentQuantity = item.quantity || 1;
                              const maxQuantity = item.capacity || 1;
                              if (currentQuantity < maxQuantity) {
                                updateItemQuantity(item.id, currentQuantity + 1);
                              }
                            }}
                            disabled={(item.quantity || 1) >= (item.capacity || 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge variant="secondary">
                          {showRupees(item.price)}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{showRupees(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{showRupees(0)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{showRupees(cartTotal)}</span>
                </div>
                
                <Button 
                  onClick={handlePayment} 
                  disabled={isProcessing || isEmpty}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : `Pay ${showRupees(cartTotal)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const CartPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <CartContent />
    </Suspense>
  );
};

export default CartPage; 