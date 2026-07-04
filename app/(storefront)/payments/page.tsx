import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payments — Kenya E-Commerce",
  description:
    "Learn how payments work on Kenya E-Commerce. All payments are made directly between buyers and sellers.",
}

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Payments
        </h1>
      </div>

      <div className="space-y-6 text-gray-600 leading-relaxed">
        <p>
          Kenya E-Commerce does not process, collect, or store payment information. All payment arrangements are made directly between buyers and sellers using payment methods agreed upon by both parties.
        </p>

        <p>
          Because we are not involved in payment transactions, we do not have access to bank account details, mobile money credentials, card information, or other financial information exchanged between buyers and sellers.
        </p>

        <p>
          Users are encouraged to use secure and trusted payment methods and exercise caution when making transactions.
        </p>
      </div>
    </div>
  )
}
