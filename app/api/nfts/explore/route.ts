import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { NFT } from "@/lib/models";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Fetch all NFTs, optionally filtered by listed status
        const { searchParams } = new URL(request.url);
        const listedOnly = searchParams.get("listed") === "true";

        const query = listedOnly ? { listed: true } : {};

        const nfts = await NFT.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: nfts });
    } catch (error) {
        console.error("Error fetching explore NFTs:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch NFTs" },
            { status: 500 }
        );
    }
}
