"use client"

export interface Variant {
  id: string
  name: string // e.g. "Small", "Medium"
  size?: string
  color?: string
  stock: number
}

export interface MockProduct {
  id: string
  name: string
  sku: string
  price: number
  comparePrice?: number | null
  stock: number
  status: "Active" | "Draft" | "Out of Stock"
  category: string
  description: string
  images: string[]
  variants: Variant[]
  sales: number
  revenue: number
  rating: number
  reviewCount: number
  createdAt: string
  slug: string
  sellerName: string
}

const DEFAULT_MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    name: "Kitenge Luxury Maxi Dress",
    sku: "KMD-001",
    price: 3500,
    comparePrice: 4800,
    stock: 45,
    status: "Active",
    category: "Fashion",
    description: "Stunning, handcrafted maxi dress made from authentic premium East African Kitenge wax print fabric. Features side pockets, an adjustable waist belt, and an elegant off-shoulder silhouette perfect for weddings, parties, or stylish weekend outings.",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v1-1", name: "Small", size: "S", color: "Multicolor", stock: 15 },
      { id: "v1-2", name: "Medium", size: "M", color: "Multicolor", stock: 20 },
      { id: "v1-3", name: "Large", size: "L", color: "Multicolor", stock: 10 },
    ],
    sales: 42,
    revenue: 147000,
    rating: 4.8,
    reviewCount: 24,
    createdAt: "2026-04-10",
    slug: "kitenge-luxury-maxi-dress",
    sellerName: "Zuri Designs Kenya",
  },
  {
    id: "2",
    name: "Maasai Beaded Leather Sandals",
    sku: "MBS-002",
    price: 1800,
    comparePrice: 2500,
    stock: 22,
    status: "Active",
    category: "Footwear",
    description: "Exquisite sandals crafted from genuine Kenyan leather and hand-decorated with vibrant, traditional Maasai glass beads. The comfortable inner lining and durable rubber sole make them perfect for daily summer wear or beach vacations.",
    images: ["https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v2-1", name: "Size 38", size: "38", color: "Beaded", stock: 8 },
      { id: "v2-2", name: "Size 39", size: "39", color: "Beaded", stock: 10 },
      { id: "v2-3", name: "Size 40", size: "40", color: "Beaded", stock: 4 },
    ],
    sales: 85,
    revenue: 153000,
    rating: 4.7,
    reviewCount: 38,
    createdAt: "2026-03-15",
    slug: "maasai-beaded-leather-sandals",
    sellerName: "Mara Crafts",
  },
  {
    id: "3",
    name: "Ankara Fitted Blazer",
    sku: "AFB-003",
    price: 5200,
    comparePrice: 6500,
    stock: 12,
    status: "Active",
    category: "Fashion",
    description: "Make a statement at the office or evening dinners with this beautifully tailored, form-fitting Ankara blazer. Made from 100% African cotton wax print with premium satin lining. Pairs perfectly with high-waist trousers or a simple pencil skirt.",
    images: ["https://images.unsplash.com/photo-1548624149-f7b2e65cbdde?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v3-1", name: "Medium", size: "M", color: "Yellow/Blue", stock: 6 },
      { id: "v3-2", name: "Large", size: "L", color: "Yellow/Blue", stock: 6 },
    ],
    sales: 18,
    revenue: 93600,
    rating: 4.9,
    reviewCount: 12,
    createdAt: "2026-05-01",
    slug: "ankara-fitted-blazer",
    sellerName: "Amani Apparels",
  },
  {
    id: "4",
    name: "Organic Coconut & Shea Body Butter",
    sku: "CSB-004",
    price: 1200,
    comparePrice: 1600,
    stock: 35,
    status: "Active",
    category: "Skincare",
    description: "Deeply moisturizing whipped body butter made from cold-pressed Shea Butter from Northern Uganda and organic coconut oil from coastal Kenya. Delicately scented with pure vanilla extract, providing 24-hour hydration and a gorgeous glow for skin.",
    images: ["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v4-1", name: "250ml Jar", size: "250ml", color: "Natural", stock: 35 },
    ],
    sales: 142,
    revenue: 170400,
    rating: 4.6,
    reviewCount: 57,
    createdAt: "2026-02-10",
    slug: "organic-coconut-shea-body-butter",
    sellerName: "Pwani Organics",
  },
  {
    id: "5",
    name: "Vitamin C & Hyaluronic Glow Serum",
    sku: "VCS-005",
    price: 2100,
    comparePrice: 2800,
    stock: 18,
    status: "Active",
    category: "Skincare",
    description: "A lightweight, fast-absorbing facial serum designed to brighten skin tone, fade dark spots, and lock in moisture. Formulated with 15% pure Vitamin C, Hyaluronic Acid, and Aloe Vera extract. Perfect for daily morning skincare routines.",
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v5-1", name: "30ml Bottle", size: "30ml", color: "Clear", stock: 18 },
    ],
    sales: 64,
    revenue: 134400,
    rating: 4.5,
    reviewCount: 22,
    createdAt: "2026-05-20",
    slug: "vitamin-c-hyaluronic-glow-serum",
    sellerName: "Zuri Beauty Lab",
  },
  {
    id: "6",
    name: "Handwoven Sisal & Leather Tote",
    sku: "SLT-006",
    price: 3800,
    comparePrice: 5000,
    stock: 9,
    status: "Active",
    category: "Accessories",
    description: "Stunning handwoven Kiondo tote bag crafted from fine natural sisal fibers and finished with durable dark brown leather straps and zip closure. Extremely spacious, ideal as a stylish daily handbag, beach tote, or weekend travel bag.",
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v6-1", name: "Standard", size: "Medium", color: "Natural/Brown", stock: 9 },
    ],
    sales: 29,
    revenue: 110200,
    rating: 4.8,
    reviewCount: 16,
    createdAt: "2026-04-18",
    slug: "handwoven-sisal-leather-tote",
    sellerName: "Machakos Weavers",
  },
  {
    id: "7",
    name: "Satin Hair Bonnet & Pillowcase Set",
    sku: "SBP-007",
    price: 950,
    comparePrice: 1400,
    stock: 50,
    status: "Active",
    category: "Accessories",
    description: "Protect your curls, braids, and locks with this ultra-soft, premium double-layered satin hair bonnet and matching standard satin pillowcase set. Minimizes hair friction, reduces frizz, prevents breakage, and locks in moisture overnight.",
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v7-1", name: "Rose Gold Set", size: "Standard", color: "Rose Gold", stock: 25 },
      { id: "v7-2", name: "Midnight Black Set", size: "Standard", color: "Midnight Black", stock: 25 },
    ],
    sales: 110,
    revenue: 104500,
    rating: 4.7,
    reviewCount: 31,
    createdAt: "2026-04-01",
    slug: "satin-hair-bonnet-pillowcase-set",
    sellerName: "Silk Secrets Kenya",
  },
  {
    id: "8",
    name: "Velvet Matte Lipstick - Nairobi Red",
    sku: "VML-008",
    price: 1500,
    comparePrice: 2200,
    stock: 0,
    status: "Out of Stock",
    category: "Beauty",
    description: "An iconic, rich crimson shade formulated specifically to compliment warm African skin tones. Dries to a gorgeous velvet matte finish that is completely transfer-proof and lasts up to 12 hours without drying out your lips.",
    images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80"],
    variants: [
      { id: "v8-1", name: "Standard", size: "4.5g", color: "Nairobi Red", stock: 0 },
    ],
    sales: 204,
    revenue: 306000,
    rating: 4.9,
    reviewCount: 84,
    createdAt: "2026-01-20",
    slug: "velvet-matte-lipstick-nairobi-red",
    sellerName: "Zuri Beauty Lab",
  },
]

