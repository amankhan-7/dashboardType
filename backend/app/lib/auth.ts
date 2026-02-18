// lib/auth.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAccessToken } from "./jwt";
import jwt from "jsonwebtoken";

export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "NO_TOKEN" },
        { status: 401 }
      ),
    };
  }

  try {
    const { userId } = verifyAccessToken(token);
    return { userId };
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      return {
        error: NextResponse.json(
          { error: "TOKEN_EXPIRED" },
          { status: 401 }
        ),
      };
    }

    return {
      error: NextResponse.json(
        { error: "INVALID_TOKEN" },
        { status: 401 }
      ),
    };
  }
}
