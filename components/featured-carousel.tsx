"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  {
    id: 1,
    name: "Skincare Essentials",
    description: "Nourish and protect your skin",
    image:
      "https://img.freepik.com/free-photo/flat-lay-natural-self-care-products-composition_23-2148990019.jpg?t=st=1740818035~exp=1740821635~hmac=2c69bb1be96da78695a3ed983e8d0b2c1256bce7fd6371e256bbc3c567c5dd9b&w=1800",
    products: [
      { name: "Hydrating Serum", price: 49 },
      { name: "Night Cream", price: 39 },
      { name: "Face Mask", price: 29 },
    ],
  },
  {
    id: 2,
    name: "Makeup Collection",
    description: "Express your unique beauty",
    image:
      "https://img.freepik.com/free-photo/composition-make-up-cosmetics-beauty-case_23-2148181449.jpg?t=st=1740818091~exp=1740821691~hmac=55f144bf28515163bcbc6931e34595647acd614ba4b00719193f2a642a99fa57&w=740",
    products: [
      { name: "Foundation", price: 45 },
      { name: "Lipstick", price: 25 },
      { name: "Mascara", price: 35 },
    ],
  },
  {
    id: 3,
    name: "Hair Care",
    description: "Achieve salon-perfect hair",
    image:
      "https://img.freepik.com/free-photo/floral-beauty-concept_23-2147817695.jpg?t=st=1740818176~exp=1740821776~hmac=9b2e36a6eaa7d705792dabddc18f5a1267bf269f1eee338acab6fa2d58e045ce&w=1060",
    products: [
      { name: "Shampoo", price: 28 },
      { name: "Conditioner", price: 28 },
      { name: "Hair Oil", price: 32 },
    ],
  },
]

export default function FeaturedSection() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://img.freepik.com/free-photo/horizontal-banner-with-cosmetic-product-coconut_23-2149446519.jpg?t=st=1740817947~exp=1740821547~hmac=96b5de9a669cf20be8f467e25534ad959413d445033eb1a830bcc7d58db857f8&w=1380"
            alt="Beauty products arrangement"
            fill
            className="object-cover"
            priority
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white space-y-6"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Discover Your <span className="text-primary">Perfect</span> Look
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Explore our premium collection of makeup and cosmetics designed to enhance your natural beauty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white/20">
                View Collections
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our curated collection of premium beauty products, organized to help you find exactly what
                you're looking for.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="group cursor-pointer">
                  <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                      <p className="text-white/90 mb-4">{category.description}</p>
                      <div className="flex items-center text-white group-hover:text-primary transition-colors">
                        <span className="font-medium">Browse Products</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {category.products.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-muted-foreground">{product.name}</span>
                        <span className="font-medium">${product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              View All Categories
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
