// api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/db";
import Task from "../../../models/Task";
import { requireUser } from "../../../lib/auth";
import { taskUpdateSchema } from "../../../lib/validators";
import { withCors, handlePreflight } from "../../../lib/cors";

export async function OPTIONS() {
  return handlePreflight();
}

/* ---------- UPDATE TASK ---------- */
export async function PATCH(req: Request, context: any) {

    const params = await context.params; 
  const { id } = params;
  
  // Ensure user is authenticated
  const { userId, error } = await requireUser();
  if (error) return error;

//   console.log("PATCH id:", id);
// console.log("userId from auth:", userId);
// const taskInDb = await Task.findById(id);
// console.log("Task in DB:", taskInDb);


  // Parse and validate incoming data
  const body = await req.json();
  const parsedData = taskUpdateSchema.parse(body);

  if (Object.keys(parsedData).length === 0) {
    return withCors(NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    ));
  }

  await connectDB();

  // Update task partially
  const task = await Task.findOneAndUpdate(
    { _id: id, userId: new mongoose.Types.ObjectId(userId) },
    { $set: parsedData },
    { new: true, runValidators: true }
  );

  if (!task) {
    return withCors(NextResponse.json(
      { error: "Task not found or not owned by user" },
      { status: 404 }
    ));
  }

  return withCors(NextResponse.json(task));
}

/* ---------- DELETE TASK ---------- */
export async function DELETE(req: Request, context: any) {
     const params = await context.params; 
  const { id } = params;

  const { userId, error } = await requireUser();
  if (error) return error;

  await connectDB();

  const deleted = await Task.findOneAndDelete({
    _id: id,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!deleted) {
    return withCors(NextResponse.json({ error: "Task not found or not owned by user" }, { status: 404 }));
  }

  return withCors(NextResponse.json({ message: "Deleted" }));
}
