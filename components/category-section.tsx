import Link from "next/link"
import Image from "next/image"
import { useCategory } from "@/contexts/category-context"

export default function CategorySection() {
  const { categories } = useCategory()
  const activeCategories = categories.filter((category) => category.isActive).slice(0, 3)

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeCategories.map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            className="group relative overflow-hidden rounded-lg h-64 transition-all duration-300 hover:shadow-xl"
          >
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-2xl font-bold mb-1 text-center px-4">{category.name}</h3>
              <p className="text-sm opacity-90">{category.productCount || 0} Products</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
