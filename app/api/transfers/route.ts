import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { NFT } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { tokenId, contractAddress, from, to, txHash } = await request.json();

    if (!tokenId || !contractAddress || !from || !to || !txHash) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update NFT owner in database
    const updatedNFT = await NFT.findOneAndUpdate(
      {
        tokenId: tokenId,
        contractAddress: contractAddress,
      },
      {
        owner: to.toLowerCase(),
      },
      { new: true }
    );

    if (!updatedNFT) {
      return NextResponse.json(
        { success: false, error: "NFT not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "NFT ownership transferred successfully",
        nft: updatedNFT,
      },
    });
  } catch (error) {
    console.error("Error processing transfer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process transfer" },
      { status: 500 }
    );
  }
}
