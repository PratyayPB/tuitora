import { NextResponse } from "next/server";
import { DIBRUGARH_AREAS } from "@/lib/constants";

export async function GET() {
  return NextResponse.json(DIBRUGARH_AREAS);
}
