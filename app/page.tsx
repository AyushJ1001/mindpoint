"use client";

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const amount = 100;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // you missed this!
        body: JSON.stringify({ amount })
      });
      
      const data = await response.json();
      
      // Razorpay returns { id: "order_xxxx", amount: 10000, currency: "INR", ... }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount, // use Razorpay's amount in paise
        currency: data.currency,
        name: "The Mind Point",
        description: "Payment for the course",
        order_id: data.id, // FIXED: correct property name
        handler: function (response: any) {
          console.log("Payment successful", response);
        },
        prefill: {
          name: "John Doe",
          email: "john.doe@example.com",
          contact: "+919876543210",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#F37254",
        }
      };
      
      const rpz1 = new window.Razorpay(options);
      rpz1.open();
      
    } catch (error) {
      console.error("Error processing payment", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      <h1>The Mind Point</h1>
      <p>Pay for the course</p>
      <button onClick={handlePayment} disabled={isProcessing} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Pay ₹{amount}
      </button>
    </div>
  )
}

export default function Home() {

  const courses = useQuery(api.courses.listCourses, {count: undefined});

  console.log(courses);

  return (
    <>
      <h1>The Mind Point</h1>
      <PaymentPage />
      {courses?.courses.map((course) => (
        <div key={course._id}>
          <h2>{course.name}</h2>
          <p>{course.description}</p>
        </div>
      ))}
    </>
  );
}