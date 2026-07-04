import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "../../../components/ui/card";
import { createSupabaseClient } from "../../../lib/supabase/server";
import { createSupabaseSellerRepository } from "../../../lib/seller";
import { createSupabaseKycRepository } from "../../../lib/kyc/supabase-kyc-repository";
import { createKycService } from "../../../lib/kyc/kyc-service";
import { createDiditProvider } from "../../../lib/kyc/didit-provider";
import { KycStatusView } from "./kyc-status-view";

export default async function KycPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/seller/kyc");

  const seller = await createSupabaseSellerRepository(supabase as any).findByOwnerId(user.id);
  if (!seller) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">KYC Verification</h1>
          <p className="text-sm text-muted-foreground">Verify your identity to start selling on the platform.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No seller account is linked to this session.
          </CardContent>
        </Card>
      </div>
    );
  }

  const kycService = createKycService({
    repository: createSupabaseKycRepository(supabase as any),
    provider: createDiditProvider(null),
  });

  const statusResult = await kycService.getStatus(seller.id, user.id);
  const verification = statusResult.ok ? statusResult.data : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KYC Verification</h1>
        <p className="text-sm text-muted-foreground">Verify your identity to start selling on the platform.</p>
      </div>

      {params.reason === "verification_required" && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 py-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              That page requires an approved seller account. Complete verification below to unlock products,
              orders, and store settings.
            </p>
          </CardContent>
        </Card>
      )}

      <KycStatusView
        sellerId={seller.id}
        sellerStatus={seller.status}
        kycStatus={seller.kycStatus}
        verification={
          verification
            ? {
                status: verification.status,
                submittedAt: verification.submittedAt,
                reviewedAt: verification.reviewedAt,
                rejectionReason: verification.rejectionReason,
              }
            : null
        }
      />
    </div>
  );
}
