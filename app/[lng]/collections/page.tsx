import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "All Collections | Beauty & Makeup Store",
  description: "Browse all our makeup and beauty product collections",
}

// Sample collections data
const collections = [
  {
    id: 1,
    name: "Summer Glow Collection",
    description: "Radiant products to achieve that perfect summer glow, from bronzers to illuminating primers.",
    image:
      "https://img.freepik.com/free-photo/golden-products-arrangement-beauty_23-2149096977.jpg?w=1380&t=st=1712619700~exp=1712620300~hmac=b7e4a90d9c5cd9fa70a8af5bcd9d44f77b15ba6da8883f8b6c0b2c12d38fb6bb",
    itemCount: 12,
    isNew: true,
  },
  {
    id: 2,
    name: "Rose Gold Essentials",
    description: "A luxurious collection featuring rose gold packaging and warm, flattering shades for all skin tones.",
    image:
      "https://img.freepik.com/free-photo/closeup-view-brushes-with-powder_23-2148113377.jpg?w=1380&t=st=1712619736~exp=1712620336~hmac=96dca60fa22eb878d19b5f3e02cad3d15872a6c5b8ab42e57a73fb8c56fb2c04",
    itemCount: 8,
    isNew: false,
  },
  {
    id: 3,
    name: "Vegan Essentials",
    description:
      "Cruelty-free, vegan makeup products that deliver professional results while being kind to animals and the environment.",
    image:
      "https://img.freepik.com/free-photo/woman-showing-makeup-brushes_23-2148523561.jpg?w=1380&t=st=1712619770~exp=1712620370~hmac=831cfc71dc05887a1aafe80e35c66e57d7f2070f5ab90f6f5f77c7b398d82dbc",
    itemCount: 15,
    isNew: true,
  },
  {
    id: 4,
    name: "Everyday Neutrals",
    description:
      "Versatile, neutral shades perfect for creating everyday looks that transition seamlessly from day to night.",
    image:
      "https://img.freepik.com/free-photo/top-view-makeup-cosmetics-with-copy-space_23-2148567358.jpg?w=1380&t=st=1712619800~exp=1712620400~hmac=8bd0d10f5cf9a97a8e4e55d45fcbec63a7ca0d0c347bab9d8a3e3a4b8aa1fb90",
    itemCount: 10,
    isNew: false,
  },
  {
    id: 5,
    name: "Hydrating Skincare",
    description:
      "Intensely hydrating skincare products designed to nourish dry skin and restore natural moisture balance.",
    image:
      "https://img.freepik.com/free-photo/top-view-skincare-products-composition_23-2148551795.jpg?w=1380&t=st=1712619826~exp=1712620426~hmac=9bce08a339b4c7a53642bd2a9e9ea2c96b40f9caf155a00764cc4e1bbaaeb56e",
    itemCount: 7,
    isNew: false,
  },
  {
    id: 6,
    name: "Bold & Bright",
    description: "Vibrant, bold colors for eyes, lips, and cheeks that make a statement and showcase your creativity.",
    image:
      "https://img.freepik.com/free-photo/still-life-make-up-essentials_23-2149153151.jpg?w=1380&t=st=1712619852~exp=1712620452~hmac=3dd2a5b82a13e94f73ff47d3dc15a12f0bc12d1ff8cc84de4e26a76c17ee608d",
    itemCount: 9,
    isNew: true,
  },
  {
    id: 7,
    name: "Professional Brushes",
    description: "High-quality makeup brushes for flawless application, designed by professional makeup artists.",
    image:
      "https://img.freepik.com/free-photo/close-up-collection-makeup-brushes_23-2148604457.jpg?w=1380&t=st=1712619878~exp=1712620478~hmac=65a4b13fbb0c7c827499c81c1d89a14c5a49b522c2ab7d86fb89c851f6ad9d21",
    itemCount: 14,
    isNew: false,
  },
  {
    id: 8,
    name: "Night Glamour",
    description: "Shimmering, long-lasting formulas perfect for special occasions and nighttime events.",
    image:
      "https://img.freepik.com/free-photo/eyeshadow-palette-make-up-brushes-beauty-cosmetics_23-2148120906.jpg?w=1380&t=st=1712619904~exp=1712620504~hmac=dc4b3e4e8c1a1d46f7aa7cd78ef3df6d73c9d20a06b3a09bac3d2c67fa9ab7c4",
    itemCount: 11,
    isNew: false,
  },
  {
    id: 9,
    name: "Clean Beauty",
    description: "Non-toxic, clean beauty products free from harmful chemicals, parabens, and synthetic fragrances.",
    image:
      "https://img.freepik.com/free-photo/flat-lay-natural-self-care-products-arrangement_23-2148995301.jpg?w=1380&t=st=1712619928~exp=1712620528~hmac=c46bfe23c073f8f65b95de8a6721e97a0f0e98dcc1b53be5bcebfa4d4e8a9b11",
    itemCount: 16,
    isNew: true,
  },
]

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-12">
        {/* Header */}
        <div className="mb-16 px-4 md:px-8 lg:px-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Collections</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our curated collections of premium beauty and makeup products, designed for every look, occasion,
            and skin type.
          </p>
        </div>

        {/* Featured Collection Banner */}
        <div className="px-4 md:px-8 lg:px-16 mb-16">
          <div className="relative h-[50vh] rounded-2xl overflow-hidden">
            <Image
              src="https://img.freepik.com/free-photo/cosmetics-products-arrangement-female-day_23-2149013998.jpg?w=1800&t=st=1712619952~exp=1712620552~hmac=cf1071e5ccb5c9a0ef7a4b6b80c025f1ec3c9e8c30e02ae79dc2a6d8da5a6bca"
              alt="Limited Edition Holiday Collection"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
              <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Limited Edition
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Holiday Glam Collection</h2>
              <p className="text-white/90 mb-6">
                Discover our exclusive holiday collection featuring festive shades, shimmering highlights, and luxurious
                packaging perfect for gifting or treating yourself.
              </p>
              <div className="flex items-center text-white/80 text-sm mb-6">
                <span>18 products</span>
                <span className="mx-3">•</span>
                <span>Limited time only</span>
              </div>
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Shop Collection
              </button>
            </div>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link
                href={`/collections/${collection.id}`}
                key={collection.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-64">
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {collection.isNew && (
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                      New
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{collection.name}</h3>
                    <span className="text-sm text-gray-500">{collection.itemCount} items</span>
                  </div>
                  <p className="text-gray-600 mb-4">{collection.description}</p>
                  <div className="flex items-center text-primary font-medium">
                    <span>Explore collection</span>
                    <svg
                      className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-24 px-4 md:px-8 lg:px-16">
          <div className="bg-accent rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Never miss a new collection</h3>
              <p className="text-gray-700 mb-6">
                Subscribe to our newsletter to be the first to know about new launches, exclusive offers, and limited
                edition collections.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto sm:flex-1 max-w-sm"
                />
                <button className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
