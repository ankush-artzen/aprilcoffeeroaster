import { getAdviceDetail } from "lib/advice/get-advice-detail";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;

  try {
    const item = await getAdviceDetail(slug);

    if (!item) {
      return NextResponse.json({ error: "Advice not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch advice item" },
      { status: 502 },
    );
  }
}
