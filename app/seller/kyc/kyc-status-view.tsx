"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import type { KycStatus, StoredSellerStatus } from "../../../lib/seller";

type DocumentType = "national_id" | "passport" | "business_registration" | "tax_certificate" | "proof_of_address";

const REQUIRED_DOCUMENTS: { type: DocumentType; label: string; description: string }[] = [
  { type: "national_id", label: "National ID or passport", description: "A clear photo of your government-issued ID" },
  { type: "proof_of_address", label: "Proof of address", description: "A utility bill or bank statement from the last 3 months" },
];

interface KycStatusViewProps {
  sellerId: string;
  sellerStatus: StoredSellerStatus;
  kycStatus: KycStatus;
  verification: {
    status: KycStatus;
    submittedAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
  } | null;
}

function statusBadge(status: KycStatus) {
  switch (status) {
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge>;
    case "rejected":
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
    case "expired":
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Expired</Badge>;
    case "pending":
    case "manual_review":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100/80"><Clock className="mr-1 h-3 w-3" />Under review</Badge>;
    default:
      return <Badge variant="outline">Not started</Badge>;
  }
}

export function KycStatusView({ sellerId, kycStatus, verification }: KycStatusViewProps) {
  const router = useRouter();
  const [files, setFiles] = useState<Partial<Record<DocumentType, File>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = kycStatus === "not_started" || kycStatus === "rejected" || kycStatus === "expired";
  const allDocumentsSelected = REQUIRED_DOCUMENTS.every((doc) => files[doc.type]);

  const handleFileChange = (type: DocumentType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFiles((prev) => ({ ...prev, [type]: file ?? undefined }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const uploadedDocuments: { type: DocumentType; storagePath: string }[] = [];
      for (const doc of REQUIRED_DOCUMENTS) {
        const file = files[doc.type];
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "kycDocuments");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          const body = await uploadRes.json().catch(() => ({}));
          throw new Error(body.error ?? `Failed to upload ${doc.label}`);
        }
        const { url } = await uploadRes.json();
        uploadedDocuments.push({ type: doc.type, storagePath: url });
      }

      const submitRes = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, documents: uploadedDocuments }),
      });
      if (!submitRes.ok) {
        const body = await submitRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to submit verification");
      }

      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {canSubmit && (
          <Card>
            <CardHeader>
              <CardTitle>Submit your documents</CardTitle>
              <CardDescription>
                {kycStatus === "rejected"
                  ? "Your previous submission was rejected. Please review the reason below and re-submit."
                  : "Upload the required documents for verification."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {verification?.rejectionReason && kycStatus === "rejected" && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{verification.rejectionReason}</p>
                </div>
              )}
              {REQUIRED_DOCUMENTS.map((doc) => (
                <div key={doc.type} className="space-y-2">
                  <Label htmlFor={doc.type}>{doc.label}</Label>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                  <Input
                    id={doc.type}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleFileChange(doc.type)}
                  />
                  {files[doc.type] && (
                    <p className="text-xs text-emerald-600">Selected: {files[doc.type]!.name}</p>
                  )}
                </div>
              ))}
              {submitError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!allDocumentsSelected || submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit for verification
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {!canSubmit && (
          <Card>
            <CardHeader>
              <CardTitle>Verification status</CardTitle>
              <CardDescription>
                {kycStatus === "approved"
                  ? "You're verified and can access every seller feature."
                  : "Your documents are with our review team."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3 py-6">
              <ShieldCheck className="h-8 w-8 text-muted-foreground" />
              <div>
                {statusBadge(kycStatus)}
                {verification?.submittedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Submitted {new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(new Date(verification.submittedAt))}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Why we ask</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Verification protects buyers and keeps Zuri Market trustworthy. Until it&apos;s approved, your
              dashboard is visible but products, orders, and store settings stay locked.
            </p>
            <Separator />
            <p>Review usually takes 1&ndash;3 business days.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
