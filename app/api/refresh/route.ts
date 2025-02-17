import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/lib/db";

const secret = process.env.JWT_SECRET || "secret";

export async function POST(req: Request) {
  try {
    // Extract refreshToken from request body
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh Token required" },
        { status: 401 }
      );
    }

    // Check if refreshToken exists in DB
    const user = await query("SELECT * FROM users WHERE refresh_token = $1", [
      refreshToken,
    ]);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Invalid Refresh Token" },
        { status: 403 }
      );
    }

    // Verify Refresh Token
    const decoded = jwt.verify(refreshToken, secret);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or Expired Refresh Token" },
        { status: 403 }
      );
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { id: user[0].id, email: user[0].email },
      secret,
      { expiresIn: "15m" }
    );
    const newRefreshToken = jwt.sign({ id: user[0].id }, secret, {
      expiresIn: "7d",
    });

    // Update refresh token in DB
    await query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      newRefreshToken,
      user[0].id,
    ]);

    return NextResponse.json({
      newAccessToken,
      newRefreshToken,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
