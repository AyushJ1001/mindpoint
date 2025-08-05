"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCart } from "react-use-cart";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ShoppingCart, Plus } from "lucide-react";
import Link from "next/link";
import { showRupees } from "@/lib/utils";

const CourseCard = ({ course }: { course: any }) => {
  const { addItem, inCart } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: course._id,
      name: course.name,
      description: course.description,
      price: course.price || 100, // Default price if not set
      image: course.image || "",
      capacity: course.capacity || 1, // Include capacity information
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-lg">
            {showRupees(course.price || 100)}
          </Badge>
          <Button
            onClick={handleAddToCart}
            disabled={inCart(course._id)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {inCart(course._id) ? "Added" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Home() {
  const courses = useQuery(api.courses.listCourses, { count: undefined });
  const { totalItems } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">The Mind Point</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}


