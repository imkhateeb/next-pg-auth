import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await query("SELECT * FROM users WHERE id = " + params.id);
    return NextResponse.json(user[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Failed to fetch user",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email } = await req.json();
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 }
      );
    }

    const updatedUser = await query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, params.id]
    );

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await query("DELETE FROM users WHERE id = $1", [params.id]);
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
  }
}
