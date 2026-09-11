import "./cart-brand.css";
import CartClient from "@/components/CartClient";

export const metadata = {
  title: "Your Cart - The Mind Point",
  description:
    "Review your selected The Mind Point programs, offers, and enrollment details before checkout.",
  keywords:
    "shopping cart, checkout, mental health courses, payment, enrollment",
  openGraph: {
    title: "Your Cart - The Mind Point",
    description: "Review your selected programs before checkout.",
    type: "website",
  },
};

export default function CartPage() {
  return (
    <div className="tmp-cart-page">
      <CartClient />
    </div>
  );
}
