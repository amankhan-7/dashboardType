import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { hashPassword } from "../../../utils/hash";
import { registerSchema } from "../../../lib/validators";

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password } = registerSchema.parse(await req.json());

  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json(
      { message: "User exists" },
      { status: 400 }
    );
  }

  await User.create({
    name,
    email,
    password: await hashPassword(password),
  });

  return NextResponse.json(
    { message: "Registered" },
    { status: 201 }
  );
}
