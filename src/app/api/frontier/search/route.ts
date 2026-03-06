import { NextResponse } from "next/server";

import { getFrontierOrigins, searchFrontierRoutes } from "@/lib/frontier-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("origin");
    const date = searchParams.get("date");

    if (!slug || !date) {
      return NextResponse.json({ error: "Missing origin or date" }, { status: 400 });
    }

    const origins = await getFrontierOrigins();
    const origin = origins.find((item) => item.slug === slug);

    if (!origin) {
      return NextResponse.json({ error: "Unknown origin" }, { status: 404 });
    }

    const data = await searchFrontierRoutes(origin, date);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown search error";

    return NextResponse.json(
      { error: message },
      { status: message.includes("blackout") ? 400 : 500 },
    );
  }
}
