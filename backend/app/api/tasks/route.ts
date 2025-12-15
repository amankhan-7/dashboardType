import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../lib/db";
import Task from "../../models/Task";
import { verifyToken } from "../../lib/jwt";
import { taskSchema } from "../../lib/validators";

/* ---------- GET TASKS ---------- */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    ({ userId } = verifyToken(token));
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await connectDB();
  const tasks = await Task.find({ userId });

  return NextResponse.json(tasks);
}

/* ---------- CREATE TASK ---------- */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    ({ userId } = verifyToken(token));
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = taskSchema.parse(await req.json());

  await connectDB();
  const task = await Task.create({ ...body, userId });

  return NextResponse.json(task, { status: 201 });
}
