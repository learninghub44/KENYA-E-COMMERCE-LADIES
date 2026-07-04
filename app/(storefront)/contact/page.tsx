"use client"

import { useState } from "react"
import type { Metadata } from "next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error("Failed to submit message")
      }

      setIsSuccess(true)
    } catch {
      setError("Something went wrong. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-muted-foreground">
          Have a question, feedback, or want to become a seller? We&apos;d love
          to hear from you.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Contact details */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Visit us</h2>
            <p className="text-muted-foreground">
              Zuri Market Ltd
              <br />
              4th Floor, Bishop Road Plaza
              <br />
              Bishop Road, Westlands
              <br />
              Nairobi, Kenya
            </p>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold">Get in touch</h2>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">General:</span>{" "}
                hello@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Support:</span>{" "}
                support@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Sellers:</span>{" "}
                sellers@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Press:</span>{" "}
                press@zurimarket.co.ke
              </li>
              <li>
                <span className="font-medium text-foreground">Phone:</span>{" "}
                +254 700 123 456
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold">Business hours</h2>
            <p className="text-muted-foreground">
              Monday – Friday: 8:00 AM – 6:00 PM (EAT)
              <br />
              Saturday: 9:00 AM – 2:00 PM (EAT)
              <br />
              Sunday & public holidays: Closed
            </p>
          </div>

          <div>
            <h2 className="mb-1 text-lg font-semibold">Order support</h2>
            <p className="text-muted-foreground">
              For questions about a specific order, message the seller directly
              from your{" "}
              <a href="/orders" className="underline underline-offset-4">
                orders page
              </a>{" "}
              — they handle fulfilment and can respond fastest.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Send us a message</h2>

          {isSuccess ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600 dark:text-green-400" />
              <h3 className="mb-1 text-lg font-semibold">Message sent!</h3>
              <p className="text-sm text-muted-foreground">
                Thank you for your message. We&apos;ll get back to you within 24
                hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select {...register("subject")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order issue</SelectItem>
                    <SelectItem value="seller">Seller inquiry</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="seller-application">Seller application</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  {...register("message")}
                  className="mt-1"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send message"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                We typically respond within 24 hours on business days.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
