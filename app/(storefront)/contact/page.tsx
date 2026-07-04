"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"

import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"

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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-lg font-medium text-[#1C5C56]">
          We&apos;d Love to Hear From You
        </p>
      </div>

      <div className="space-y-10 text-gray-600 leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            Whether you&apos;re a buyer, seller, business partner, or simply have a question about Zuri Market, our team is here to help.
          </p>
          <p className="mt-3">
            We value your feedback, suggestions, and enquiries, and we&apos;re committed to responding as quickly as possible.
          </p>
        </section>

        <hr className="border-gray-200" />

        {/* Customer Support */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Customer Support</h2>
          <p>
            If you need assistance with your account, products, sellers, marketplace features, or general enquiries, our support team is ready to assist you.
          </p>
          <p className="mt-3">
            <strong className="text-gray-800">Email:</strong>{" "}
            <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
              hello@zurimarket.co.ke
            </a>
          </p>
          <p className="mt-2">
            We aim to respond to most enquiries within <strong className="text-gray-800">1–2 business days</strong>.
          </p>
        </section>

        {/* Buyers */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Buyers</h2>
          <p>If you need help with:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Finding products</li>
            <li>Your account</li>
            <li>Contacting a seller</li>
            <li>Reporting a listing</li>
            <li>Marketplace policies</li>
            <li>General shopping questions</li>
          </ul>
          <p className="mt-3">
            Please contact our support team, and we&apos;ll be happy to assist.
          </p>
        </section>

        {/* Sellers */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Sellers</h2>
          <p>If you&apos;re already selling on Zuri Market or would like to become a vendor, we&apos;re here to help with:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Seller registration</li>
            <li>Store setup</li>
            <li>Product listings</li>
            <li>Marketplace policies</li>
            <li>Account verification</li>
            <li>Technical support</li>
            <li>General seller enquiries</li>
          </ul>
          <p className="mt-3">
            Our goal is to help every seller succeed on our marketplace.
          </p>
        </section>

        {/* Business & Partnerships */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Business &amp; Partnerships</h2>
          <p>
            We welcome partnership opportunities with businesses, technology providers, logistics companies, educational institutions, payment service providers, and organizations that share our vision of growing digital commerce in Kenya.
          </p>
          <p className="mt-3">
            <strong className="text-gray-800">Email:</strong>{" "}
            <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
              hello@zurimarket.co.ke
            </a>
          </p>
        </section>

        {/* Media & Press */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Media &amp; Press</h2>
          <p>
            Journalists, bloggers, researchers, and media organizations seeking interviews, company information, or official statements may contact us through our official support email.
          </p>
          <p className="mt-3">
            <strong className="text-gray-800">Email:</strong>{" "}
            <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
              hello@zurimarket.co.ke
            </a>
          </p>
        </section>

        {/* Careers */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Careers</h2>
          <p>Interested in joining the Zuri Market team? We welcome applications from talented professionals, students, interns, and recent graduates.</p>
          <p className="mt-3">
            <strong className="text-gray-800">Email:</strong>{" "}
            <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
              hello@zurimarket.co.ke
            </a>
          </p>
        </section>

        {/* Report a Problem */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Report a Problem</h2>
          <p>If you encounter a technical issue or would like to report:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>A bug or system error</li>
            <li>A suspicious account</li>
            <li>Fraudulent activity</li>
            <li>Inappropriate content</li>
            <li>A product that violates our marketplace policies</li>
            <li>Security concerns</li>
          </ul>
          <p className="mt-3">
            Please contact us with as much detail as possible so our team can investigate promptly.
          </p>
        </section>

        {/* Marketplace Support */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Marketplace Support</h2>
          <p>Zuri Market provides and maintains the technology that connects buyers and sellers. Please note:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>We do not own products listed by vendors.</li>
            <li>We do not process or hold payments.</li>
            <li>We do not operate delivery services.</li>
            <li>We do not sell products directly.</li>
          </ul>
          <p className="mt-3">
            For questions about a specific order, payment arrangement, delivery, return, or product, buyers should first contact the respective seller. If additional assistance is needed, we are happy to help facilitate communication where appropriate.
          </p>
        </section>

        {/* Business Hours */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Business Hours</h2>
          <p>
            Our support team monitors enquiries during normal business hours. Response times may vary during weekends, public holidays, or periods of high enquiry volume, but we aim to respond as promptly as reasonably possible.
          </p>
        </section>

        {/* Contact Form */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Send Us a Message</h2>

          {isSuccess ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
              <h3 className="mb-1 text-lg font-semibold text-gray-900">Message sent!</h3>
              <p className="text-sm text-gray-600">
                Thank you for your message. We&apos;ll get back to you within 1–2 business days.
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
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  {...register("subject")}
                  className="mt-1"
                  placeholder="How can we help?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
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
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
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
              <p className="text-xs text-gray-500">
                We typically respond within 1–2 business days.
              </p>
            </form>
          )}
        </section>

        {/* Stay Connected */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Stay Connected</h2>
          <p>
            As Zuri Market continues to grow, we&apos;ll keep introducing new features, improving our marketplace, and supporting businesses across Kenya.
          </p>
          <p className="mt-3">
            We appreciate your trust and thank you for being part of our growing community.
          </p>
        </section>

        {/* Contact Info */}
        <section className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="font-medium text-gray-800">Zuri Market</p>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:hello@zurimarket.co.ke" className="text-[#1C5C56] underline underline-offset-2">
              hello@zurimarket.co.ke
            </a>
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Thank you for choosing Zuri Market. We look forward to assisting you and making your experience on our marketplace as smooth and enjoyable as possible.
          </p>
        </section>
      </div>
    </div>
  )
}