export function getMockProducts(): MockProduct[] {
  if (typeof window === "undefined") return DEFAULT_MOCK_PRODUCTS
  
  const stored = localStorage.getItem("seller_products")
  if (!stored) {
    localStorage.setItem("seller_products", JSON.stringify(DEFAULT_MOCK_PRODUCTS))
    return DEFAULT_MOCK_PRODUCTS
  }
  
  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error("Error parsing stored products, resetting to defaults", e)
    localStorage.setItem("seller_products", JSON.stringify(DEFAULT_MOCK_PRODUCTS))
    return DEFAULT_MOCK_PRODUCTS
  }
}

export function saveMockProducts(products: MockProduct[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("seller_products", JSON.stringify(products))
  }
}

export function addMockProduct(product: Omit<MockProduct, "id" | "sales" | "revenue" | "rating" | "reviewCount" | "createdAt" | "slug" | "sellerName">): MockProduct {
  const products = getMockProducts()
  
  const id = (products.length > 0 ? Math.max(...products.map(p => parseInt(p.id) || 0)) + 1 : 1).toString()
  const slug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    
  const newProduct: MockProduct = {
    ...product,
    id,
    sales: 0,
    revenue: 0,
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString().split("T")[0] || "2026-07-04",
    slug,
    sellerName: "Zuri Designs Kenya",
  }
  
  products.unshift(newProduct)
  saveMockProducts(products)
  return newProduct
}

export function updateMockProduct(id: string, updatedFields: Partial<MockProduct>): MockProduct | null {
  const products = getMockProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  
  const updatedProduct = {
    ...products[index],
    ...updatedFields,
  } as MockProduct
  
  // Re-generate slug if name changed
  if (updatedFields.name) {
    updatedProduct.slug = updatedFields.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }
  
  products[index] = updatedProduct
  saveMockProducts(products)
  return updatedProduct
}

export function deleteMockProduct(id: string): boolean {
  const products = getMockProducts()
  const filtered = products.filter(p => p.id !== id)
  if (filtered.length === products.length) return false
  
  saveMockProducts(filtered)
  return true
}

export function resetMockProducts() {
  saveMockProducts(DEFAULT_MOCK_PRODUCTS)
}
