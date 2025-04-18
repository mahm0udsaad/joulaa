// Sample product data
export const products = [
  {
    id: 1,
    name: "Velvet Matte Lipstick",
    brand: "Golden Rose",
    description: "A luxurious matte lipstick that provides rich color payoff with a comfortable, long-lasting finish.",
    price: 15.99,
    discount: 0.1,
    image_urls: [
      "https://tse4.mm.bing.net/th?id=OIP.zMgS3HwfDpxCZTjrj-uIZAHaFP&pid=Api",
      "https://tse2.mm.bing.net/th?id=OIP.g9fYq7pRmvWyYSUvooSOhQHaJz&pid=Api",
    ],
    category: "Lips",
    stock_quantity: 120,
    rating: 4.5,
    reviews: 87,
    colors: [
      {
        name: "Crimson Red",
        hex_value: "#DC143C",
      },
      {
        name: "Nude Beige",
        hex_value: "#F5DEB3",
      },
    ],
  },
  {
    id: 2,
    name: "Luminous Liquid Foundation",
    brand: "Glo Skin Beauty",
    description: "A lightweight, buildable foundation that imparts a radiant glow while evening out skin tone.",
    price: 22.5,
    discount: 0.15,
    image_urls: [
      "https://tse4.mm.bing.net/th?id=OIP.3E-9GZLnPi5EhM7ceYd2mQHaHa&pid=Api",
      "https://tse2.mm.bing.net/th?id=OIP.1Wc5ZRRUeppp4Tcgu9CGZwHaHa&pid=Api",
    ],
    category: "Face",
    stock_quantity: 200,
    rating: 4.7,
    reviews: 142,
    shades: [
      {
        name: "Ivory",
        hex_value: "#FFFFF0",
      },
      {
        name: "Honey",
        hex_value: "#F3E2A9",
      },
      {
        name: "Mocha",
        hex_value: "#3B2F2F",
      },
    ],
  },
  {
    id: 3,
    name: "Waterproof Lengthening Mascara",
    brand: "L'Oréal Paris",
    description: "A waterproof mascara that lengthens and volumizes lashes without clumping or smudging.",
    price: 12.75,
    discount: 0.05,
    image_urls: [
      "https://tse2.mm.bing.net/th?id=OIP.1Wc5ZRRUeppp4Tcgu9CGZwHaHa&pid=Api",
      "https://tse2.mm.bing.net/th?id=OIP.g9fYq7pRmvWyYSUvooSOhQHaJz&pid=Api",
    ],
    category: "Eyes",
    stock_quantity: 150,
    rating: 4.4,
    reviews: 347,
    colors: [
      {
        name: "Blackest Black",
        hex_value: "#000000",
      },
    ],
  },
  {
    id: 4,
    name: "Le Rouge Sheer Velvet Matte Lipstick",
    brand: "GIVENCHY",
    description: "A sheer matte lipstick that delivers a blurring effect and enhances the natural beauty of your lips.",
    price: 37.0,
    discount: 0.1,
    image_urls: [
      "https://tse2.mm.bing.net/th?id=OIP.g9fYq7pRmvWyYSUvooSOhQHaJz&pid=Api",
      "https://tse4.mm.bing.net/th?id=OIP.zMgS3HwfDpxCZTjrj-uIZAHaFP&pid=Api",
    ],
    category: "Lips",
    stock_quantity: 80,
    rating: 4.6,
    reviews: 95,
    colors: [
      {
        name: "Rouge Santal",
        hex_value: "#A52A2A",
      },
      {
        name: "Beige Nu",
        hex_value: "#D2B48C",
      },
    ],
  },
  {
    id: 5,
    name: "Hydro Grip Gel Skin Tint",
    brand: "Milk Makeup",
    description: "A lightweight skin tint that offers a breathable and dewy finish, perfect for warm days.",
    price: 36.0,
    discount: 0.1,
    image_urls: [
      "https://tse4.mm.bing.net/th?id=OIP.3E-9GZLnPi5EhM7ceYd2mQHaHa&pid=Api",
      "https://tse2.mm.bing.net/th?id=OIP.1Wc5ZRRUeppp4Tcgu9CGZwHaHa&pid=Api",
    ],
    category: "Face",
    stock_quantity: 100,
    rating: 4.8,
    reviews: 210,
    shades: [
      {
        name: "Light",
        hex_value: "#F5F5DC",
      },
      {
        name: "Medium",
        hex_value: "#D2B48C",
      },
      {
        name: "Deep",
        hex_value: "#8B4513",
      },
    ],
  },
  {
    id: 6,
    name: "Super Stay® Lumi-Matte Foundation",
    brand: "Maybelline New York",
    description: "A long-lasting foundation that provides a luminous matte finish, suitable for all skin types.",
    price: 11.99,
    discount: 0.2,
    image_urls: [
      "https://img.freepik.com/free-photo/top-view-fundation-packaging_52683-94663.jpg?t=st=1740818310~exp=1740821910~hmac=486d715166f33a71951ccd5ec80c2cf1b303b79ead1e3be3b8f303fb2b8c3541&w=740",
      "https://tse2.mm.bing.net/th?id=OIP.1Wc5ZRRUeppp4Tcgu9CGZwHaHa&pid=Api",
    ],
    category: "Face",
    stock_quantity: 250,
    rating: 4.2,
    reviews: 178,
    shades: [
      {
        name: "Porcelain",
        hex_value: "#F5F5F5",
      },
      {
        name: "Natural Beige",
        hex_value: "#D2B48C",
      },
      {
        name: "Espresso",
        hex_value: "#3B2F2F",
      },
    ],
  },
]

export const categories = [
  {
    id: 1,
    name: "Lips",
    image: "https://tse2.mm.bing.net/th?id=OIP.g9fYq7pRmvWyYSUvooSOhQHaJz&pid=Api",
    count: 24,
  },
  {
    id: 2,
    name: "Face",
    image: "https://tse4.mm.bing.net/th?id=OIP.3E-9GZLnPi5EhM7ceYd2mQHaHa&pid=Api",
    count: 36,
  },
  {
    id: 3,
    name: "Eyes",
    image: "https://tse2.mm.bing.net/th?id=OIP.1Wc5ZRRUeppp4Tcgu9CGZwHaHa&pid=Api",
    count: 18,
  },
]

export const featuredProducts = [1, 2, 4, 5]
export const newArrivals = [5, 3, 6, 1]
export const bestSellers = [2, 4, 1, 6]

export function getProductById(id: number) {
  return products.find((product) => product.id === id)
}

export function getProductsByCategory(category: string) {
  return products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
}

export function getDiscountedPrice(price: number, discount: number) {
  return (price * (1 - discount)).toFixed(2)
}

export function formatCurrency(amount: number | string) {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `${num.toFixed(2)} AED`
}
