import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/contexts/product-context";

interface NewArrivalsProps {
  products: Product[];
}

const NewArrivalsList = ({ products }: NewArrivalsProps) => {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {products.map((product) => (
        <div key={product.id} className="w-64 flex-shrink-0">
          <Link href={`/product/${product.id}`} className="block">
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 mb-2">
              <Image
                src={product.image_urls?.[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 200px"
                loading="lazy"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
              {product.brand}
            </p>
            <div className="mt-1 flex items-center">
              <p className="font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default async function NewArrivals({ title }: { title: string }) {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("isNewArrival", true)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching new arrivals:", error);
    return <div>Error loading new arrivals</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <NewArrivalsList products={products || []} />
    </div>
  );
}
