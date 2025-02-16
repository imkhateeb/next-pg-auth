import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const config = {
  matcher: "/api/protected/:path*",
  runtime: "nodejs",
};

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.log("ERROR", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
}
