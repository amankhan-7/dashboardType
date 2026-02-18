import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../lib/db";
import Task from "../../models/Task";
import { verifyAccessToken } from "../../lib/jwt";
import { taskSchema } from "../../lib/validators";
import { requireUser } from "../../lib/auth";
import { withCors, handlePreflight } from "../../lib/cors";

export async function OPTIONS() {
  return handlePreflight();
}

/* ---------- GET TASKS ---------- */
export async function GET() {

  const { userId, error } = await requireUser();
  if (error) return error; // early return if unauthorized

  await connectDB();
  const tasks = await Task.find({ userId });

  return withCors(NextResponse.json(tasks));
}

/* ---------- CREATE TASK ---------- */
export async function POST(req: Request) {

  const { userId, error } = await requireUser();
  if (error) return error; // early return if unauthorized
  const body = taskSchema.parse(await req.json());

  await connectDB();
  const task = await Task.create({ ...body, userId });

  return withCors(NextResponse.json(task, { status: 201 }));
}
