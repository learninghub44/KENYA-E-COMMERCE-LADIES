import { NextResponse } from "next/server";
import { createSupabaseClient } from "../../../../lib/supabase/server";
import { createSupabaseKycRepository } from "../../../../lib/kyc/supabase-kyc-repository";
import { createKycService } from "../../../../lib/kyc/kyc-service";
import { createDiditProvider } from "../../../../lib/kyc/didit-provider";
import { createDiditClient } from "../../../../lib/didit";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const submitBody = { ...body, userId: user.id };

    const repository = createSupabaseKycRepository(supabase);
    const diditClient = process.env.DIDIT_API_KEY && process.env.DIDIT_WORKFLOW_ID
      ? createDiditClient({
          apiKey: process.env.DIDIT_API_KEY,
          workflowId: process.env.DIDIT_WORKFLOW_ID,
        })
      : null;
    const provider = createDiditProvider(diditClient);
    const service = createKycService({ repository, provider });

    const result = await service.submit(submitBody);

    if (!result.ok) {
      return NextResponse.json({ error: result.message, code: result.code }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
