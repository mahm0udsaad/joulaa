import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog | Beauty & Makeup Store",
  description: "Discover our latest beauty tips, tutorials, and industry insights",
}

// Sample blog post data
const blogPosts = [
  {
    id: 1,
    title: "10 Summer Makeup Trends You Need to Try",
    excerpt:
      "Discover the hottest makeup trends that will dominate this summer season, from glowing skin to bold colors.",
    date: "June 15, 2023",
    category: "Makeup",
    image:
      "https://img.freepik.com/free-photo/woman-applying-makeup-face_23-2149163281.jpg?w=1380&t=st=1712619427~exp=1712620027~hmac=1b85a89c2efd70b66d00c731a5b0bbff6d46fe0a79f0ca1afb8a25b28cac6a42",
    readTime: "5 min",
  },
  {
    id: 2,
    title: "The Ultimate Skincare Routine for Sensitive Skin",
    excerpt:
      "Learn how to build a gentle yet effective skincare routine that caters to sensitive skin types, avoiding irritation and redness.",
    date: "May 28, 2023",
    category: "Skincare",
    image:
      "https://img.freepik.com/free-photo/top-view-arrangement-with-face-cream-towel_23-2148301808.jpg?w=1380&t=st=1712619450~exp=1712620050~hmac=2d17afce8172fe517876f42f9a0f9f77cdbb6cafc7a6ed6c7a5a85f9fc4c1a77",
    readTime: "7 min",
  },
  {
    id: 3,
    title: "How to Choose the Perfect Foundation for Your Skin Tone",
    excerpt:
      "Finding the right foundation shade can be challenging. Here's our comprehensive guide to matching your perfect shade.",
    date: "May 10, 2023",
    category: "Makeup",
    image:
      "https://img.freepik.com/free-photo/cosmetic-product-packaging-with-skin-cream-bottle_23-2149629131.jpg?w=1380&t=st=1712619472~exp=1712620072~hmac=5a8d7a2517aa65dec058b31e04764d8e5fe0c3e07d5bc3aaa53a83b8b6e4c68c",
    readTime: "6 min",
  },
  {
    id: 4,
    title: "Cruelty-Free Beauty: Brands That Don't Test on Animals",
    excerpt:
      "Discover our curated list of cruelty-free beauty brands committed to ethical practices and animal welfare.",
    date: "April 22, 2023",
    category: "Ethical Beauty",
    image:
      "https://img.freepik.com/free-photo/flat-lay-arrangement-with-beauty-products-wicker-basket_23-2148315735.jpg?w=1380&t=st=1712619500~exp=1712620100~hmac=13fa4ffb1b8b8cf8cefdb414d1d0636d24c74e90dcb1a6a3bcea6ff15d69b0b1",
    readTime: "8 min",
  },
  {
    id: 5,
    title: "DIY Natural Face Masks You Can Make at Home",
    excerpt:
      "Transform your kitchen ingredients into powerful skincare treatments with these easy DIY face mask recipes.",
    date: "April 15, 2023",
    category: "DIY Beauty",
    image:
      "https://img.freepik.com/free-photo/woman-with-face-mask-relaxing_23-2148863726.jpg?w=1380&t=st=1712619526~exp=1712620126~hmac=2c6b9551a8e1edaa6a7dd60d9c7e70e7cbdbc09a841a2e2faafda05aa6f2fdfb",
    readTime: "4 min",
  },
  {
    id: 6,
    title: "Expert Tips for Long-Lasting Makeup in Hot Weather",
    excerpt:
      "Makeup melting in the summer heat? Learn professional tips to make your makeup last all day even in high temperatures.",
    date: "March 30, 2023",
    category: "Makeup Tips",
    image:
      "https://img.freepik.com/free-photo/female-getting-her-makeup-done_53876-101228.jpg?w=1380&t=st=1712619551~exp=1712620151~hmac=a4cd33ff61d5a00d9a49addb2f5eb0d0fd6fbea5a05f23a0db4d0f15ab9b8577",
    readTime: "6 min",
  },
]

// Categories for filtering
const categories = ["All", "Makeup", "Skincare", "Haircare", "Ethical Beauty", "DIY Beauty", "Makeup Tips"]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto py-12">
        {/* Blog Header */}
        <div className="mb-16 px-4 md:px-8 lg:px-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Beauty Blog</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the latest beauty trends, expert tips, and tutorials to enhance your beauty routine.
          </p>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors 
                  ${category === "All" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <div className="px-4 md:px-8 lg:px-16 mb-16">
          <div className="relative h-[60vh] rounded-2xl overflow-hidden">
            <Image
              src="https://img.freepik.com/free-photo/beautiful-young-woman-with-clean-fresh-skin-touch-own-face_186202-7846.jpg?w=1800&t=st=1712619585~exp=1712620185~hmac=fcc3f66f28a49df5e00ecb83fc86a06c83fb4e72e8ca075b9bb84f4c5a74cb75"
              alt="Professional Skincare Secrets: What Dermatologists Want You to Know"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
              <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Featured
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Professional Skincare Secrets: What Dermatologists Want You to Know
              </h2>
              <p className="text-white/90 mb-6">
                We interviewed top dermatologists to reveal the skincare secrets they wish everyone knew. From
                ingredient myths to essential routines, this guide covers everything.
              </p>
              <div className="flex items-center text-white/80 text-sm mb-6">
                <span>July 2, 2023</span>
                <span className="mx-3">•</span>
                <span>10 min read</span>
              </div>
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Read Article
              </button>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${post.id}`} className="block">
                  <div className="relative h-60">
                    <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime} read</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <span className="text-primary font-medium">Read more →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="mt-16 text-center">
            <button className="border border-gray-300 bg-white px-8 py-3 rounded-full font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
              Load More Articles
            </button>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-24 px-4 md:px-8 lg:px-16">
          <div className="bg-accent rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to our newsletter</h3>
              <p className="text-gray-700 mb-6">
                Get the latest beauty tips, product recommendations, and exclusive offers directly to your inbox.
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
