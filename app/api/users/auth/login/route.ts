import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";
import { z } from "zod";

// Define Zod schema
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Check if user exists
    const user = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const secret = process.env.JWT_SECRET || "secret";

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user[0].id, email: user[0].email },
      secret,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign({ id: user[0].id }, secret, {
      expiresIn: "7d",
    });

    // Store refresh token in DB
    await query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user[0].id,
    ]);

    return NextResponse.json({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
