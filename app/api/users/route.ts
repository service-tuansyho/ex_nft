import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Upsert user: create if not exists
    const user = await User.findOneAndUpdate(
      { address: address.toLowerCase() },
      { address: address.toLowerCase() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create/update user" },
      { status: 500 }
    );
  }
}
