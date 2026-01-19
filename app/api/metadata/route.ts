import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();

    // Validate metadata
    if (!metadata.name || !metadata.image) {
      return NextResponse.json(
        { success: false, error: "Missing required metadata fields" },
        { status: 400 }
      );
    }

    // Create JSON string and convert to buffer
    const metadataJson = JSON.stringify(metadata);
    const buffer = Buffer.from(metadataJson, "utf-8");

    // Upload to Cloudinary as raw file
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "nft-metadata",
            resource_type: "raw",
            public_id: `metadata-${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Error uploading metadata:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload metadata" },
      { status: 500 }
    );
  }
}
