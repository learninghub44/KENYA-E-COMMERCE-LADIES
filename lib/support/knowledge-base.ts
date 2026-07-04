export interface KnowledgeArticle {
  id: string
  title: string
  slug: string
  category: string
  content: string
  tags: string[]
}

export const knowledgeBase: KnowledgeArticle[] = [
  {
    id: "about",
    title: "About Zuri Market",
    slug: "about",
    category: "general",
    content: `Zuri Market is a Kenyan multi-vendor online marketplace that connects buyers with independent sellers through a secure and easy-to-use digital platform. Our mission is to make online commerce more accessible by providing businesses of all sizes with the technology they need to reach more customers while giving shoppers access to a wide range of products from trusted vendors. Unlike a traditional retailer, Zuri Market does not own inventory or process payments. We provide, maintain, regulate, and improve the marketplace infrastructure that enables buyers and sellers to connect directly.`,
    tags: ["about", "company", "marketplace", "what is zuri market"],
  },
  {
    id: "faq-general",
    title: "General Frequently Asked Questions",
    slug: "faq",
    category: "general",
    content: `Zuri Market is a multi-vendor online marketplace where independent businesses and individual sellers can showcase and sell their products to customers across Kenya. Zuri Market is NOT the seller of products listed on the marketplace. Products are offered by independent vendors who manage their own stores. Our role is to provide, maintain, improve, and regulate the marketplace platform. Zuri Market does NOT process, receive, or hold payments. Payments are arranged directly between buyers and sellers using payment methods agreed upon by both parties. Zuri Market does NOT deliver products. Delivery arrangements are handled by individual vendors. Delivery options, timelines, and charges may vary from one seller to another.`,
    tags: ["faq", "general", "what is zuri market", "payments", "delivery"],
  },
  {
    id: "faq-buyer",
    title: "Buyer Frequently Asked Questions",
    slug: "faq-buyer",
    category: "buyers",
    content: `Do I need an account to shop? Some features may be available without an account, but creating an account allows you to save your favourite products, track your orders, contact sellers more easily, receive important updates, and manage your profile and preferences. How do I place an order? Browse products, select the product you want, choose available options such as size or colour, add the item to your cart, submit your order. The seller will contact you where necessary to confirm order details, payment arrangements, and delivery. How do I pay for my order? Payment arrangements are made directly with the seller. Each seller may accept different payment methods. Please confirm payment instructions with the seller before making payment. Can I cancel my order? Cancellation depends on whether the seller has already processed or dispatched the order. Contact the seller as soon as possible if you wish to cancel. Can I return a product? Yes, if the seller accepts returns under their return policy or where required by applicable law. Please review the seller's return policy before purchasing. Who handles refunds? Refunds are handled directly by the seller. Since Zuri Market does not process payments, we cannot issue refunds on behalf of vendors. What if I receive the wrong product? Contact the seller immediately. Provide photos and explain the issue. If communication becomes difficult, you may contact Zuri Market for assistance in facilitating communication. What if my order never arrives? You should first contact the seller for an update. If the issue cannot be resolved, you may contact Zuri Market for further assistance.`,
    tags: ["buyer", "faq", "order", "payment", "return", "refund", "account"],
  },
  {
    id: "faq-seller",
    title: "Seller Frequently Asked Questions",
    slug: "faq-seller",
    category: "sellers",
    content: `Who can become a seller? Businesses, entrepreneurs, retailers, wholesalers, manufacturers, and individual sellers who comply with our marketplace requirements may apply to sell on Zuri Market. How do I register as a seller? Create an account, complete your seller profile, provide any required business information, and follow the seller registration process available on the platform. Additional verification may be required before your store becomes active. Is there a registration fee? Registration requirements and any applicable seller fees are displayed during the seller onboarding process and may change from time to time. Who sets product prices? Each seller independently determines the prices of their products. Who manages inventory? Each seller is responsible for updating product availability and maintaining accurate stock information. Who communicates with customers? Sellers are responsible for responding to customer inquiries, confirming orders, arranging payment, and providing delivery updates. Who handles shipping? Shipping and delivery are the responsibility of each individual seller. Who handles returns? Each seller manages returns and refunds according to their return policy and applicable laws. Can my seller account be suspended? Yes. Seller accounts may be suspended or removed if they sell prohibited products, provide misleading information, engage in fraudulent activity, repeatedly fail to fulfil orders, violate marketplace policies, or abuse customers or other users.`,
    tags: ["seller", "faq", "register", "inventory", "shipping", "returns", "account"],
  },
  {
    id: "faq-account",
    title: "Account Questions",
    slug: "faq-account",
    category: "account",
    content: `I forgot my password. Use the "Forgot Password" option on the login page to reset your password. If you continue to experience difficulties, contact our support team. How do I update my account information? After logging in, go to your account settings where you can update your profile information, password, addresses, and contact details. How do I delete my account? You may request account deletion by contacting us at hello@zurimarket.co.ke. Some information may be retained where required by law or for legitimate business purposes.`,
    tags: ["account", "password", "forgot password", "delete account", "settings"],
  },
  {
    id: "shipping",
    title: "Shipping and Delivery Policy",
    slug: "shipping",
    category: "shipping",
    content: `Zuri Market is an online multi-vendor marketplace that connects buyers with independent sellers. Zuri Market does not own inventory, package products, ship orders, or provide delivery services unless expressly stated for a specific seller or product. Shipping and delivery are the responsibility of the individual vendor. Each seller on Zuri Market manages the delivery of their own products. Shipping methods, delivery timelines, courier services, and delivery charges may vary from one vendor to another depending on factors such as product type, vendor location, customer location, courier availability, delivery preferences, and size and weight of the order. Delivery charges are determined independently by each vendor. Estimated delivery times vary depending on the seller and delivery destination. Delivery estimates are provided for guidance only and should not be considered guaranteed delivery dates. After an order is received, the seller is responsible for confirming product availability, preparing the order, packaging the product, arranging shipment, and providing delivery updates where applicable.`,
    tags: ["shipping", "delivery", "courier", "delivery time", "delivery cost"],
  },
  {
    id: "returns",
    title: "Returns and Refund Policy",
    slug: "returns",
    category: "returns",
    content: `Zuri Market is a multi-vendor marketplace that connects buyers with independent sellers. We provide, maintain, and regulate the marketplace platform, but we do not own, manufacture, inspect, warehouse, or sell the products listed by vendors. Because products are sold by independent sellers, return and refund requests are handled by the respective vendor in accordance with their policies and applicable laws. Each vendor on Zuri Market may establish their own return and refund policy, provided it complies with applicable laws and marketplace standards. Depending on the vendor's policy, a return may be accepted if the wrong product was delivered, the product arrived damaged, the product is defective upon arrival, the product differs significantly from its description, required parts or accessories are missing, or the seller agrees to accept the return for another valid reason. Refunds, where approved, are issued directly by the seller using the payment method agreed upon between the buyer and seller. Since Zuri Market does not process or receive payments, we cannot issue refunds on behalf of vendors.`,
    tags: ["returns", "refund", "exchange", "damaged", "wrong product"],
  },
  {
    id: "payments",
    title: "Payments Information",
    slug: "payments",
    category: "payments",
    content: `Zuri Market does NOT process, receive, or hold payments. Payments are arranged directly between buyers and sellers using payment methods agreed upon by both parties. Each seller may accept different payment methods. Please confirm payment instructions with the seller before making payment. Is it safe to pay a seller directly? Every seller on Zuri Market passes KYC identity verification before they can list products, and buyer reviews help you gauge a seller's track record. Even so, only send payment once you've agreed on the details with the seller, and keep the conversation on Zuri Market's messaging so there's a record if you ever need support. What if a seller doesn't deliver after I've paid them? Message the seller first to resolve it directly. If you can't reach a resolution, contact Zuri Market support with your order and message history so we can step in and help mediate.`,
    tags: ["payment", "mpesa", "pay", "money", "transaction"],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    slug: "privacy",
    category: "legal",
    content: `Zuri Market respects your privacy and is committed to protecting your personal information. We collect information you provide directly, such as account information, order information, messaging content, seller information, and support communications. We use your information to provide marketplace services, process transactions, communicate with you, improve our platform, ensure security, and comply with legal obligations. We do not sell your personal information to third parties. We implement reasonable security measures to protect your information. Contact us at hello@zurimarket.co.ke for privacy-related inquiries.`,
    tags: ["privacy", "data", "personal information", "security"],
  },
  {
    id: "terms",
    title: "Terms and Conditions",
    slug: "terms",
    category: "legal",
    content: `These Terms and Conditions govern your use of the Zuri Market platform. By using Zuri Market, you agree to these terms. Zuri Market is a marketplace platform connecting buyers and sellers. We are not a party to any transaction between buyers and sellers. Sellers are independently responsible for their products, pricing, shipping, and customer service. Buyers are responsible for reviewing products and sellers before purchasing. Payments are arranged directly between buyers and sellers. Zuri Market does not process payments. Users must be at least 18 years old to use the platform. Prohibited items include illegal products, counterfeit goods, and items that violate marketplace policies. These terms are governed by the laws of Kenya.`,
    tags: ["terms", "conditions", "legal", "agreement", "rules"],
  },
  {
    id: "contact",
    title: "Contact Information",
    slug: "contact",
    category: "support",
    content: `For customer support, contact us at hello@zurimarket.co.ke. We aim to respond to most enquiries within 1-2 business days. For order-related issues, buyers should first contact the respective seller directly. If additional assistance is needed, Zuri Market is happy to help facilitate communication where appropriate. For media enquiries, partnership opportunities, or career applications, email us at hello@zurimarket.co.ke.`,
    tags: ["contact", "support", "email", "help"],
  },
  {
    id: "marketplace-policies",
    title: "Marketplace Policies",
    slug: "marketplace-policies",
    category: "general",
    content: `Zuri Market is a multi-vendor marketplace. We provide the technology platform connecting buyers and sellers. We do NOT own products, process payments, operate delivery services, or sell products directly. Sellers are responsible for product listings, pricing, quality, availability, shipping, customer support, returns, refunds, and payment arrangements. Zuri Market is responsible for maintaining the marketplace, improving platform performance, protecting user accounts, enforcing marketplace policies, supporting users, monitoring marketplace activity, and promoting a safe trading environment. Products that violate Kenyan law or marketplace policies are not permitted. We reserve the right to remove prohibited listings and suspend accounts that violate our policies.`,
    tags: ["policy", "rules", "marketplace", "prohibited", "guidelines"],
  },
  {
    id: "seller-products",
    title: "Managing Products as a Seller",
    slug: "seller-products",
    category: "sellers",
    content: `As a seller on Zuri Market, you can create professional online stores, list and manage products, reach customers across Kenya, receive inquiries from buyers, build your brand, manage inventory, and grow your business online. To add products, go to your seller dashboard and use the product listing form. Each seller is responsible for updating product availability and maintaining accurate stock information. Each seller independently determines the prices of their products.`,
    tags: ["seller", "products", "listing", "inventory", "store"],
  },
  {
    id: "seller-shipping",
    title: "Seller Shipping Responsibilities",
    slug: "seller-shipping",
    category: "sellers",
    content: `Shipping and delivery are the responsibility of each individual seller. After an order is received, the seller is responsible for confirming product availability, preparing the order, packaging the product, arranging shipment, and providing delivery updates where applicable. Sellers should process orders within a reasonable time, package products securely, use reliable delivery methods, communicate shipping updates where appropriate, inform customers of any delays, and deliver products that match the listing description.`,
    tags: ["seller", "shipping", "delivery", "fulfillment"],
  },
  {
    id: "seller-returns",
    title: "Seller Return Responsibilities",
    slug: "seller-returns",
    category: "sellers",
    content: `Each seller manages returns and refunds according to their return policy and applicable laws. Vendors are expected to clearly communicate their return policy, respond to customer inquiries promptly, handle return requests fairly and professionally, comply with applicable consumer protection laws, and honour approved refunds or exchanges within a reasonable time. Failure to meet these expectations may result in warnings, account restrictions, suspension, or removal from the marketplace.`,
    tags: ["seller", "returns", "refunds", "policy"],
  },
  {
    id: "report-problem",
    title: "Reporting a Problem",
    slug: "report",
    category: "support",
    content: `If you encounter a technical issue, a bug or system error, a suspicious account, fraudulent activity, inappropriate content, a product that violates marketplace policies, or security concerns, please contact us with as much detail as possible so our team can investigate promptly. For questions about a specific order, payment arrangement, delivery, return, or product, buyers should first contact the respective seller. If additional assistance is needed, we are happy to help facilitate communication where appropriate.`,
    tags: ["report", "problem", "issue", "bug", "fraud", "security"],
  },
]

export function searchKnowledgeBase(query: string): KnowledgeArticle[] {
  const lowerQuery = query.toLowerCase()
  const words = lowerQuery.split(/\s+/).filter(Boolean)

  return knowledgeBase
    .map((article) => {
      let score = 0
      const lowerContent = article.content.toLowerCase()
      const lowerTitle = article.title.toLowerCase()
      const lowerTags = article.tags.map((t) => t.toLowerCase())

      for (const word of words) {
        if (lowerTitle.includes(word)) score += 10
        if (lowerTags.some((t) => t.includes(word))) score += 8
        if (lowerContent.includes(word)) score += 2
      }

      return { ...article, score }
    })
    .filter((article) => article.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

export function getKnowledgeContext(query: string): string {
  const articles = searchKnowledgeBase(query)
  if (articles.length === 0) return ""

  return articles
    .map(
      (a) => `### ${a.title}\n${a.content.substring(0, 500)}${a.content.length > 500 ? "..." : ""}`
    )
    .join("\n\n")
}
