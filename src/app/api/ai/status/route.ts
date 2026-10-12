import { NextResponse } from "next/server";
import { aiConfig } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

/** Informa ao frontend se a IA está conectada ou em modo demonstração. */
export function GET() {
  return NextResponse.json({ mode: aiConfig.mode }, { headers: { "Cache-Control": "no-store" } });
}
