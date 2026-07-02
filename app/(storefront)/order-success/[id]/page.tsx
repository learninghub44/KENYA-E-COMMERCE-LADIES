"use client"

import { use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ShoppingBag, Eye } from "lucide-react"

import { Button } from "../../../../components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card"
import { Separator } from "../../../../components/ui/separator"

interface OrderSuccessPageProps {
  params: Promise<{ id: string }>
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = use(params)
  const estimatedDelivery = addDays(new Date(), 7)

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Order Confirmed!
        </h1>
        <p className="mb-2 text-lg text-muted-foreground">
          Thank you for your purchase
        </p>

        <Card className="mb-8 mt-6">
          <CardContent className="p-6 text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Order Number
                </span>
                <span className="font-semibold">{id}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span>{formatDate(new Date())}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Estimated Delivery
                </span>
                <span className="font-medium">
                  {formatDate(estimatedDelivery)}
                </span>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your email address with
                all the details of your order.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={`/orders/${id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Order
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
