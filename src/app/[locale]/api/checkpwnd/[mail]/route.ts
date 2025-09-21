import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mail: string }> }
) {
  try {
    const { mail } = await context.params;
    const decoded = decodeURIComponent(mail || "").trim();
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Missing email" }, { status: 400 });
    }

    const res = await fetch(`https://leakcheck.io/api/public?check=${encodeURIComponent(decoded)}`);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (_error) {
    console.error("/api/checkpwnd error", _error);
    return NextResponse.json({ error: "An error occurred, please try again later." }, { status: 500 });
  }
}
