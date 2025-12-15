// app/health/route.ts
import { NextResponse } from "next/server";


export async function GET() {
return NextResponse.json({ status: "ok", message: "Backend is running" });
}