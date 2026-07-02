"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Progress } from "../../../components/ui/progress"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"
import { Separator } from "../../../components/ui/separator"

type KycStatus = "not_submitted" | "pending" | "verified" | "rejected"

const mockKycData = {
  status: "verified" as KycStatus,
  submissionDate: "2024-10-15",
  estimatedReviewTime: "3-5 business days",
  rejectionReason:
    "The uploaded ID document was not clearly readable. Please upload a clearer image.",
}

export default function KycPage() {
  const [kyc] = useState(mockKycData)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KYC Verification</h1>
        <p className="text-sm text-muted-foreground">
          Verify your identity to start selling on the platform.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {kyc.status === "not_submitted" && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Documents</CardTitle>
                <CardDescription>
                  Please upload the required documents for verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Government-issued ID (National ID or Passport)</Label>
                  <button
                    type="button"
                    className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload ID
                  </button>
                </div>
                <div className="space-y-3">
                  <Label>Selfie with ID</Label>
                  <button
                    type="button"
                    className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Selfie
                  </button>
                </div>
                <div className="space-y-3">
                  <Label>Business Registration Document (optional)</Label>
                  <button
                    type="button"
                    className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Document
                  </button>
                </div>
                <Button className="w-full">Submit for Verification</Button>
              </CardContent>
            </Card>
          )}

          {kyc.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Verification In Progress</CardTitle>
                <CardDescription>
                  Your documents are being reviewed by our team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Under Review</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {kyc.submissionDate}
                  </p>
                </div>
                <div className="mx-auto max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated review time</span>
                    <span className="font-medium">{kyc.estimatedReviewTime}</span>
                  </div>
                  <Progress value={45} />
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll notify you once the verification is complete.
                </p>
              </CardContent>
            </Card>
          )}

          {kyc.status === "verified" && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Complete</CardTitle>
                <CardDescription>
                  Your identity has been verified successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Verified</p>
                  <p className="text-sm text-muted-foreground">
                    Verified since {kyc.submissionDate}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-emerald-50 px-4 py-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Verified Seller Badge
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {kyc.status === "rejected" && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Rejected</CardTitle>
                <CardDescription>
                  Your verification was not approved. Please review the reason below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Rejection Reason
                      </p>
                      <p className="text-sm text-red-700">
                        {kyc.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-submit Documents
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {kyc.status === "verified" && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                )}
                {kyc.status === "pending" && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
                {kyc.status === "rejected" && (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    <XCircle className="mr-1 h-3 w-3" />
                    Rejected
                  </Badge>
                )}
                {kyc.status === "not_submitted" && (
                  <Badge variant="secondary">Not Submitted</Badge>
                )}
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>
                  KYC verification is required to activate your seller account
                  and start receiving payments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
