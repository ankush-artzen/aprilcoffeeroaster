import { getPartnersFeed } from "lib/cms/partners";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor");
    const data = await getPartnersFeed({ cursor });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch partners feed" },
      { status: 502 },
    );
  }
}
