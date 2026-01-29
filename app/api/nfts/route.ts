import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { NFT } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");

    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Owner address is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const nfts = await NFT.find({ owner: owner.toLowerCase() }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, data: nfts });
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      tokenId,
      contractAddress,
      owner,
      name,
      description,
      image,
      price,
      listed,
    } = await request.json();

    if (!tokenId || !contractAddress || !owner || !name || !image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const nft = new NFT({
      tokenId,
      contractAddress,
      owner: owner.toLowerCase(),
      name,
      description,
      image,
      price: price || 0,
      listed: listed || false,
    });

    await nft.save();

    return NextResponse.json({ success: true, data: nft });
  } catch (error) {
    console.error("Error creating NFT:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create NFT" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { tokenId, contractAddress, price, listed } = await request.json();

    if (!tokenId || !contractAddress) {
      return NextResponse.json(
        { success: false, error: "tokenId and contractAddress are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const update: any = {};
    if (typeof price !== "undefined") update.price = price;
    if (typeof listed !== "undefined") update.listed = listed;

    const nft = await NFT.findOneAndUpdate(
      { tokenId: tokenId.toString(), contractAddress },
      { $set: update },
      { new: true }
    );

    if (!nft) {
      return NextResponse.json(
        { success: false, error: "NFT not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: nft });
  } catch (error) {
    console.error("Error updating NFT:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update NFT" },
      { status: 500 }
    );
  }
}
