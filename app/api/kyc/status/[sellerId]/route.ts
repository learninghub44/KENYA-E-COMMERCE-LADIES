import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../../lib/supabase/server";
import { createSupabaseKycRepository } from "../../../../../lib/kyc/supabase-kyc-repository";
import { createKycService } from "../../../../../lib/kyc/kyc-service";
import { createDiditProvider } from "../../../../../lib/kyc/didit-provider";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sellerId } = await params;

    const repository = createSupabaseKycRepository(supabase);
    const provider = createDiditProvider(null);
    const service = createKycService({ repository, provider });

    const result = await service.getStatus(sellerId, user.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.message, code: result.code }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
