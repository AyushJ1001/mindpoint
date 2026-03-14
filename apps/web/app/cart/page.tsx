import CartClient from "@/components/CartClient";

export const metadata = {
  title: "Shopping Cart - The Mind Point",
  description:
    "Review and checkout your selected mental health education courses from The Mind Point.",
  keywords:
    "shopping cart, checkout, mental health courses, payment, enrollment",
  openGraph: {
    title: "Shopping Cart - The Mind Point",
    description: "Review and checkout your selected courses.",
    type: "website",
  },
};

export default function CartPage() {
  return <CartClient />;
}
